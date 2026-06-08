import React, { memo, useMemo } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TaskSubmission } from "@/lib/roadmap/types";
import { useSubmissionDetail } from "@/hooks/roadmap/useTaskSubmissions";
import { useRoadmapDocuments } from "@/hooks/roadmaps/useRoadmaps";

interface Props {
    /** Pass the full submission object for inline display, or submissionId for lazy loading. */
    submission?: TaskSubmission;
    submissionId?: string;
    onClose?: () => void;
    /** When true, the internal header (back button, title, status pill) is hidden — useful when the parent screen provides its own header. */
    hideHeader?: boolean;
    roadmapId?: string;
    nestedRoadMapItemId?: string;
    userId?: string;
}

const STATUS_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
    submitted: { icon: "paper-plane-outline", color: "#3B82F6", label: "Submitted" },
    reviewed: { icon: "checkmark-done-outline", color: "#8B5CF6", label: "Reviewed" },
    approved: { icon: "checkmark-circle-outline", color: "#22C55E", label: "Approved" },
    needs_revision: { icon: "alert-circle-outline", color: "#F59E0B", label: "Needs Revision" },
    resubmitted: { icon: "refresh-outline", color: "#F97316", label: "Resubmitted" },
};

function formatSubmissionDate(dateStr?: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatReadOnlyValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "No response provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
}

function UploadResponseField({
    name,
    value,
    roadmapId,
    nestedRoadMapItemId,
    userId,
}: {
    name: string;
    value: any;
    roadmapId?: string;
    nestedRoadMapItemId?: string;
    userId?: string;
}) {
    const { data: docs = [] } = useRoadmapDocuments(
        roadmapId,
        nestedRoadMapItemId,
        userId,
        name,
    );

    if (!value && docs.length === 0) {
        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{name}</Text>
                <View style={styles.readOnlyValue}>
                    <Ionicons name="document-attach-outline" size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.readOnlyValueText}>No file uploaded</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{name}</Text>
            {docs.map((doc: any) => {
                const fileType = String(doc.fileType ?? "").toLowerCase();
                const isImage = fileType.startsWith("image/") ||
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(String(doc.fileName ?? ""));

                if (isImage && doc.fileUrl) {
                    return (
                        <Pressable
                            key={doc._id}
                            onPress={() => Linking.openURL(doc.fileUrl)}
                            style={styles.imagePreviewWrap}
                        >
                            <Image
                                source={{ uri: doc.fileUrl }}
                                style={styles.imagePreview}
                                resizeMode="cover"
                            />
                        </Pressable>
                    );
                }

                return (
                    <Pressable
                        key={doc._id}
                        onPress={() => Linking.openURL(doc.fileUrl)}
                        style={styles.fileRow}
                    >
                        <Ionicons name="document-attach-outline" size={16} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.fileNameText} numberOfLines={1}>
                            {doc.fileName || "File"}
                        </Text>
                        <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.4)" />
                    </Pressable>
                );
            })}
            {docs.length === 0 && value && (
                <View style={styles.readOnlyValue}>
                    <Ionicons name="document-attach-outline" size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.readOnlyValueText}>File uploaded</Text>
                </View>
            )}
        </View>
    );
}

