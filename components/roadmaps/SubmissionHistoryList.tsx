import React, { memo, useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ExtrasResponseDto, TaskSubmission } from "@/lib/roadmap/types";
import { resolveUploadedDocumentsForVersion } from "@/lib/roadmap/helpers";
import { useTaskSubmissions } from "@/hooks/roadmap/useTaskSubmissions";

interface Props {
    roadMapId: string;
    nestedRoadMapItemId: string;
    userId: string;
    onSelectSubmission: (submission: TaskSubmission) => void;
    latestSubmissionId?: string;
    /** Legacy extras — used to show a synthetic Submission #1 when the submissions API has no data yet. */
    legacyExtras?: ExtrasResponseDto | null;
}

const STATUS_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
    submitted: { icon: "paper-plane-outline", color: "#34D399", label: "Submitted" },
    reviewed: { icon: "checkmark-done-outline", color: "#A78BFA", label: "Reviewed" },
    approved: { icon: "checkmark-circle-outline", color: "#34D399", label: "Approved" },
    needs_revision: { icon: "alert-circle-outline", color: "#FBBF24", label: "Needs Revision" },
    resubmitted: { icon: "refresh-outline", color: "#FCD34D", label: "Resubmitted" },
};

function getSubmissionLabel(sub: TaskSubmission): string {
    if (sub.submissionNumber === 1) return "Original Submission";
    return "Resubmitted";
}

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

/**
 * Builds synthetic TaskSubmission(s) from legacy extras data.
 *
 * The old PATCH system appended duplicate field names on every save.
 * e.g. [Notes:"Hii", Notes:"Hello", Notes:"Helloww"]
 *
 * We detect duplicates and split them into separate "submissions":
 * - Submission #1 = first occurrence of each field
 * - Submission #2 = second occurrence of each field (if any)
 * - etc.
 */
function buildLegacySubmissions(extras: ExtrasResponseDto): TaskSubmission[] {
    const allExtras = (extras.extras ?? []).filter(
        (e: any) => e.name && e.type !== "JUMPSTART_COMPLETE",
    );

    if (allExtras.length === 0) return [];

    
    const byName = new Map<string, any[]>();
    for (const e of allExtras) {
        const key = e.name;
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key)!.push(e);
    }

    // How many "versions" exist = max duplicate count across all field names
    const maxVersions = Math.max(...Array.from(byName.values()).map((arr) => arr.length));

    const submissions: TaskSubmission[] = [];
    const createdMs = new Date(String(extras.createdAt ?? "")).getTime();
    const updatedMs = new Date(String(extras.updatedAt ?? "")).getTime();

    for (let i = 0; i < maxVersions; i++) {
        const responses: any[] = [];
        for (const [, entries] of byName) {
            const entry = entries[i] ?? entries[entries.length - 1];
            responses.push({
                type: entry.type ?? "TEXT_FIELD",
                name: entry.name ?? "",
                value: entry.value,
                signatureData: entry.signatureData,
            });
        }

        // Estimate submission time: spread evenly between created and updated
        let submittedAt: string;
        if (maxVersions === 1) {
            submittedAt = String(extras.createdAt ?? "");
        } else {
            const fraction = i / (maxVersions - 1);
            const ts = createdMs + fraction * (updatedMs - createdMs);
            submittedAt = Number.isNaN(ts) ? String(extras.createdAt ?? "") : new Date(ts).toISOString();
        }

        const isOriginal = i === 0;
        const isLatest = i === maxVersions - 1;

        submissions.push({
            _id: `legacy-${extras.id ?? "1"}-v${i + 1}`,
            roadMapId: extras.roadMapId,
            nestedRoadMapItemId: extras.nestedRoadMapItemId,
            submittedBy: extras.userId,
            submissionNumber: i + 1,
            status: isLatest && maxVersions > 1 ? "resubmitted" : "submitted",
            responses,
            uploadedDocuments: resolveUploadedDocumentsForVersion(
                extras.uploadedDocuments,
                i + 1,
            ),
            resubmittedFromSubmissionId: isOriginal ? null : `legacy-${extras.id ?? "1"}-v${i}`,
            submittedAt,
            createdAt: String(extras.createdAt ?? ""),
            updatedAt: String(extras.updatedAt ?? ""),
        });
    }

    return submissions;
}

