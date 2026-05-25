import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { useAssessmentProgress } from "@/hooks/progress/useProgress";
import {
    useCreateRoadmapExtras,
    useDeleteRoadmapDocument,
    useRoadmapDocuments,
    useRoadmapExtrasWithFallback,
    useUpdateRoadmapExtras,
    useUploadRoadmapDocument,
} from "@/hooks/roadmaps/useRoadmaps";
import {
    getEffectiveTaskExtras,
    normalizeNestedTaskStatus,
    parseRoadmapTimestampMs,
    savedExtrasToFormValues,
} from "@/lib/roadmap/helpers";
import {
    readTaskCompletionTimestamps,
    recordTaskCompletionTimestamp,
    taskCompletionMapKey,
} from "@/lib/roadmap/taskCompletionTimestamps";

import { SignatureModal } from "@/components/forms/SignatureModal";
import { Extra, NestedRoadmap, Roadmap } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format, isValid, parse } from "date-fns";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated as RNAnimated,
    BackHandler,
    Image,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import RNFS from "react-native-fs";

interface Props {
    task: NestedRoadmap;
    /** Parent roadmap — used when form fields are defined at phase level (e.g. Jumpstart). */
    parentRoadmap?: Roadmap | null;
    phaseId?: string;
    itemId?: string;
    userId?: string; // Target user (mentee)
    /** When provided, called after a successful save instead of showing the default modal + router.back(). */
    onSaveSuccess?: () => void;
}