const ResponseField = memo(function ResponseField({
    response,
    roadmapId,
    nestedRoadMapItemId,
    userId,
}: {
    response: { type?: string; name: string; value?: any; signatureData?: string };
    roadmapId?: string;
    nestedRoadMapItemId?: string;
    userId?: string;
}) {
    const type = response.type ?? "TEXT_FIELD";
    const value = type === "SIGNATURE" ? response.signatureData : response.value;

    if (type === "TEXT_DISPLAY") {
        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.displayText}>{response.name}</Text>
            </View>
        );
    }

    if (type === "CHECKBOX") {
        return (
            <View style={styles.fieldContainer}>
                <View style={styles.checkboxRow}>
                    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                        {value && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>{response.name}</Text>
                </View>
            </View>
        );
    }

    if (type === "UPLOAD") {
        return (
            <UploadResponseField
                name={response.name}
                value={value}
                roadmapId={roadmapId}
                nestedRoadMapItemId={nestedRoadMapItemId}
                userId={userId}
            />
        );
    }

    if (type === "SIGNATURE") {
        const signatureUri = value;
        const hasSignature = !!signatureUri;
        return (
            <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{response.name}</Text>
                {hasSignature ? (
                    <Pressable
                        onPress={() => Linking.openURL(signatureUri)}
                        style={styles.imagePreviewWrap}
                    >
                        <Image
                            source={{ uri: signatureUri }}
                            style={styles.signaturePreview}
                            resizeMode="contain"
                        />
                    </Pressable>
                ) : (
                    <View style={styles.readOnlyValue}>
                        <Ionicons name="pencil-outline" size={14} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.readOnlyValueText}>No signature</Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{response.name}</Text>
            <View style={styles.readOnlyValue}>
                <Text style={styles.readOnlyValueText}>
                    {formatReadOnlyValue(value)}
                </Text>
            </View>
        </View>
    );
});

export const SubmissionDetailView = memo(function SubmissionDetailView({
    submission: submissionProp,
    submissionId,
    onClose,
    hideHeader,
    roadmapId,
    nestedRoadMapItemId,
    userId,
}: Props) {
    const { data: fetchedSubmission, isLoading } = useSubmissionDetail(
        !submissionProp ? submissionId : undefined,
    );

    const submission = submissionProp ?? fetchedSubmission;

    const cfg = useMemo(() => {
        if (!submission) return STATUS_CONFIG.submitted;
        return STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.submitted;
    }, [submission]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Loading submission…</Text>
            </View>
        );
    }

    if (!submission) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={28} color="rgba(255,255,255,0.5)" />
                <Text style={styles.errorText}>Submission not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!hideHeader && (
                <>
                    {}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            {onClose && (
                                <Pressable onPress={onClose} hitSlop={10} style={styles.backBtn}>
                                    <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.9)" />
                                </Pressable>
                            )}
                            <Text style={styles.headerTitle}>
                                Submission #{submission.submissionNumber}
                            </Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: `${cfg.color}20` }]}>
                            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                            <Text style={[styles.statusPillText, { color: cfg.color }]}>
                                {cfg.label}
                            </Text>
                        </View>
                    </View>

                    {}
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.metaText}>
                            {formatSubmissionDate(submission.submittedAt)}
                        </Text>
                    </View>
                </>
            )}

            {submission.reviewNotes ? (
                <View style={styles.reviewNotesCard}>
                    <View style={styles.reviewNotesHeader}>
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color="#F59E0B" />
                        <Text style={styles.reviewNotesTitle}>Review Notes</Text>
                    </View>
                    <Text style={styles.reviewNotesText}>{submission.reviewNotes}</Text>
                </View>
            ) : null}

            {}
            <View style={styles.readOnlyBanner}>
                <Ionicons name="lock-closed-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.readOnlyBannerText}>
                    This is a read-only snapshot of the submission.
                </Text>
            </View>

            {}
            {(submission.responses ?? []).map((response: any, index: number) => (
                <ResponseField
                    key={`${response.name}-${index}`}
                    response={response}
                    roadmapId={roadmapId ?? submission.roadMapId}
                    nestedRoadMapItemId={nestedRoadMapItemId ?? submission.nestedRoadMapItemId}
                    userId={userId ?? submission.submittedBy}
                />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        gap: 8,
    },
    loadingText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
    },
    errorText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "800",
    },
    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: "700",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 16,
    },
    metaText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        fontWeight: "500",
    },
    reviewNotesCard: {
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.15)",
    },
    reviewNotesHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
    },
    reviewNotesTitle: {
        color: "#F59E0B",
        fontSize: 13,
        fontWeight: "700",
    },
    reviewNotesText: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 13,
        lineHeight: 20,
    },
    readOnlyBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    readOnlyBannerText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        fontWeight: "600",
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
    },
    readOnlyValue: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    readOnlyValueText: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 14,
        flex: 1,
    },
    displayText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 13,
        lineHeight: 20,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: "rgba(34, 197, 94, 0.3)",
        borderColor: "#22C55E",
    },
    checkmark: {
        color: "#22C55E",
        fontSize: 13,
        fontWeight: "800",
    },
    checkboxLabel: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 14,
        flex: 1,
    },
    imagePreviewWrap: {
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    imagePreview: {
        width: "100%",
        height: 200,
        borderRadius: 12,
    },
    signaturePreview: {
        width: "100%",
        height: 120,
        borderRadius: 12,
        backgroundColor: "#fff",
    },
    fileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    fileNameText: {
        color: "rgba(255,255,255,0.75)",
        fontSize: 13,
        flex: 1,
    },
});
