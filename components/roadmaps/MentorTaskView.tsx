import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import {
    useCreateRoadmapExtras,
    useDeleteRoadmapDocument,
    useRoadmapDocuments,
    useRoadmapExtras,
    useUpdateRoadmapExtras,
    useUploadRoadmapDocument,
} from "@/hooks/roadmaps/useRoadmaps";
import { useAssessmentProgress } from "@/hooks/progress/useProgress";

import { Extra, NestedRoadmap } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import RNFS from "react-native-fs";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { JSX, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format, isValid, parse } from "date-fns";
import { SignatureModal } from "@/components/forms/SignatureModal";
import {
    ActivityIndicator,
    Alert,
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

interface Props {
    task: NestedRoadmap;
    phaseId?: string;
    itemId?: string;
    userId?: string; // Target user (mentee)
}

export function MentorTaskView({ task, phaseId: roadmapId, itemId, userId }: Props) {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    
    // We are in mentor view, so targetUserId is the mentee
    const targetUserId = userId; 
    
    const [formData, setFormData] = useState<Record<string, any>>({});
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
    const { data: existingExtras, isLoading: isLoadingExtras, isFetching: isFetchingExtras } = useRoadmapExtras(
        isValidObjectId(roadmapId) ? roadmapId : undefined,
        isValidObjectId(itemId) ? itemId : undefined,
        isValidObjectId(targetUserId) ? targetUserId : undefined
    );

    const createExtras = useCreateRoadmapExtras();
    const updateExtras = useUpdateRoadmapExtras();
    const uploadDocument = useUploadRoadmapDocument();
    const deleteDocument = useDeleteRoadmapDocument();
    const { data: assessmentProgress } = useAssessmentProgress(targetUserId);

    const isUpdateMode = !!existingExtras;

    /** Initialise formData from API or default dates */
    useEffect(() => {
        const init: Record<string, any> = {};
        
        // 1. Load defaults from task definition
        task.extras?.forEach(extra => {
            if (extra.date) init[extra.name] = extra.date;
        });

        // 2. Override with existing extras from API (SIGNATURE uses signatureData)
        if (existingExtras?.extras && Array.isArray(existingExtras.extras)) {
            existingExtras.extras.forEach((item: any) => {
                if (!item.name) return;
                if (item.type === "SIGNATURE" && item.signatureData != null) {
                    init[item.name] = item.signatureData;
                } else if (item.value !== undefined) {
                    init[item.name] = item.value;
                }
            });
        }
        
        setFormData(init);
    }, [existingExtras, task]);

    const handleChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const validateForm = () => Object.keys(formData).length > 0;

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
        const extraDef = task.extras?.find(e => e.name === fieldName);
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

            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                router.back();
            }, 1800);
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

        // If we're viewing as a mentor (menteeId passed), keep uploads read-only.
        // For pastor self-view (userId == currentUser.id), allow upload/delete.
        const isReadOnly = !!userId && currentUser?.id && userId !== currentUser.id;

        const pickAndUpload = async () => {
            if (isReadOnly) return;
            if (!currentUser?.id) {
                Alert.alert("Error", "User not authenticated");
                return;
            }
            const res = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                multiple: true,
            });
            if (res.canceled) return;

            try {
                for (const a of res.assets) {
                    await uploadDocument.mutateAsync({
                        roadMapId: roadmapId!,
                        userId: currentUser.id,
                        nestedRoadMapItemId: itemId!,
                        extraName,
                        file: {
                            uri: a.uri,
                            name: a.name,
                            type: a.mimeType || "application/octet-stream",
                        },
                    });
                }
            } catch (err: any) {
                Alert.alert("Upload failed", err?.message || "Could not upload file. Please try again.");
            }
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
                            deleteDocument.mutate({
                                roadMapId: roadmapId!,
                                userId: currentUser.id,
                                nestedId: itemId!,
                                fileUrl: doc.fileUrl,
                                uploadBatchId: doc.uploadBatchId,
                            });
                        },
                    },
                ],
            );
        };

        return (
            <View style={{ marginBottom: 20 }}>
                {!isReadOnly ? (
                    <Pressable style={[styles.uploadButton, styles.uploadButtonWhite]} onPress={pickAndUpload}>
                        <Ionicons name="cloud-upload-outline" size={22} color="#2563eb" />
                        <Text style={styles.uploadButtonText}>
                            {isMediaUpload ? "Upload media" : "Upload file"}
                        </Text>
                    </Pressable>
                ) : null}

                {isLoading ? (
                    <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
                ) : (
                    docs.length > 0 && (
                        <View style={[styles.uploadedFilesContainer]}>
                            {!isMediaUpload && (
                                <Text style={styles.uploadedFilesLabel}>Uploaded :</Text>
                            )}
                            {isMediaUpload ? (
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
                                        View Shared Media
                                    </Text>
                                </Pressable>
                            ) : (
                                docs.map((doc: any) => (
                                    <View key={doc._id} style={styles.fileRow}>
                                        <Pressable
                                            onPress={() => Linking.openURL(doc.fileUrl)}
                                            onLongPress={() => confirmDelete(doc)}
                                            style={styles.filePress}
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
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={styles.textInput}
                            value={formData[extra.name] || ""}
                            editable
                            onChangeText={(v) => handleChange(extra.name, v)}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                        />
                    </View>
                );

            case "TEXT_AREA":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            multiline
                            numberOfLines={4}
                            value={formData[extra.name] || ""}
                            editable
                            onChangeText={(v) => handleChange(extra.name, v)}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                        />
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
                            hitSlop={8}
                        >
                            <View style={[styles.checkbox, formData[extra.name] && styles.checkboxChecked]}>
                                {formData[extra.name] && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>{extra.name}</Text>
                        </Pressable>
                        {/* Sub-checkboxes (Read Only) */}
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
                                                hitSlop={8}
                                            >
                                                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                                                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.checkboxLabel}>{checkbox.name}</Text>
                                            </Pressable>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                );

            case "DATE_PICKER":
                // User-friendly date picker (tap to open native calendar)
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.fieldRow}>
                            <Text style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}>
                                {extra.name}
                            </Text>
                            <Pressable
                                onPress={() => setActiveDateField(extra.name)}
                                style={styles.dateInputContainer}
                                hitSlop={8}
                            >
                                {(() => {
                                    const currentRaw = formData[extra.name] !== undefined ? formData[extra.name] : (extra.date || "");
                                    const parsed = parseAnyDate(currentRaw);
                                    return (
                                        <Text style={[styles.dateInput, parsed ? null : styles.datePlaceholder]} numberOfLines={1}>
                                            {parsed ? formatForUi(parsed) : "Select date"}
                                        </Text>
                                    );
                                })()}
                            </Pressable>
                        </View>
                        
                        {activeDateField === extra.name ? (
                            <DateTimePicker
                                value={parseAnyDate(formData[extra.name] ?? extra.date) ?? new Date()}
                                mode="date"
                                display="default"
                                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                    // Android emits "dismissed" when closing picker without selection.
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
                    <View key={id} style={styles.sectionBox}>
                        <Text style={styles.sectionBoxTitle}>{extra.name}</Text>
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const checked = !!formData[cbId];
                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <View style={styles.checkboxRow}>
                                                <View style={[
                                                    styles.checkbox,
                                                    checked && styles.checkboxChecked,
                                                ]}>
                                                    {checked && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.checkboxLabel}>{checkbox.name}</Text>
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
                        <Pressable
                            style={styles.button}
                            onPress={() => {
                                if (extra.linkUrl) {
                                    const fullUrl = ensureUrlScheme(extra.linkUrl);
                                    Linking.openURL(fullUrl).catch(err =>
                                        Alert.alert("Error", "Could not open link: " + fullUrl)
                                    );
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>{extra.name || "Action Button"}</Text>
                        </Pressable>
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
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <Pressable
                            style={styles.signaturePlaceholder}
                            onPress={() => {
                                // If not signed yet, open signature capture.
                                if (!signatureValue) {
                                    setSignatureEditor({ visible: true, fieldName: extra.name });
                                    return;
                                }

                                const valueStr = String(signatureValue);
                                const isDataImage = valueStr.startsWith("data:image");

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
                                        onPress: () => setSignatureEditor({ visible: true, fieldName: extra.name }),
                                    },
                                    {
                                        text: "Download",
                                        onPress: () => downloadSignature(valueStr),
                                    },
                                    { text: "Cancel", style: "cancel" },
                                ]);
                            }}
                        >
                            <Text style={styles.tapToSignText}>
                                {signatureValue ? "Tap to view or edit signature" : "Tap to add signature"}
                            </Text>
                        </Pressable>
                    </View>
                );
            }

            default:
                return null;
        }
    };

    if (!task.extras || task.extras.length === 0) return null;
    
    // For date changes, we might want a global save button if multiple fields are edited
    const isSaving = createExtras.isPending || updateExtras.isPending;

    return (
        <>
            <View style={styles.container}>
                {task.status === 'completed' && (
                    <View style={styles.completedBanner}>
                        <Text style={styles.completedLabel}>Task Completed</Text>
                        <Ionicons name="checkmark-circle" size={24} color="#34d399" />
                    </View>
                )}

                {task.extras.map((extra, index) => renderExtra(extra, index))}

                <Pressable
                    style={[styles.saveButton, isSaving ? styles.saveButtonDisabled : null]}
                    onPress={handleSubmit}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#2563eb" />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color="#2563eb" />
                            <Text style={styles.saveButtonText}>Save Progress</Text>
                        </>
                    )}
                </Pressable>
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

            <SignatureModal
                visible={signatureEditor.visible}
                onClose={() => setSignatureEditor({ visible: false, fieldName: null })}
                onSave={(signature) => {
                    const fieldName = signatureEditor.fieldName;
                    if (!fieldName) return;
                    handleChange(fieldName, signature);
                }}
            />

            <SimpleSuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Progress Saved!"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    fieldContainer: { marginBottom: 24 },
    fieldLabel: { color: 'white', fontSize: 16, marginBottom: 8, fontWeight: '500' },
    textInput: {
        borderWidth: .5,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent',
        padding: 14,
        borderRadius: 8,
        color: 'white',
        fontSize: 15,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: 'white',
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
        marginBottom: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
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
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
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
        fontSize: 17,
        fontWeight: '600',
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
        marginBottom: 10,
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
        // justifyContent: 'center',
        marginBottom: 20,
        marginHorizontal: 18,
        gap: 10,
   
    },
    dateInputContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 160,
        flexShrink: 0,
    },
    dateInput: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        padding: 0,
        minWidth: 120,
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
        paddingHorizontal: 20,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#34d399',
    },
    completedLabel: {
        color: '#34d399',
        fontSize: 16,
        fontWeight: '600',
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
        minHeight: 140,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
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
    tapToSignText: { color: '#9cc2ff', fontSize: 16 },
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