export function MentorTaskView({
    task,
    parentRoadmap,
    phaseId: roadmapId,
    itemId,
    userId,
    onSaveSuccess,
}: Props) {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();

    const targetUserId = userId;

    /** Mentor reviewing a pastor's work — single source of truth for read-only UX. */
    const isViewingPastor = Boolean(
        userId && currentUser?.id && String(userId) !== String(currentUser.id),
    );

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [pendingFiles, setPendingFiles] = useState<Record<string, { id: string; uri: string; name: string; type: string }[]>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeDateField, setActiveDateField] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<{ visible: boolean; uri: string | null }>({
        visible: false,
        uri: null,
    });
    const [signatureEditor, setSignatureEditor] = useState<{ visible: boolean; fieldName: string | null }>({
        visible: false,
        fieldName: null,
    });

    const isValidObjectId = (id: string | undefined) => !!id;

    const parseAnyDate = (raw?: string): Date | null => {
        const v = String(raw ?? "").trim();
        if (!v) return null;

        // 1) ISO-like: 2026-05-08
        const iso = parse(v, "yyyy-MM-dd", new Date());
        if (isValid(iso) && v.length >= 10 && v[4] === "-" && v[7] === "-") return iso;

        // 2) Legacy: DD / MM / YY
        const legacy = parse(v, "dd / MM / yy", new Date());
        if (isValid(legacy)) return legacy;

        // 3) Fallback to Date parsing (API may return full ISO)
        const d = new Date(v);
        return isValid(d) ? d : null;
    };

    const formatForApi = (d: Date) => format(d, "yyyy-MM-dd");
    const formatForUi = (d: Date) => format(d, "dd MMM yyyy");

    const ensureUrlScheme = (url: string) => {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return `https://${url}`;
        }
        return url;
    };

    const formatFileName = (rawName: string): string => {
        const decoded = decodeURIComponent(rawName || "").trim();
        if (!decoded) return "Untitled file";
        if (decoded.length <= 44) return decoded;
        const start = decoded.slice(0, 18);
        const end = decoded.slice(-18);
        return `${start}…${end}`;
    };

    const renderNumberedText = (value: string) => {
        const lines = String(value || "")
            .split(/\r?\n+/)
            .map(l => l.trim())
            .filter(Boolean);

        const numbered = lines
            .map((line) => {
                const match = line.match(/^(\d+)\s*[\)\.:-]\s*(.+)$/);
                return match ? { n: match[1], text: match[2].trim() } : null;
            })
            .filter(Boolean) as Array<{ n: string; text: string }>;

        if (numbered.length >= 2) {
            return (
                <View style={styles.numberList}>
                    {numbered.map((item) => (
                        <View key={`${item.n}-${item.text.slice(0, 10)}`} style={styles.numberRow}>
                            <View style={styles.numberBadge}>
                                <Text style={styles.numberBadgeText}>{item.n}</Text>
                            </View>
                            <Text style={styles.numberRowText}>{item.text}</Text>
                        </View>
                    ))}
                </View>
            );
        }

        return <Text style={styles.textDisplayTextLeft}>{String(value)}</Text>;
    };

    /** Load existing extras from API */
    const { data: existingExtras, isLoading: isLoadingExtras, isFetching: isFetchingExtras } =
        useRoadmapExtrasWithFallback(
            isValidObjectId(roadmapId) ? roadmapId : undefined,
            isValidObjectId(itemId) ? itemId : undefined,
            isValidObjectId(targetUserId) ? targetUserId : undefined,
        );

    const effectiveExtras = useMemo(
        () => getEffectiveTaskExtras(task, parentRoadmap, existingExtras?.extras),
        [task, parentRoadmap, existingExtras?.extras],
    );

    const createExtras = useCreateRoadmapExtras();
    const updateExtras = useUpdateRoadmapExtras();
    const uploadDocument = useUploadRoadmapDocument();
    const deleteDocument = useDeleteRoadmapDocument();
    const { data: assessmentProgress } = useAssessmentProgress(targetUserId);

    const isUpdateMode = !!existingExtras;
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showResubmitToast, setShowResubmitToast] = useState(false);
    const toastOpacity = useRef(new RNAnimated.Value(0)).current;

    /** Pastor viewing their own saved work — fields are read-only until they tap Edit. */
    const isReadOnly = isViewingPastor || (isUpdateMode && !isEditing);

    const confirmDiscardEdit = useCallback(() => {
        if (!isDirty) {
            setIsEditing(false);
            return;
        }
        Alert.alert(
            "Discard your changes?",
            "You have unsaved edits that will be lost.",
            [
                { text: "Continue Editing", style: "cancel" },
                {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => {
                        setIsEditing(false);
                        setIsDirty(false);
                    },
                },
            ],
        );
    }, [isDirty]);

    useEffect(() => {
        if (!isEditing || !isDirty) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            confirmDiscardEdit();
            return true;
        });
        return () => sub.remove();
    }, [isEditing, isDirty, confirmDiscardEdit]);

    const showToast = useCallback(() => {
        setShowResubmitToast(true);
        RNAnimated.sequence([
            RNAnimated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            RNAnimated.delay(2000),
            RNAnimated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => {
            setShowResubmitToast(false);
            setIsEditing(false);
            setIsDirty(false);
        });
    }, [toastOpacity]);

    /** Initialise formData from API or default dates */
    useEffect(() => {
        const init: Record<string, any> = {};
        
        // 1. Load defaults from task definition
        effectiveExtras.forEach((extra) => {
            if (extra.date) init[extra.name] = extra.date;
        });

        Object.assign(init, savedExtrasToFormValues(existingExtras?.extras));
        
        setFormData(init);
    }, [existingExtras, effectiveExtras]);

    /** Seed completion time from last save when task is already completed (fixes list dates). */
    useEffect(() => {
        if (!roadmapId || !itemId || !targetUserId) return;
        if (normalizeNestedTaskStatus(task.status) !== "completed") return;

        const extrasUpdatedMs = parseRoadmapTimestampMs(
            (existingExtras as { updatedAt?: string | Date } | undefined)?.updatedAt,
        );
        if (extrasUpdatedMs <= 0) return;

        (async () => {
            const stored = await readTaskCompletionTimestamps(targetUserId);
            const key = taskCompletionMapKey(roadmapId, itemId);
            if (stored[key]) return;
            await recordTaskCompletionTimestamp(targetUserId, roadmapId, itemId, extrasUpdatedMs);
        })();
    }, [existingExtras, task.status, roadmapId, itemId, targetUserId]);

    const handleChange = (fieldName: string, value: any) => {
        if (isReadOnly) return;
        if (isEditing) setIsDirty(true);
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const formatReadOnlyText = (value: unknown): string => {
        if (value === null || value === undefined || value === "") {
            return "No response provided";
        }
        if (typeof value === "boolean") return value ? "Yes" : "No";
        return String(value);
    };

    const renderFieldLabel = (name: string) => (
        <Text style={styles.fieldLabel}>{name}</Text>
    );

    const validateForm = () =>
        Object.keys(formData).length > 0 ||
        Object.values(pendingFiles).some((files) => files.length > 0);

    const downloadSignature = async (signatureValue: string) => {
        try {
            if (!signatureValue?.startsWith("data:image")) {
                Alert.alert("Error", "Signature data is not a valid image.");
                return;
            }

            const perm = await MediaLibrary.requestPermissionsAsync();
            if (!perm.granted) {
                Alert.alert(
                    "Permission Required",
                    "Please allow access to your media library to save the signature."
                );
                return;
            }

            let prefix = "";
            let ext = "png";
            if (signatureValue.startsWith("data:image/png")) {
                prefix = "data:image/png;base64,";
                ext = "png";
            } else if (signatureValue.startsWith("data:image/jpeg")) {
                prefix = "data:image/jpeg;base64,";
                ext = "jpg";
            } else if (signatureValue.startsWith("data:image/jpg")) {
                prefix = "data:image/jpg;base64,";
                ext = "jpg";
            }

            const base64Data = prefix ? signatureValue.substring(prefix.length) : signatureValue;
            const filePath = `${RNFS.CachesDirectoryPath}/pastor_signature_${Date.now()}.${ext}`;

            await RNFS.writeFile(filePath, base64Data, "base64");

            const fileUri = `file://${filePath}`;
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.createAlbumAsync("CCC Signatures", asset, false);

            Alert.alert("Success", "Signature saved to your device.");
        } catch (err: any) {
            console.error("Failed to save signature", err);
            Alert.alert("Error", "Could not save the signature. Please try again.");
        }
    };

    /** Infer extra type – used when building payload */
    const getExtraType = (fieldName: string, value: any): string => {
        const extraDef = effectiveExtras.find((e) => e.name === fieldName);
        if (extraDef) return extraDef.type;

        if (typeof value === "boolean") return "CHECKBOX";
        if (typeof value === "object" && value?.uri) return "UPLOAD";
        if (fieldName.toLowerCase().includes("date")) return "DATE_PICKER";
        if (typeof value === "string" && value.length > 100) return "TEXT_AREA";
        return "TEXT_FIELD";
    };

    const getExtraName = (name: string) => {
        if (name == "Pastoral Ministry Profile") return "PMP";
        if (name == "Church Ministry Survey") return "CMA";
        return name;
    };
    /** Save progress */
    const handleSubmit = async () => {
        if (isReadOnly) return;
        if (!validateForm()) return;
        if (!currentUser?.id) {
            Alert.alert("Error", "User not authenticated");
            return;
        }

        try {
            // Build extras payload
            const extrasArray = Object.entries(formData).map(([name, value]) => {
                const type = getExtraType(name, value);
                return {
                    type,
                    name,
                    value: type === "UPLOAD" ? true : value,
                };
            });

            if (isUpdateMode) {
                await updateExtras.mutateAsync({
                    roadMapId: roadmapId!,
                    payload: { extras: extrasArray },
                    userId: targetUserId!, // Update for mentee
                    nestedRoadMapItemId: itemId,
                });
            } else {
                await createExtras.mutateAsync({
                    userId: targetUserId!, // Create for mentee
                    roadMapId: roadmapId!,
                    nestedRoadMapItemId: itemId,
                    extras: extrasArray,
                });
            }

            for (const [extraName, files] of Object.entries(pendingFiles)) {
                for (const file of files) {
                    await uploadDocument.mutateAsync({
                        roadMapId: roadmapId!,
                        userId: currentUser.id,
                        nestedRoadMapItemId: itemId!,
                        extraName,
                        file,
                    });
                }
            }
            setPendingFiles({});

            if (roadmapId && itemId && targetUserId) {
                await recordTaskCompletionTimestamp(targetUserId, roadmapId, itemId, Date.now());
            }

            if (isUpdateMode) {
                showToast();
            } else if (onSaveSuccess) {
                onSaveSuccess();
            } else {
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    router.back();
                }, 1800);
            }
        } catch (err: any) {
            console.error("❌ Submission error:", err);
            Alert.alert("Submission Failed", err?.message || "Failed to submit. Please try again.");
        }
    };

    /** ───────────────────── UPLOAD FIELD ───────────────────── */
    const UploadField = ({ extraName }: { extraName: string }) => {
        const { data: docs = [], isLoading } = useRoadmapDocuments(
            roadmapId!,
            itemId!,
            targetUserId!,
            extraName
        );

        const isMediaUpload =
            extraName.toLowerCase().includes("image") ||
            extraName.toLowerCase().includes("video") ||
            extraName.toLowerCase().includes("photo") ||
            extraName.toLowerCase().includes("media");

        const pickFile = async () => {
            if (isReadOnly) return;
            const res = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                multiple: true,
            });
            if (res.canceled) return;

            const newFiles = res.assets.map((a) => ({
                id: `${a.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                uri: a.uri,
                name: a.name,
                type: a.mimeType || "application/octet-stream",
            }));

            setPendingFiles((prev) => ({
                ...prev,
                [extraName]: [...(prev[extraName] || []), ...newFiles],
            }));
            handleChange(extraName, true);
        };

        const deletePendingLocal = (fileId: string) => {
            if (isReadOnly) return;
            setPendingFiles((prev) => {
                const updated = prev[extraName]?.filter((f) => f.id !== fileId) || [];
                if (updated.length === 0 && docs.length === 0) {
                    handleChange(extraName, false);
                }
                return { ...prev, [extraName]: updated };
            });
        };

        const confirmDelete = (doc: any) => {
            if (isReadOnly) return;
            Alert.alert(
                "Delete file",
                `Delete "${formatFileName(doc.fileName)}"?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                            if (!currentUser?.id) return;
                            deleteDocument.mutate(
                                {
                                    roadMapId: roadmapId!,
                                    userId: currentUser.id,
                                    nestedId: itemId!,
                                    fileUrl: doc.fileUrl,
                                    uploadBatchId: doc.uploadBatchId,
                                },
                                {
                                    onSuccess: () => {
                                        if (docs.length <= 1 && !hasPendingFiles) {
                                            handleChange(extraName, false);
                                        }
                                    },
                                    onError: (err: any) => {
                                        Alert.alert(
                                            "Delete failed",
                                            err?.message || "Could not remove this file. Please try again.",
                                        );
                                    },
                                },
                            );
                        },
                    },
                ],
            );
        };

        const hasPendingFiles = (pendingFiles[extraName]?.length ?? 0) > 0;
        const hasServerFiles = docs.length > 0;
        const uploadButtonLabel = isMediaUpload
            ? hasServerFiles || hasPendingFiles
                ? "Add more media"
                : "Upload media"
            : hasServerFiles || hasPendingFiles
                ? "Upload another file"
                : "Upload file";

        return (
            <View style={{ marginBottom: 20 }}>
                {!isReadOnly ? (
                    <Pressable style={[styles.uploadButton, styles.uploadButtonWhite]} onPress={pickFile}>
                        <Ionicons name="cloud-upload-outline" size={22} color="#2563eb" />
                        <Text style={styles.uploadButtonText}>{uploadButtonLabel}</Text>
                    </Pressable>
                ) : null}

                {hasPendingFiles &&
                    pendingFiles[extraName]?.map((f) => (
                        <View key={f.id} style={styles.pendingFileRow}>
                            <Text style={styles.pendingFileName} numberOfLines={1}>
                                {f.name} (not saved yet)
                            </Text>
                            {!isReadOnly ? (
                                <Pressable
                                    onPress={() => deletePendingLocal(f.id)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    style={styles.removeIconWrapper}
                                >
                                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                                </Pressable>
                            ) : null}
                        </View>
                    ))}

                {isLoading ? (
                    <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
                ) : (
                    hasServerFiles && (
                        <View style={[styles.uploadedFilesContainer]}>
                            {!isMediaUpload && (
                                <Text style={styles.uploadedFilesLabel}>Uploaded :</Text>
                            )}
                            {isMediaUpload ? (
                                <View style={styles.mediaUploadedBlock}>
                                    <Pressable
                                        onPress={() =>
                                            router.push({
                                                pathname: "/roadmap/shared-media",
                                                params: {
                                                    taskId: task._id,
                                                    extraName: extraName,
                                                    roadMapId: roadmapId!,
                                                    nestedId: itemId,
                                                    userId: targetUserId,
                                                },
                                            })
                                        }
                                        style={{ alignItems: "center", width: "100%", paddingVertical: 6 }}
                                    >
                                        <Text
                                            style={[
                                                styles.fileName,
                                                { textDecorationLine: "underline", textAlign: "center" },
                                            ]}
                                        >
                                            View Shared Media ({docs.length})
                                        </Text>
                                    </Pressable>
                                    {!isReadOnly ? (
                                        <Text style={styles.mediaDeleteHint}>
                                            Open shared media — tap the trash icon on a file, or use Select for multiple
                                        </Text>
                                    ) : null}
                                </View>
                            ) : (
                                docs.map((doc: any) => (
                                    <View key={doc._id} style={styles.fileRow}>
                                        <Pressable
                                            onPress={() => Linking.openURL(doc.fileUrl)}
                                            style={[styles.filePress, { flex: 1 }]}
                                        >
                                            <View style={styles.fileIcon}>
                                                <Ionicons name="document-attach-outline" size={18} color="#FFFFFF" />
                                            </View>
                                            <View style={{ flex: 1, minWidth: 0 }}>
                                                <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                                                    {formatFileName(doc.fileName)}
                                                </Text>
                                                <Text style={styles.fileHint} numberOfLines={1}>
                                                    Tap to open
                                                </Text>
                                            </View>
                                            <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.82)" />
                                        </Pressable>
                                        {!isReadOnly ? (
                                            <Pressable
                                                onPress={() => confirmDelete(doc)}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                style={styles.removeIconWrapper}
                                            >
                                                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                                            </Pressable>
                                        ) : null}
                                    </View>
                                ))
                            )}
                        </View>
                    )
                )}

                {/* Download button only when server files exist */}
                {!isLoading && docs.length > 0 ? (
                    <Pressable
                        style={[styles.uploadButton, styles.uploadButtonWhite]}
                        onPress={async () => {
                            try {
                                let successCount = 0;
                                for (const doc of docs) {
                                    if (doc.fileUrl) {
                                        await Linking.openURL(doc.fileUrl);
                                        successCount++;
                                    }
                                }
                                if (successCount === 0) {
                                    Alert.alert("Error", "Could not open any documents.");
                                }
                            } catch (err: any) {
                                Alert.alert("Error", "Could not download files: " + err.message);
                            }
                        }}
                    >
                        <Ionicons name="download-outline" size={22} color="#2563eb" />
                        <Text style={styles.uploadButtonText}>Download</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    };

    /** ───────────────────── RENDER FIELDS ───────────────────── */

    const renderExtra = (extra: Extra, index: number): JSX.Element | null => {
        const id = `${extra.name}-${index}`;

        switch (extra.type) {
            case "UPLOAD":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <UploadField extraName={extra.name} />
                    </View>
                );

            case "TEXT_FIELD":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {renderFieldLabel(extra.name)}
                        {isReadOnly ? (
                            <View style={styles.readOnlyValue}>
                                <Text style={styles.readOnlyValueText}>
                                    {formatReadOnlyText(formData[extra.name])}
                                </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={styles.textInput}
                                value={formData[extra.name] || ""}
                                editable
                                onChangeText={(v) => handleChange(extra.name, v)}
                                placeholder={extra.placeHolder}
                                placeholderTextColor="#9cc2ff"
                            />
                        )}
                    </View>
                );

            case "TEXT_AREA":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {renderFieldLabel(extra.name)}
                        {isReadOnly ? (
                            <View style={[styles.readOnlyValue, styles.readOnlyValueMultiline]}>
                                <Text style={styles.readOnlyValueText}>
                                    {formatReadOnlyText(formData[extra.name])}
                                </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                multiline
                                scrollEnabled={false}
                                numberOfLines={4}
                                value={formData[extra.name] || ""}
                                editable
                                onChangeText={(v) => handleChange(extra.name, v)}
                                placeholder={extra.placeHolder}
                                placeholderTextColor="#9cc2ff"
                            />
                        )}
                    </View>
                );

            case "TEXT_DISPLAY":
                return (
                    <View key={id} style={styles.textDisplay}>
                        {renderNumberedText(extra.name)}
                    </View>
                );

            case "CHECKBOX":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Pressable
                            onPress={() => handleChange(extra.name, !formData[extra.name])}
                            style={styles.checkboxRow}
                            hitSlop={isReadOnly ? 0 : 8}
                            disabled={isReadOnly}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    formData[extra.name] && styles.checkboxChecked,
                                    isReadOnly && styles.checkboxReadOnly,
                                ]}
                            >
                                {formData[extra.name] && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text
                                style={[
                                    styles.checkboxLabel,
                                    isReadOnly && styles.checkboxLabelReadOnly,
                                ]}
                            >
                                {extra.name}
                            </Text>
                        </Pressable>
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginLeft: 36, marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const isChecked = !!formData[cbId];
                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <Pressable
                                                onPress={() => handleChange(cbId, !isChecked)}
                                                style={styles.checkboxRow}
                                                hitSlop={isReadOnly ? 0 : 8}
                                                disabled={isReadOnly}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        isChecked && styles.checkboxChecked,
                                                        isReadOnly && styles.checkboxReadOnly,
                                                    ]}
                                                >
                                                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.checkboxLabel,
                                                        isReadOnly && styles.checkboxLabelReadOnly,
                                                    ]}
                                                >
                                                    {checkbox.name}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                );

            case "DATE_PICKER":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {renderFieldLabel(extra.name)}
                        {isReadOnly ? (
                            <View style={styles.readOnlyValue}>
                                <Text style={styles.readOnlyValueText}>
                                    {(() => {
                                        const currentRaw =
                                            formData[extra.name] !== undefined
                                                ? formData[extra.name]
                                                : extra.date || "";
                                        const parsed = parseAnyDate(currentRaw);
                                        return parsed ? formatForUi(parsed) : "No date provided";
                                    })()}
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                onPress={() => setActiveDateField(extra.name)}
                                style={styles.dateInputContainer}
                                hitSlop={8}
                            >
                                {(() => {
                                    const currentRaw =
                                        formData[extra.name] !== undefined
                                            ? formData[extra.name]
                                            : extra.date || "";
                                    const parsed = parseAnyDate(currentRaw);
                                    return (
                                        <Text
                                            style={[
                                                styles.dateInput,
                                                parsed ? null : styles.datePlaceholder,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {parsed ? formatForUi(parsed) : "Select date"}
                                        </Text>
                                    );
                                })()}
                            </Pressable>
                        )}

                        {!isReadOnly && activeDateField === extra.name ? (
                            <DateTimePicker
                                value={parseAnyDate(formData[extra.name] ?? extra.date) ?? new Date()}
                                mode="date"
                                display="default"
                                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                    if (event.type === "dismissed") {
                                        setActiveDateField(null);
                                        return;
                                    }
                                    if (selectedDate) {
                                        handleChange(extra.name, formatForApi(selectedDate));
                                    }
                                    setActiveDateField(null);
                                }}
                            />
                        ) : null}
                    </View>
                );

            case "SECTION":
                return (
                    <View
                        key={id}
                        style={[styles.sectionBox, isReadOnly && styles.sectionBoxReview]}
                    >
                        <Text style={styles.sectionBoxTitle}>{extra.name}</Text>
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const checked = !!formData[cbId];
                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <View style={styles.checkboxRow}>
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        checked && styles.checkboxChecked,
                                                        isReadOnly && styles.checkboxReadOnly,
                                                    ]}
                                                >
                                                    {checked && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.checkboxLabel,
                                                        isReadOnly && styles.checkboxLabelReadOnly,
                                                    ]}
                                                >
                                                    {checkbox.name}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                        {extra.sections && extra.sections.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                                {extra.sections.map((section, sectionIndex) =>
                                    renderExtra(section, sectionIndex)
                                )}
                            </View>
                        )}
                    </View>
                );

            case "BUTTON":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {isReadOnly ? (
                            <View style={styles.readOnlyValue}>
                                <Text style={styles.readOnlyValueText}>
                                    {extra.linkUrl
                                        ? `Resource link: ${extra.linkUrl}`
                                        : extra.name || "Reference"}
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                style={styles.button}
                                onPress={() => {
                                    if (extra.linkUrl) {
                                        const fullUrl = ensureUrlScheme(extra.linkUrl);
                                        Linking.openURL(fullUrl).catch(() =>
                                            Alert.alert("Error", "Could not open link: " + fullUrl),
                                        );
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>{extra.name || "Action Button"}</Text>
                            </Pressable>
                        )}
                    </View>
                );

            case "ASSESSMENT":
                const isSpecificAssessmentCompleted = assessmentProgress?.items?.some(
                    (item: any) => item.assessmentId === extra.assessmentId && item.status === 'completed'
                );

                if (isSpecificAssessmentCompleted) {
                    return (
                        <View key={id} style={styles.fieldContainer}>
                            <TouchableOpacity
                                style={styles.centeredLinkButton}
                                onPress={() => {
                                    router.push({
                                        pathname: "/assessments/answer-questions",
                                        params: {
                                            assessmentId: extra.assessmentId,
                                            viewMode: "true",
                                            hasPreSurvey: "false",
                                            targetUserId: targetUserId
                                        }
                                    });
                                }}
                            >
                                <View style={styles.linkRow}>
                                    <View style={styles.linkIcon}>
                                        <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.linkTextWrap}>
                                        <Text style={styles.linkTitle} numberOfLines={2}>
                                            View {getExtraName(extra.name)} Survey Results
                                        </Text>
                                        <Text style={styles.linkSubtitle} numberOfLines={1}>
                                            Opens in read-only view
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.85)" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                }

                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.assessmentButton}>
                            <View style={styles.assessmentContent}>
                                <Text style={styles.assessmentTitle}>{extra.name}</Text>
                            </View>
                        </View>
                        <Pressable
                            style={styles.centeredLinkButton}
                            onPress={() => {
                                if (extra.assessmentId) {
                                    router.push({
                                        pathname: "/assessments/answer-questions",
                                        params: {
                                            assessmentId: extra.assessmentId,
                                            viewMode: "true", // Force view mode for mentor
                                            hasPreSurvey: "false",
                                            targetUserId: targetUserId
                                        }
                                    });
                                }
                            }}
                        >
                            <View style={styles.linkRow}>
                                <View style={styles.linkIcon}>
                                    <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                                </View>
                                <View style={styles.linkTextWrap}>
                                    <Text style={styles.linkTitle} numberOfLines={2}>
                                        View {getExtraName(extra.name)} Survey
                                    </Text>
                                    <Text style={styles.linkSubtitle} numberOfLines={1}>
                                        Review the submitted answers
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.85)" />
                            </View>
                        </Pressable>
                    </View>
                );

            case "SIGNATURE": {
                const signatureValue = formData[extra.name] || null;
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {renderFieldLabel(extra.name)}
                        <Pressable
                            style={[
                                styles.signaturePlaceholder,
                                isReadOnly && styles.signaturePlaceholderReadOnly,
                            ]}
                            onPress={() => {
                                if (!signatureValue) {
                                    if (!isReadOnly) {
                                        setSignatureEditor({ visible: true, fieldName: extra.name });
                                    }
                                    return;
                                }

                                const valueStr = String(signatureValue);
                                const isDataImage = valueStr.startsWith("data:image");

                                if (isReadOnly) {
                                    const actions: { text: string; onPress?: () => void; style?: "cancel" }[] = [
                                        {
                                            text: "View",
                                            onPress: () => {
                                                if (isDataImage) {
                                                    setSignaturePreview({ visible: true, uri: valueStr });
                                                } else {
                                                    Linking.openURL(valueStr).catch(() =>
                                                        Alert.alert("Error", "Could not open signature."),
                                                    );
                                                }
                                            },
                                        },
                                        {
                                            text: "Download",
                                            onPress: () => downloadSignature(valueStr),
                                        },
                                        { text: "Close", style: "cancel" },
                                    ];
                                    Alert.alert("Signature", undefined, actions);
                                    return;
                                }

                                Alert.alert("Signature", "Choose an action", [
                                    {
                                        text: "View",
                                        onPress: () => {
                                            if (isDataImage) {
                                                setSignaturePreview({ visible: true, uri: valueStr });
                                            } else {
                                                Linking.openURL(valueStr).catch(() =>
                                                    Alert.alert("Error", "Could not open signature link."),
                                                );
                                            }
                                        },
                                    },
                                    {
                                        text: "Edit",
                                        onPress: () =>
                                            setSignatureEditor({ visible: true, fieldName: extra.name }),
                                    },
                                    {
                                        text: "Download",
                                        onPress: () => downloadSignature(valueStr),
                                    },
                                    { text: "Cancel", style: "cancel" },
                                ]);
                            }}
                            disabled={isReadOnly && !signatureValue}
                        >
                            <Text style={styles.tapToSignText}>
                                {signatureValue
                                    ? isReadOnly
                                        ? "Tap to view signature"
                                        : "Tap to view or edit signature"
                                    : isReadOnly
                                      ? "No signature on file"
                                      : "Tap to add signature"}
                            </Text>
                        </Pressable>
                    </View>
                );
            }

            default:
                return null;
        }
    };

    if (isLoadingExtras && effectiveExtras.length === 0) {
        return (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator color="#fff" />
                <Text style={{ color: 'rgba(255,255,255,0.75)', marginTop: 8, fontSize: 13 }}>
                    Loading saved fields…
                </Text>
            </View>
        );
    }

    if (effectiveExtras.length === 0) return null;

    // For date changes, we might want a global save button if multiple fields are edited
    const isSaving = createExtras.isPending || updateExtras.isPending;

    const isTaskCompleted =
        normalizeNestedTaskStatus(task.status) === "completed";

    return (
        <>
            <View style={styles.container}>
                {isTaskCompleted && (
                    <View style={styles.completedBanner}>
                        <View style={styles.completedBannerLeft}>
                            <Ionicons name="checkmark-circle" size={22} color="#34d399" />
                            <Text style={styles.completedLabel}>Completed</Text>
                        </View>
                        <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>Done</Text>
                        </View>
                    </View>
                )}

                {isUpdateMode && isReadOnly && !isViewingPastor && (
                    <View style={styles.viewModeBanner}>
                        <View style={styles.viewModeBannerContent}>
                            <Ionicons name="eye-outline" size={18} color="#7EC8FF" />
                            <View style={styles.viewModeBannerText}>
                                <Text style={styles.viewModeTitle}>Viewing your responses</Text>
                                <Text style={styles.viewModeSubtitle}>
                                    Tap Edit to make changes and resubmit.
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            style={styles.editButton}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="create-outline" size={16} color="#fff" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </Pressable>
                    </View>
                )}

                {isUpdateMode && isEditing && !isViewingPastor && (
                    <View style={styles.editingBanner}>
                        <View style={styles.editingBadge}>
                            <Ionicons name="create-outline" size={13} color="#F59E0B" />
                            <Text style={styles.editingBadgeText}>Editing Mode</Text>
                        </View>
                        <Text style={styles.editingBannerText}>
                            Update your responses and tap Resubmit when done.
                        </Text>
                        <Pressable
                            onPress={confirmDiscardEdit}
                            hitSlop={8}
                            style={styles.cancelEditBtn}
                        >
                            <Ionicons name="close-outline" size={14} color="rgba(255,255,255,0.75)" />
                            <Text style={styles.cancelEditText}>Cancel</Text>
                        </Pressable>
                    </View>
                )}

                {effectiveExtras.map((extra, index) => renderExtra(extra, index))}

                {!isViewingPastor && !isReadOnly ? (
                    <Pressable
                        style={[
                            styles.saveButton,
                            isUpdateMode && styles.saveButtonUpdate,
                            isSaving ? styles.saveButtonSaving : null,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <ActivityIndicator color={isUpdateMode ? "#fff" : "#2563eb"} size="small" />
                                <Text style={[
                                    styles.saveButtonText,
                                    isUpdateMode && styles.saveButtonTextUpdate,
                                ]}>
                                    Saving Changes...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons
                                    name={isUpdateMode ? "refresh-outline" : "save-outline"}
                                    size={20}
                                    color={isUpdateMode ? "#fff" : "#2563eb"}
                                />
                                <Text style={[
                                    styles.saveButtonText,
                                    isUpdateMode && styles.saveButtonTextUpdate,
                                ]}>
                                    {isUpdateMode ? "Resubmit" : "Save Progress"}
                                </Text>
                            </>
                        )}
                    </Pressable>
                ) : null}
            </View>

            <Modal
                visible={signaturePreview.visible}
                transparent
                animationType="fade"
                onRequestClose={() => setSignaturePreview({ visible: false, uri: null })}
            >
                <View style={styles.signatureModalBackdrop}>
                    <View style={styles.signatureModalCard}>
                        <Text style={styles.signatureModalTitle}>Signature</Text>
                        {signaturePreview.uri ? (
                            <Image source={{ uri: signaturePreview.uri }} style={styles.signatureModalImage} resizeMode="contain" />
                        ) : null}
                        <View style={styles.signatureModalActions}>
                            <Pressable
                                style={[styles.uploadButton, styles.uploadButtonWhite, { flex: 1 }]}
                                onPress={() => {
                                    if (signaturePreview.uri) downloadSignature(signaturePreview.uri);
                                }}
                            >
                                <Ionicons name="download-outline" size={20} color="#2563eb" />
                                <Text style={styles.uploadButtonText}>Download</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.uploadButton, styles.uploadButtonWhite, { flex: 1 }]}
                                onPress={() => setSignaturePreview({ visible: false, uri: null })}
                            >
                                <Ionicons name="close-outline" size={22} color="#2563eb" />
                                <Text style={styles.uploadButtonText}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {!isViewingPastor ? (
                <SignatureModal
                    visible={signatureEditor.visible}
                    onClose={() => setSignatureEditor({ visible: false, fieldName: null })}
                    onSave={(signature) => {
                        const fieldName = signatureEditor.fieldName;
                        if (!fieldName) return;
                        handleChange(fieldName, signature);
                    }}
                />
            ) : null}

            {!isViewingPastor ? (
                <SimpleSuccessModal
                    visible={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title="Progress Saved!"
                />
            ) : null}

            {showResubmitToast && (
                <RNAnimated.View
                    style={[styles.resubmitToast, { opacity: toastOpacity }]}
                    pointerEvents="none"
                >
                    <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                    <Text style={styles.resubmitToastText}>
                        Task updated successfully
                    </Text>
                </RNAnimated.View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 6,
        paddingBottom: 14,
        gap: 14,
    },
    readOnlyValue: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(0,0,0,0.12)",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    readOnlyValueMultiline: {
        minHeight: 72,
    },
    readOnlyValueText: {
        color: "rgba(255,255,255,0.88)",
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
    },
    checkboxReadOnly: {
        opacity: 0.95,
    },
    checkboxLabelReadOnly: {
        opacity: 0.92,
    },
    signaturePlaceholderReadOnly: {
        backgroundColor: "rgba(0,0,0,0.1)",
        borderColor: "rgba(255,255,255,0.14)",
    },
    sectionBoxReview: {
        backgroundColor: "rgba(0,0,0,0.08)",
        borderColor: "rgba(255,255,255,0.12)",
    },
    fieldContainer: { marginBottom: 10 },
    fieldLabel: {
        color: "rgba(255,255,255,0.90)",
        fontSize: 13,
        marginBottom: 8,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        backgroundColor: "rgba(255,255,255,0.08)",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        color: "rgba(255,255,255,0.92)",
        fontSize: 14,
        fontWeight: "700",
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.70)",
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: { backgroundColor: 'white' },
    checkmark: { color: '#1e40af', fontSize: 18, fontWeight: 'bold' },
    checkboxLabel: { flex: 1, color: 'white', fontSize: 16, lineHeight: 24 },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 10,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        marginTop: 6,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonSaving: {
        opacity: 0.75,
    },
    saveButtonText: {
        color: "#2563eb",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    uploadButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    uploadButtonWhite: {
        backgroundColor: '#ffffff',
    },
    uploadButtonText: {
        color: '#2563eb',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    uploadedFilesContainer: {
        marginBottom: 20,
    },
    uploadedFilesLabel: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    fileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 8,
    },
    pendingFileRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 4,
        gap: 8,
    },
    pendingFileName: {
        color: "rgba(255,255,255,0.92)",
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
    },
    removeIconWrapper: {
        padding: 4,
    },
    mediaUploadedBlock: {
        width: "100%",
    },
    mediaDeleteHint: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 6,
    },
    filePress: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        width: "100%",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
    },
    fileIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(232, 200, 138, 0.18)",
        borderWidth: 1,
        borderColor: "rgba(232, 200, 138, 0.24)",
    },
    fileName: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '800',
        flex: 1,
        textAlign: 'left',
        letterSpacing: 0.3,
    },
    fileHint: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
        fontWeight: "600",
        marginTop: 2,
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
   
    },
    dateInputContainer: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 140,
        flexShrink: 0,
    },
    dateInput: {
        color: "rgba(255,255,255,0.92)",
        fontSize: 14,
        fontWeight: "800",
        textAlign: 'center',
        padding: 0,
        minWidth: 110,
    },
    datePlaceholder: {
        color: "#9cc2ff",
        fontWeight: "600",
    },
    button: {
        
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderRadius: 8,
        gap: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    buttonText: {
        color: '#2563eb',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    sectionBox: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionBoxTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    completedBanner: {
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#34d399',
        gap: 8,
    },
    completedBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    completedLabel: {
        color: '#34d399',
        fontSize: 15,
        fontWeight: '800',
    },
    completedBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
    },
    completedBadgeText: {
        color: '#34d399',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    viewModeBanner: {
        backgroundColor: 'rgba(126, 200, 255, 0.06)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(126, 200, 255, 0.14)',
        marginBottom: 14,
        gap: 12,
    },
    viewModeBannerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    viewModeBannerText: {
        flex: 1,
        gap: 2,
    },
    viewModeTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    viewModeSubtitle: {
        color: 'rgba(200, 225, 255, 0.68)',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 17,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    editingBanner: {
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        marginBottom: 14,
    },
    editingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    editingBadgeText: {
        color: '#F59E0B',
        fontSize: 12,
        fontWeight: '800',
    },
    editingBannerText: {
        color: 'rgba(245, 200, 100, 0.85)',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 17,
    },
    cancelEditBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    cancelEditText: {
        color: 'rgba(255, 255, 255, 0.75)',
        fontSize: 12,
        fontWeight: '700',
    },
    resubmitToast: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    resubmitToastText: {
        color: '#1a1a1a',
        fontSize: 15,
        fontWeight: '800',
    },
    saveButtonUpdate: {
        backgroundColor: '#2563eb',
        borderColor: '#3B82F6',
    },
    saveButtonTextUpdate: {
        color: '#ffffff',
    },
    textDisplay: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        marginBottom: 24,
    },
    textDisplayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    textDisplayTextLeft: {
        color: "rgba(255,255,255,0.88)",
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 20,
        textAlign: "left",
    },
    numberList: { gap: 10 },
    numberRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    numberBadge: {
        width: 28,
        height: 28,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(111, 212, 190, 0.18)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.26)",
        marginTop: 1,
    },
    numberBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
    numberRowText: {
        flex: 1,
        minWidth: 0,
        color: "rgba(255,255,255,0.86)",
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 20,
        textAlign: "left",
    },
    signaturePlaceholder: {
        minHeight: 120,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        backgroundColor: "rgba(255,255,255,0.08)",
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    signaturePreview: {
        width: '100%',
        height: 100,
        marginBottom: 8,
        backgroundColor: '#ffffff',
        borderRadius: 6,
    },
    tapToSignText: { color: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: "800" },
    signatureModalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    signatureModalCard: {
        width: "100%",
        maxWidth: 520,
        borderRadius: 16,
        padding: 14,
        backgroundColor: "rgba(18, 34, 64, 0.98)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    signatureModalTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 10,
        textAlign: "center",
    },
    signatureModalImage: {
        width: "100%",
        height: 260,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    signatureModalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    centeredLinkButton: {
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
    },
    centeredLinkText: { display: "none" },
    linkRow: { flexDirection: "row", alignItems: "center" },
    linkIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(111, 212, 190, 0.20)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.26)",
        marginRight: 10,
    },
    linkTextWrap: { flex: 1, minWidth: 0, paddingRight: 8 },
    linkTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", lineHeight: 18 },
    linkSubtitle: { color: "rgba(255,255,255,0.70)", fontSize: 12, fontWeight: "600", marginTop: 2 },
    assessmentButton: {
        backgroundColor: 'rgba(64, 156, 186, 0.5)',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    assessmentContent: { flex: 1 },
    assessmentTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 },
});