const SubmissionRow = memo(function SubmissionRow({
    submission,
    total,
    isLatest,
    onPress,
}: {
    submission: TaskSubmission;
    total: number;
    isLatest: boolean;
    onPress: () => void;
}) {
    const cfg = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.submitted;
    const label = getSubmissionLabel(submission);

    return (
        <Pressable style={styles.row} onPress={onPress}>
            <View style={styles.rowLeft}>
                <View style={[styles.numberBadge, isLatest && styles.numberBadgeLatest]}>
                    <Text style={[styles.numberText, isLatest && styles.numberTextLatest]}>
                        #{submission.submissionNumber}
                    </Text>
                </View>
                <View style={styles.rowInfo}>
                    <View style={styles.rowTitleRow}>
                        <Text style={styles.rowTitle}>
                            Submission #{submission.submissionNumber}
                        </Text>
                        {isLatest && (
                            <View style={styles.latestPill}>
                                <Text style={styles.latestPillText}>Latest</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.statusRow}>
                        <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                        <Text style={[styles.statusText, { color: cfg.color }]}>
                            {label}
                        </Text>
                    </View>
                    <Text style={styles.dateText}>
                        {formatSubmissionDate(submission.submittedAt)}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
        </Pressable>
    );
});

export const SubmissionHistoryList = memo(function SubmissionHistoryList({
    roadMapId,
    nestedRoadMapItemId,
    userId,
    onSelectSubmission,
    latestSubmissionId,
    legacyExtras,
}: Props) {
    const { data: submissions, isLoading } = useTaskSubmissions(
        roadMapId,
        nestedRoadMapItemId,
        userId,
    );

    const sorted = useMemo(() => {
        // If the API returned real submissions, use those
        if (submissions && submissions.length > 0) {
            return [...submissions].sort(
                (a, b) => b.submissionNumber - a.submissionNumber,
            );
        }
        
        if (legacyExtras) {
            const legacy = buildLegacySubmissions(legacyExtras);
            return legacy.sort((a, b) => b.submissionNumber - a.submissionNumber);
        }
        return [];
    }, [submissions, legacyExtras]);

    const renderItem = useCallback(
        ({ item }: { item: TaskSubmission }) => (
            <SubmissionRow
                submission={item}
                total={sorted.length}
                isLatest={
                    item._id === latestSubmissionId ||
                    item.submissionNumber === sorted[0]?.submissionNumber
                }
                onPress={() => onSelectSubmission(item)}
            />
        ),
        [sorted, latestSubmissionId, onSelectSubmission],
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Loading submissions…</Text>
            </View>
        );
    }

    if (!sorted.length) {
        return (
            <View style={styles.center}>
                <Ionicons name="document-text-outline" size={28} color="rgba(255,255,255,0.4)" />
                <Text style={styles.emptyText}>No submissions yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.headerText}>Submission History</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{sorted.length}</Text>
                </View>
            </View>
            <FlatList
                data={sorted}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                scrollEnabled={false}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    headerText: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 15,
        fontWeight: "700",
        flex: 1,
    },
    countBadge: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 12,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    numberBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        justifyContent: "center",
        alignItems: "center",
    },
    numberBadgeLatest: {
        backgroundColor: "rgba(59, 130, 246, 0.2)",
    },
    numberText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        fontWeight: "800",
    },
    numberTextLatest: {
        color: "#60A5FA",
    },
    rowInfo: {
        flex: 1,
        gap: 3,
    },
    rowTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rowTitle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    latestPill: {
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    latestPillText: {
        color: "#60A5FA",
        fontSize: 10,
        fontWeight: "800",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "700",
    },
    dateText: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 12,
        fontWeight: "500",
    },
    center: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
        gap: 8,
    },
    loadingText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
    },
    emptyText: {
        color: "rgba(255,255,255,0.45)",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 4,
    },
});
