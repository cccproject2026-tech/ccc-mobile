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
import { useRouter } from "expo-router";
import { JSX, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
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

    const isValidObjectId = (id: string | undefined) => !!id;

    const ensureUrlScheme = (url: string) => {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return `https://${url}`;
        }
        return url;
    };

    /** Load existing extras from API */
    const { data: existingExtras, isLoading: isLoadingExtras, isFetching: isFetchingExtras } = useRoadmapExtras(
        isValidObjectId(roadmapId) ? roadmapId : undefined,
        isValidObjectId(itemId) ? itemId : undefined,
        isValidObjectId(targetUserId) ? targetUserId : undefined
    );

    const createExtras = useCreateRoadmapExtras();
    const updateExtras = useUpdateRoadmapExtras();
    const { data: assessmentProgress } = useAssessmentProgress(targetUserId);

    const isUpdateMode = !!existingExtras;

    /** Initialise formData from API or default dates */
    useEffect(() => {
        const init: Record<string, any> = {};
        
        // 1. Load defaults from task definition
        task.extras?.forEach(extra => {
            if (extra.date) init[extra.name] = extra.date;
        });

        // 2. Override with existing extras from API
        if (existingExtras?.extras && Array.isArray(existingExtras.extras)) {
            existingExtras.extras.forEach((item: any) => {
                if (item.name && item.value !== undefined) {
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

    /** ───────────────────── UPLOAD FIELD (View Only) ───────────────────── */
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

        return (
            <View style={{ marginBottom: 20 }}>
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
                                            style={{ flex: 1 }}
                                        >
                                            <Text style={styles.fileName}>
                                                : {decodeURIComponent(doc.fileName)}
                                            </Text>
                                        </Pressable>
                                    </View>
                                ))
                            )}
                        </View>
                    )
                )}

                {/* Download Button */}
                <Pressable
                    style={[styles.uploadButton, styles.uploadButtonWhite]}
                    onPress={async () => {
                        if (docs.length > 0) {
                            try {
                                // For now, open each file in a new browser window/tab
                                // In a real app, this might trigger a zip download or sequential downloads
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
                        } else {
                            Alert.alert("No Files", "There are no files uploaded yet.");
                        }
                    }}
                >
                    <Ionicons name="download-outline" size={22} color="#2563eb" />
                    <Text style={styles.uploadButtonText}>
                        Download All {extraName}s
                    </Text>
                </Pressable>
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
                            style={[styles.textInput, styles.textInputDisabled]}
                            value={formData[extra.name] || ""}
                            editable={false}
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
                            style={[styles.textInput, styles.textArea, styles.textInputDisabled]}
                            multiline
                            numberOfLines={4}
                            value={formData[extra.name] || ""}
                            editable={false}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                        />
                    </View>
                );

            case "TEXT_DISPLAY":
                return (
                    <View key={id} style={styles.textDisplay}>
                        <Text style={styles.textDisplayText}>{extra.name}</Text>
                    </View>
                );

            case "CHECKBOX":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.checkboxRow}>
                            <View style={[
                                styles.checkbox,
                                formData[extra.name] && styles.checkboxChecked,
                                styles.checkboxDisabled
                            ]}>
                                {formData[extra.name] && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>{extra.name}</Text>
                        </View>
                        {/* Sub-checkboxes (Read Only) */}
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginLeft: 36, marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    console.log('cbId----->>>>>>>>>>>>>>', cbId);
                                    const isChecked = !!formData[cbId];
                                    console.log('isChecked----->>>>>>>>>>>>>>', isChecked);
                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <View style={styles.checkboxRow}>
                                                <View style={[
                                                    styles.checkbox,
                                                    isChecked && styles.checkboxChecked,
                                                    styles.checkboxDisabled
                                                ]}>
                                                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.checkboxLabel}>{checkbox.name}</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                );

            case "DATE_PICKER":
                // Logic to allow mentor to change date if needed
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.fieldRow}>
                            <Text style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}>
                                {extra.name}
                            </Text>
                            <View style={styles.dateInputContainer}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="DD / MM / YY"
                                    placeholderTextColor="#9cc2ff"
                                    value={formData[extra.name] !== undefined ? formData[extra.name] : (extra.date || "")}
                                    keyboardType="number-pad"
                                    maxLength={12}
                                    onChangeText={v => {
                                        // Simple date formatting
                                        const raw = v.replace(/\D/g, "");
                                        let formatted = "";
                                        if (raw.length > 0) {
                                            formatted = raw.slice(0, 2);
                                            if (raw.length > 2) {
                                                formatted += " / " + raw.slice(2, 4);
                                                if (raw.length > 4) {
                                                    formatted += " / " + raw.slice(4, 6);
                                                }
                                            }
                                        }
                                        handleChange(extra.name, formatted);
                                    }}
                                />
                            </View>
                        </View>
                        
                        {/* Change Date Button - always show for mentor as per request */}
                        <Pressable
                            style={[styles.button, { marginTop: 8 }]}
                            onPress={() => handleSubmit()} // Save when "Change Date" is conceptually done? Or just rely on separate save?
                        >
                            <Text style={styles.buttonText}>Change Date</Text>
                        </Pressable>
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
                                <Text style={styles.centeredLinkText}>View {getExtraName(extra.name)} Survey Results</Text>
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
                        <View style={{ padding: 10,paddingHorizontal: 20}} >

                        <Pressable
                            style={styles.button}
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
                            <Text style={styles.centeredLinkText}>View {getExtraName(extra.name)} Survey</Text>
                            {/* <Ionicons name="open-outline" size={20} color="#2563eb" /> */}
                        </Pressable>
                            </View>
                    </View>
                );

            default:
                return null;
        }
    };

    if (!task.extras || task.extras.length === 0) return null;
    
    // For date changes, we might want a global save button if multiple fields are edited
    const isSaving = createExtras.isPending || updateExtras.isPending;

    return (
        <>
            <ScrollView style={styles.container}>
                {task.status === 'completed' && (
                    <View style={styles.completedBanner}>
                        <Text style={styles.completedLabel}>Task Completed</Text>
                        <Ionicons name="checkmark-circle" size={24} color="#34d399" />
                    </View>
                )}

                {task.extras.map((extra, index) => renderExtra(extra, index))}

                {/* Show Save Button only if there are changes (simplified logic: always show if needed or rely on 'Change Date' button) */}
                {/* 
                   In mentor view, we usually just view. But if they change date, they need to save. 
                   The 'Change Date' button inside DATE_PICKER calls handleSubmit.
                */}
            </ScrollView>

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
    textInputDisabled: {
        opacity: 0.8,
        color: '#ccc',
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
    checkboxDisabled: {
        opacity: 0.6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        marginBottom: 10,
    },
    fileName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '400',
        flex: 1,
        textAlign: 'left',
        letterSpacing: 0.3,
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
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    textDisplayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    centeredLinkButton: {
        backgroundColor: 'white',
        color: '#001FC1',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 8,
    },
    centeredLinkText: {
        color: '#001FC1',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
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
