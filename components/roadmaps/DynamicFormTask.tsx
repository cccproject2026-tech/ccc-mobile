import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { SignatureModal } from "@/components/forms/SignatureModal";
import {
    useCreateRoadmapExtras,
    useDeleteRoadmapDocument,
    useTaskCurrentDocuments,
    useRoadmapExtrasWithFallback,
    useUpdateRoadmapExtras,
    useUploadRoadmapDocument,
} from "@/hooks/roadmaps/useRoadmaps";
import {
    useLatestSubmission,
    useCreateSubmission,
    useUploadSubmissionDocument,
} from "@/hooks/roadmap/useTaskSubmissions";
import { useTriggerJumpstart } from "@/hooks/roadmaps/useTriggerJumpstart";
import { useAssessmentProgress } from "@/hooks/progress/useProgress";

import {
    getEffectiveTaskExtras,
    isAssessmentOnlyTask,
    normalizeMongoId,
    normalizeNestedTaskStatus,
    savedExtrasToFormValues,
    shouldUpdateTaskExtras,
} from "@/lib/roadmap/helpers";
import {
    isJumpstartBlockingError,
    presentJumpstartBlockingError,
} from "@/lib/roadmap/jumpstartErrors";
import { saveTaskRoadmapExtras } from "@/lib/roadmap/saveTaskExtras";
import { extractApiErrorMessage } from "@/utils/availability/api-error";
import { Extra, NestedRoadmap, Roadmap } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import RNFS from "react-native-fs";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    ActivityIndicator,
    Alert,
    Image,
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
    /** Parent roadmap — form fields may be defined here (e.g. Jumpstart). */
    parentRoadmap?: Roadmap | null;
    phaseId?: string;
    itemId?: string;
    userId?: string;
}

export function DynamicFormTask({ task, parentRoadmap, phaseId: roadmapId, itemId, userId }: Props) {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    
    // Determine target user and if we are in read-only (mentor) mode
    const targetUserId = userId || currentUser?.id;
    const isMentorView = !!userId && userId !== currentUser?.id;
    const getLinkedAssessmentId = (extra: { assessmentId?: unknown }) =>
        normalizeMongoId(extra.assessmentId);
    const getAssessmentAnswerQuestionsPath = () => {
        const role = String(currentUser?.role ?? "").toLowerCase();
        return role === "mentor"
            ? "/(mentor)/assessments/answer-questions"
            : "/(pastor)/assessments/answer-questions";
    };
    const getAssessmentSurveyGuidelinesPath = () => {
        const role = String(currentUser?.role ?? "").toLowerCase();
        return role === "mentor"
            ? "/(mentor)/assessments/survey-guidelines"
            : "/(pastor)/assessments/survey-guidelines";
    };

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [pendingFiles, setPendingFiles] = useState<Record<string, any[]>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [openSignatureField, setOpenSignatureField] = useState<string | null>(null);

    /** Match roadmap.service get/update extras: only 24-char hex IDs are sent on GET/PATCH query strings. */
    const isMongoObjectId = (id: string | undefined): id is string =>
        !!id &&
        typeof id === "string" &&
        id.trim() !== "" &&
        id.length === 24 &&
        /^[0-9a-fA-F]{24}$/.test(id);

    const ensureUrlScheme = (url: string) => {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return `https://${url}`;
        }
        return url;
    };

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

    /** Load existing extras from API */
    const {
        data: existingExtras,
        isLoading: isLoadingExtras,
        isFetching: isFetchingExtras,
        hasNestedSavableExtras,
        roadmapLevelExtrasExist,
    } = useRoadmapExtrasWithFallback(
            isMongoObjectId(roadmapId) ? roadmapId : undefined,
            isMongoObjectId(itemId) ? itemId : undefined,
            isMongoObjectId(targetUserId) ? targetUserId : undefined,
        );

    const effectiveExtras = useMemo(
        () => getEffectiveTaskExtras(task, parentRoadmap, existingExtras?.extras),
        [task, parentRoadmap, existingExtras?.extras],
    );

    const createExtras = useCreateRoadmapExtras();
    const updateExtras = useUpdateRoadmapExtras();
    const uploadDocument = useUploadRoadmapDocument();
    const deleteDocument = useDeleteRoadmapDocument();
    const {
        mutateAsync: triggerJumpstartAsync,
        isPending: isTriggeringJumpstart,
    } = useTriggerJumpstart();
    const jumpstartTriggeredUsersRef = useRef<Set<string>>(new Set());
    const { data: assessmentProgress } = useAssessmentProgress(targetUserId);
    const hasNestedTaskId = isMongoObjectId(itemId);
    const isUpdateMode = shouldUpdateTaskExtras(
        hasNestedTaskId,
        hasNestedSavableExtras,
        existingExtras?.extras,
        roadmapLevelExtrasExist,
    );

    
    const { data: latestSubmission } = useLatestSubmission(
        isMongoObjectId(roadmapId) ? roadmapId : undefined,
        isMongoObjectId(itemId) ? itemId : undefined,
        isMongoObjectId(targetUserId) ? targetUserId : undefined,
    );
    const createSubmission = useCreateSubmission();
    const uploadSubmissionDoc = useUploadSubmissionDocument();

    /** Initialise formData from API or default dates */
    useEffect(() => {
        

        const init: Record<string, any> = {};
        
        
        effectiveExtras.forEach((extra) => {
            if (extra.date) init[extra.name] = extra.date;
        });

        Object.assign(init, savedExtrasToFormValues(existingExtras?.extras));
        
        setFormData(init);
        setErrors({});
    }, [existingExtras, effectiveExtras]);

    const handleChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    };

    const validateForm = () => Object.keys(formData).length > 0;

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

    const collectSignatureErrors = (extras?: Extra[]): Record<string, string> => {
        const fieldErrors: Record<string, string> = {};

        if (!extras) return fieldErrors;

        for (const extra of extras) {
            if (extra.type === "SIGNATURE" && extra.required) {
                const value = formData[extra.name];
                if (!value) {
                    fieldErrors[extra.name] = "Signature is required.";
                }
            }

            if (extra.sections && extra.sections.length > 0) {
                Object.assign(fieldErrors, collectSignatureErrors(extra.sections));
            }
        }

        return fieldErrors;
    };

    const ensureJumpstartTriggered = async (): Promise<boolean> => {
        const user = currentUser;
        // Must match GET/PATCH/create: same `roadmapId` as route `phaseId`, not a different "Jumpstart" roadmap from assigned list.
        const extrasRoadmapId = isMongoObjectId(roadmapId) ? roadmapId : undefined;
        const nestedForExtras = isMongoObjectId(itemId) ? itemId : undefined;

        if (!extrasRoadmapId || !user?.id) {
            console.error("❌ Missing required data for jumpstart POST", {
                extrasRoadmapId,
                userId: user?.id,
            });
            return true;
        }

        if (jumpstartTriggeredUsersRef.current.has(user.id)) {
            return true;
        }

        console.log("STEP 1: Jumpstart trigger (POST)", {
            roadmapId: extrasRoadmapId,
            userId: user.id,
            nestedRoadMapItemId: nestedForExtras,
        });

        try {
            const response = await triggerJumpstartAsync({
                roadmapId: extrasRoadmapId,
                userId: user.id,
                nestedRoadMapItemId: nestedForExtras,
            });
            console.log("Jumpstart API response:", response);

            if (response?.success || response?.alreadyExists) {
                jumpstartTriggeredUsersRef.current.add(user.id);
            }
            return true;
        } catch (error) {
            if (isJumpstartBlockingError(error)) {
                presentJumpstartBlockingError(error);
                return false;
            }
            console.warn(
                "[Jumpstart Trigger] Failed (non-blocking). Continuing extras flow.",
                error,
            );
            return true;
        }
    };

    /** Save progress – always creates a NEW submission record + extras for backward compat */
    const handleSubmit = async () => {
        const signatureErrors = collectSignatureErrors(effectiveExtras);
        if (Object.keys(signatureErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...signatureErrors }));
            Alert.alert("Missing Signature", "Signature is required.");
            return;
        }

        if (!validateForm()) {
            Alert.alert("No Data", "Please fill in at least one field before saving progress");
            return;
        }
        if (!currentUser?.id) {
            Alert.alert("Error", "User not authenticated");
            return;
        }

        try {
            const jumpstartOk = await ensureJumpstartTriggered();
            if (!jumpstartOk) return;

            const usePatchForExtras =
                isUpdateMode ||
                roadmapLevelExtrasExist ||
                jumpstartTriggeredUsersRef.current.has(currentUser.id);

            
            const responsesArray = Object.entries(formData).map(([name, value]) => {
                const type = getExtraType(name, value);
                if (type === "SIGNATURE") {
                    return { type: "SIGNATURE", name, signatureData: value };
                }
                return {
                    type,
                    name,
                    value: type === "UPLOAD" ? true : value,
                };
            });

            const nestedExtraId = isMongoObjectId(itemId) ? itemId : undefined;
            const pendingFilesSnapshot = { ...pendingFiles };

            // 1️⃣ Create a new submission record (immutable) when API exists
            try {
                const newSubmission = await createSubmission.mutateAsync({
                    roadMapId: roadmapId!,
                    nestedRoadMapItemId: nestedExtraId,
                    submittedBy: currentUser.id,
                    responses: responsesArray,
                    resubmittedFromSubmissionId: latestSubmission?._id ?? null,
                });

                for (const [extraName, files] of Object.entries(pendingFilesSnapshot)) {
                    for (const file of files) {
                        await uploadSubmissionDoc.mutateAsync({
                            submissionId: newSubmission._id,
                            extraName,
                            file,
                        });
                    }
                }
            } catch {
                // Submission API not yet available — continue with extras fallback
            }

            // 2️⃣ Save extras for backward compatibility with progress tracking
            await saveTaskRoadmapExtras({
                isUpdateMode: usePatchForExtras,
                roadMapId: roadmapId!,
                userId: currentUser.id,
                nestedRoadMapItemId: nestedExtraId,
                extras: responsesArray,
                createExtras: (payload) => createExtras.mutateAsync(payload),
                updateExtras: (vars) => updateExtras.mutateAsync(vars),
            });

            setPendingFiles({});

            // 3️⃣ Upload files to legacy extras endpoint too (backward compat)
            for (const [extraName, files] of Object.entries(pendingFilesSnapshot)) {
                for (const file of files) {
                    await uploadDocument.mutateAsync({
                        roadMapId: roadmapId!,
                        userId: currentUser.id,
                        nestedRoadMapItemId: itemId!,
                        extraName,
                        file,
                    }).catch(() => {});
                }
            }

            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                router.back();
            }, 1800);
        } catch (err: unknown) {
            if (isJumpstartBlockingError(err)) {
                presentJumpstartBlockingError(err);
                return;
            }
            console.error("❌ Submission error:", err);
            Alert.alert(
                "Submission Failed",
                extractApiErrorMessage(err) || "Failed to submit. Please try again.",
            );
        }
    };

    /** ───────────────────── UPLOAD FIELD ───────────────────── */

    const UploadField = ({ extraName, isEditable = true }: { extraName: string, isEditable?: boolean }) => {
        const { data: docs = [], isLoading } = useTaskCurrentDocuments(
            roadmapId!,
            itemId!,
            targetUserId!,
            extraName,
            {
                latestSubmission,
                extras: existingExtras ?? undefined,
            },
        );

        
        const isMediaUpload =
            extraName.toLowerCase().includes("image") ||
            extraName.toLowerCase().includes("video") ||
            extraName.toLowerCase().includes("photo") ||
            extraName.toLowerCase().includes("media");

        const fieldEditable = isEditable && !isMentorView;

        const confirmDelete = (doc: any) => {
            if (!fieldEditable) return;
            Alert.alert(
                "Delete Document",
                `Are you sure you want to delete "${decodeURIComponent(doc.fileName)}"?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                            deleteDocument.mutate({
                                roadMapId: roadmapId!,
                                userId: targetUserId!,
                                nestedId: itemId!,
                                fileUrl: doc.fileUrl,
                                uploadBatchId: doc.uploadBatchId,
                            });
                            // If this was the last file, we should technically clear formData
                            // but since it's on server, it might be safer to let the next refresh handle it
                            
                            if (docs.length <= 1 && (!pendingFiles[extraName] || pendingFiles[extraName].length === 0)) {
                                handleChange(extraName, false);
                            }
                        },
                    },
                ]
            );
        };

        const pickFile = async () => {
            if (!fieldEditable) return;
            const res = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                multiple: true,
            });
            if (res.canceled) return;

            const newFiles = res.assets.map(a => ({
                id: `${a.name}-${Date.now()}`,
                uri: a.uri,
                name: a.name,
                type: a.mimeType,
                size: a.size,
            }));

            setPendingFiles(prev => ({
                ...prev,
                [extraName]: [...(prev[extraName] || []), ...newFiles],
            }));
            
            
            handleChange(extraName, true);
        };

        const deletePendingLocal = (fileId: string) => {
            if (!fieldEditable) return;
            setPendingFiles(prev => {
                const updated = prev[extraName]?.filter(f => f.id !== fileId) || [];
                
                // If no pending files AND no server files, clear form data
                if (updated.length === 0 && docs.length === 0) {
                    handleChange(extraName, false);
                }
                
                return {
                    ...prev,
                    [extraName]: updated,
                };
            });
        };

        const hasServerFiles = docs.length > 0;
        const hasPendingFiles = (pendingFiles[extraName]?.length ?? 0) > 0;

        
        const buttonText = isMediaUpload
            ? hasServerFiles || hasPendingFiles
                ? "Re-Submit"
                : extraName
            : hasServerFiles || hasPendingFiles
                ? "Upload New Strategy"
                : extraName;

        return (
            <View style={{ marginBottom: 20 }}>
                {}
                {isLoading ? (
                    <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
                ) : (
                    hasServerFiles && (
                        <View style={[styles.uploadedFilesContainer]}>

                            {}
                            {!isMediaUpload && (
                                <Text style={styles.uploadedFilesLabel}>Uploaded :</Text>
                            )}

                            {}
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

                                        {}
                                        {!isMediaUpload && (
                                            <Pressable
                                                onPress={() => confirmDelete(doc)}
                                                style={styles.removeIconWrapper}
                                                disabled={!fieldEditable}
                                            >
                                                <Ionicons name="trash" size={20} color={fieldEditable ? "#ef4444" : "#999"} />
                                            </Pressable>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    )
                )}

                {}
                {hasPendingFiles &&
                    pendingFiles[extraName]?.map((f) => (
                        <View
                            key={f.id}
                            style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
                        >
                            <Text style={{ color: "white", flex: 1 }}>• {f.name} (pending)</Text>

                            <Pressable onPress={() => deletePendingLocal(f.id)} disabled={!fieldEditable}>
                                <Ionicons name="close-circle" size={20} color={fieldEditable ? "#ef4444" : "#999"} />
                            </Pressable>
                        </View>
                    ))}

                {}
                {!isMentorView && !hasServerFiles && !hasPendingFiles && (
                    <Text style={styles.uploadHint}>Supported: PDF, images, videos, Word docs</Text>
                )}

                {(!isMentorView || hasServerFiles) && (
                    <Pressable
                        style={[
                            styles.uploadButton, 
                            styles.uploadButtonWhite,
                            (!isMentorView && !fieldEditable) && { opacity: 0.6 }
                        ]}
                        onPress={() => {
                            if (isMentorView) {
                                if (docs.length > 0) {
                                    Linking.openURL(docs[0].fileUrl).catch(err => 
                                        Alert.alert("Error", "Could not open document: " + err.message)
                                    );
                                } else {
                                    Alert.alert("No Files", "There are no files uploaded yet.");
                                }
                            } else {
                                pickFile();
                            }
                        }}
                        disabled={!isMentorView && !fieldEditable}
                    >
                        <Ionicons 
                            name={isMentorView ? "download-outline" : "attach"} 
                            size={22} 
                            color={(!isMentorView && !fieldEditable) ? "#999" : "#2563eb"} 
                        />
                        <Text style={[styles.uploadButtonText, (!isMentorView && !fieldEditable) && { color: "#999" }]}>
                            {isMentorView ? `Download ${extraName}` : buttonText}
                        </Text>
                    </Pressable>
                )}
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
                        <UploadField extraName={extra.name} isEditable={(extra as any).editable !== false} />
                    </View>
                );

            case "TEXT_FIELD":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={[styles.textInput, isMentorView && styles.textInputDisabled]}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                            value={formData[extra.name] || ""}
                            onChangeText={v => handleChange(extra.name, v)}
                            editable={!isMentorView}
                        />
                    </View>
                );

            case "TEXT_AREA":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea, isMentorView && styles.textInputDisabled]}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                            multiline
                            numberOfLines={4}
                            value={formData[extra.name] || ""}
                            onChangeText={v => handleChange(extra.name, v)}
                            editable={!isMentorView}
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
                const checkboxEditable = !isMentorView;
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {}
                        <Pressable
                            onPress={() => checkboxEditable && handleChange(extra.name, !formData[extra.name])}
                            style={styles.checkboxRow}
                            disabled={!checkboxEditable}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    formData[extra.name] && styles.checkboxChecked,
                                    !checkboxEditable && styles.checkboxDisabled,
                                ]}
                            >
                                {formData[extra.name] && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{extra.name}</Text>
                        </Pressable>

                        {}
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginLeft: 36, marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const isChecked = !!formData[cbId];

                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <Pressable
                                                onPress={() =>
                                                    checkboxEditable && handleChange(cbId, !isChecked)
                                                }
                                                style={styles.checkboxRow}
                                                disabled={!checkboxEditable}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        isChecked && styles.checkboxChecked,
                                                        !checkboxEditable && styles.checkboxDisabled,
                                                    ]}
                                                >
                                                    {isChecked && (
                                                        <Text style={styles.checkmark}>
                                                            ✓
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>
                                                    {checkbox.name}
                                                </Text>
                                            </Pressable>

                                            {checkbox.haveButton &&
                                                checkbox.buttonName && !isMentorView && (
                                                    <Pressable
                                                        style={styles.button}
                                                        onPress={() =>
                                                            console.log(
                                                                "Button pressed",
                                                                checkbox.buttonName
                                                            )
                                                        }
                                                    >
                                                        <Text style={styles.buttonText}>
                                                            {checkbox.buttonName}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {}
                        {extra.haveButton && extra.buttonName && !isMentorView && (
                            <Pressable
                                style={[styles.button, { marginTop: 8 }]}
                                onPress={() =>
                                    console.log("Button pressed", extra.buttonName)
                                }
                            >
                                <Text style={styles.buttonText}>
                                    {extra.buttonName}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                );

            case "DATE_PICKER":
                
                const isDateEditable = (extra.checkboxes?.some(cb => cb.name === 'Allow pastor to select Date') ?? true) && !isMentorView;

                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.fieldRow}>
                            <Text
                                style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}
                            >
                                {extra.name}
                            </Text>
                            <View style={[
                                styles.dateInputContainer,
                                !isDateEditable && styles.dateInputDisabled
                            ]}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="DD / MM / YY"
                                    placeholderTextColor="#9cc2ff"
                                    value={formData[extra.name] !== undefined ? formData[extra.name] : (extra.date || "")}
                                    keyboardType="number-pad"
                                    maxLength={12}
                                    editable={isDateEditable}
                                    onChangeText={v => {
                                        if (!isDateEditable) return;
                                        
                                        
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
                                        
                                        // If the user is deleting and ends with a space or slash, 
                                        
                                        // However, the above logic re-calculates based on raw digits.
                                        // If they delete ' / ', raw length decreases, and formatted is correct.
                                        
                                        handleChange(extra.name, formatted);
                                    }}
                                />
                            </View>
                        </View>

                        {}
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                {extra.checkboxes
                                    .filter(cb => cb.name !== 'Allow pastor to select Date' && cb.name !== 'Show date on info card')
                                    .map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const checked = !!formData[cbId];
                                    const checkboxEnabled = !isMentorView;

                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <Pressable
                                                onPress={() =>
                                                    checkboxEnabled && handleChange(cbId, !checked)
                                                }
                                                style={styles.checkboxRow}
                                                disabled={!checkboxEnabled}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        checked && styles.checkboxChecked,
                                                        !checkboxEnabled && styles.checkboxDisabled,
                                                    ]}
                                                >
                                                    {checked && (
                                                        <Text style={styles.checkmark}>
                                                            ✓
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>
                                                    {checkbox.name}
                                                </Text>
                                            </Pressable>

                                            {checkbox.haveButton &&
                                                checkbox.buttonName && !isMentorView && (
                                                    <Pressable
                                                        style={styles.button}
                                                        onPress={() =>
                                                            console.log(
                                                                "Button pressed",
                                                                checkbox.buttonName
                                                            )
                                                        }
                                                    >
                                                        <Text style={styles.buttonText}>
                                                            {checkbox.buttonName}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {}
                        {extra.buttonName && !isMentorView && (
                            <Pressable
                                style={[styles.button, { marginTop: 8 }]}
                                onPress={() =>
                                    console.log("Button pressed", extra.buttonName)
                                }
                            >
                                <Text style={styles.buttonText}>
                                    {extra.buttonName}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                );

            case "SECTION":
                return (
                    <View key={id} style={styles.sectionBox}>
                        <Text style={styles.sectionBoxTitle}>{extra.name}</Text>

                        {}
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const checked = !!formData[cbId];

                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <Pressable
                                                onPress={() =>
                                                    handleChange(cbId, !checked)
                                                }
                                                style={styles.checkboxRow}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        checked && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {checked && (
                                                        <Text style={styles.checkmark}>
                                                            ✓
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>
                                                    {checkbox.name}
                                                </Text>
                                            </Pressable>

                                            {checkbox.haveButton &&
                                                checkbox.buttonName && (
                                                    <Pressable
                                                        style={styles.button}
                                                        onPress={() =>
                                                            console.log(
                                                                "Button pressed",
                                                                checkbox.buttonName
                                                            )
                                                        }
                                                    >
                                                        <Text style={styles.buttonText}>
                                                            {checkbox.buttonName}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {}
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
                                } else {
                                    console.log("Button pressed, but no linkUrl:", extra.name);
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>{extra.name || "Action Button"}</Text>
                        </Pressable>
                    </View>
                );

            case "ASSESSMENT": {
                const linkedAssessmentId = getLinkedAssessmentId(extra);
                const isSpecificAssessmentCompleted = assessmentProgress?.items?.some(
                    (item: any) =>
                        normalizeMongoId(item.assessmentId) === linkedAssessmentId &&
                        item.status === 'completed'
                );

                if (isSpecificAssessmentCompleted) {
                    return (
                        <View key={id} style={styles.fieldContainer}>
                            <TouchableOpacity
                                style={styles.centeredLinkButton}
                                onPress={() => {
                                    if (!linkedAssessmentId) return;
                                    const viewParams: Record<string, string> = {
                                        assessmentId: linkedAssessmentId,
                                        viewMode: "true",
                                        hasPreSurvey: "false",
                                    };
                                    if (isMentorView && targetUserId) {
                                        viewParams.targetUserId = String(targetUserId);
                                    }
                                    router.push({
                                        pathname: getAssessmentAnswerQuestionsPath() as any,
                                        params: viewParams,
                                    });
                                }}
                            >
                                <Text style={styles.centeredLinkText}>View your Survey Results</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, { marginTop: 8 }]}
                                onPress={() => {
                                    Alert.alert(
                                        "Repeat Survey",
                                        `Are you sure you want to repeat this ${extra.name} survey? Your previous answers will be kept as a record.`,
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Repeat",
                                                onPress: () => {
                                                    if (!linkedAssessmentId) return;
                                                    router.push({
                                                        pathname: getAssessmentAnswerQuestionsPath() as any,
                                                        params: {
                                                            assessmentId: linkedAssessmentId,
                                                            hasPreSurvey: "true"
                                                        }
                                                    });
                                                }
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Text style={styles.buttonText}>
                                    Repeat {extra.name} Survey
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }

                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.assessmentButton}>
                            <View style={styles.assessmentContent}>
                                <Text style={styles.assessmentTitle}>
                                    {extra.name}
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            style={styles.button}
                            onPress={() => {
                                if (!linkedAssessmentId) {
                                    Alert.alert("Error", "No assessment ID found for this task.");
                                    return;
                                }

                                const hasScheduleMeeting = extra.checkboxes?.some(
                                    cb => cb.name === 'Schedule Meeting after the Assessment'
                                );
                                router.push({
                                    pathname: getAssessmentSurveyGuidelinesPath() as any,
                                    params: {
                                        assessmentId: linkedAssessmentId,
                                        ...(hasScheduleMeeting
                                            ? { scheduleMeeting: "true" }
                                            : {}),
                                    },
                                });
                            }}
                        >
                            <Text style={styles.buttonText}>
                                {extra.buttonName || "Take Assessment"}
                            </Text>
                            <Ionicons name="open-outline" size={20} color="#2563eb" />
                        </Pressable>

                        {}
                        {extra.checkboxes?.some(cb => cb.name === 'Schedule Meeting after the Assessment') && (
                            <View style={[styles.checkboxRow, { marginTop: 12 }]}>
                                <Ionicons name="information-circle-outline" size={20} color="#fff" />
                                <Text style={styles.checkboxLabel}>
                                    Please schedule a meeting with your mentor after completing this assessment.
                                </Text>
                            </View>
                        )}
                    </View>
                );
            }

            case "SIGNATURE": {
                const signatureValue = formData[extra.name] || null;
                const isMentorReadOnly = isMentorView;
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                            {extra.name}
                            {extra.required && <Text style={styles.required}> *</Text>}
                        </Text>
                        <Pressable
                            style={styles.signaturePlaceholder}
                            onPress={() => {
                                if (isMentorReadOnly) {
                                    if (!signatureValue) return;

                                    Alert.alert(
                                        "Signature Options",
                                        "What would you like to do?",
                                        [
                                            {
                                                text: "View",
                                                onPress: () =>
                                                    Linking.openURL(signatureValue).catch(() =>
                                                        Alert.alert(
                                                            "Error",
                                                            "Could not open signature image."
                                                        )
                                                    ),
                                            },
                                            {
                                                text: "Download",
                                                onPress: () => downloadSignature(signatureValue),
                                            },
                                            { text: "Cancel", style: "cancel" },
                                        ]
                                    );
                                } else {
                                    setOpenSignatureField(extra.name);
                                }
                            }}
                            disabled={isMentorReadOnly && !signatureValue}
                        >
                            {signatureValue ? (
                                isMentorReadOnly ? (
                                    <Text style={styles.tapToSignText}>
                                        Download Signature
                                    </Text>
                                ) : (
                                    <Text style={styles.tapToSignText}>
                                        Tap to Re‑Sign
                                    </Text>
                                )
                            ) : (
                                <Text style={styles.tapToSignText}>
                                    {extra.placeHolder || (isMentorReadOnly ? "No signature provided yet" : "Tap to Sign")}
                                </Text>
                            )}
                        </Pressable>
                        {errors[extra.name] && (
                            <Text style={styles.fieldError}>{errors[extra.name]}</Text>
                        )}
                    </View>
                );
            }

            default:
                return null;
        }
    };

    if (effectiveExtras.length === 0) return null;

    const hasOnlyAssessments = isAssessmentOnlyTask(effectiveExtras);

    const isSaving =
        createExtras.isPending ||
        updateExtras.isPending ||
        uploadDocument.isPending ||
        isTriggeringJumpstart ||
        createSubmission.isPending;

    const scheduledMeeting = task.meetings?.find(
        (m) => !String(m?.status ?? '').trim().toLowerCase().startsWith('cancel'),
    );
    const isTaskCompleted = normalizeNestedTaskStatus(task.status) === 'completed';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear().toString().slice(-2);
        return `${day} ${month} ${year}`;
    };

    if (isLoadingExtras || (isFetchingExtras && Object.keys(formData).length === 0)) {
        return (
            <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff", marginTop: 10, textAlign: 'center' }}>
                    Loading form data…
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                {isTaskCompleted && (
                    <View style={styles.completedBanner}>
                        <Text style={styles.completedLabel}>Task Completed</Text>
                        <Ionicons name="checkmark-circle" size={24} color="#34d399" />
                    </View>
                )}

                {effectiveExtras.map((extra, index) => renderExtra(extra, index))}

                {!isMentorView && !hasOnlyAssessments && !isTaskCompleted && (
                    <Pressable
                        style={[
                            styles.signButton,
                            isSaving && styles.signButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#1e40af" />
                        ) : (
                            <Text style={styles.signButtonText}>
                                {latestSubmission ? "Submit New Version" : "Save Progress"}
                            </Text>
                        )}
                    </Pressable>
                )}
            </ScrollView>

            <SignatureModal
                visible={openSignatureField !== null}
                onSave={(signature) => {
                    if (openSignatureField) handleChange(openSignatureField, signature);
                    setOpenSignatureField(null);
                }}
                onClose={() => setOpenSignatureField(null)}
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
    fieldDisabled: { opacity: 0.5 },
    fieldLabel: { color: 'white', fontSize: 16, marginBottom: 8, fontWeight: '500' },
    required: { color: '#f97373' },
    fieldError: { color: '#fecaca', fontSize: 13, marginTop: 6 },
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
    reSignText: { color: '#93c5fd', fontSize: 14, textDecorationLine: 'underline', marginTop: 8 },
    textInput: {
        backgroundColor: 'rgba(64, 156, 186, 0.5)',
        padding: 14,
        borderRadius: 8,
        color: 'white',
        fontSize: 15,
    },
    text: {
        color: 'white',
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
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
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: 'rgba(64, 156, 186, 0.3)',
        borderRadius: 8,
        marginBottom: 8,
        gap: 12,
    },
    checklistLabel: { color: 'white', fontSize: 15, flex: 1 },

    uploadButton: {
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
    uploadHint: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 4,
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
        paddingHorizontal: 0,
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
    removeIconWrapper: {
        padding: 4,
        marginLeft: 8,
    },
    dateButton: {
        backgroundColor: 'rgba(64, 156, 186, 0.5)',
        padding: 14,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16,
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
    dateInputDisabled: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        opacity: 0.7,
    },
    dateInput: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        padding: 0,
        minWidth: 120,
    },
    dateButtonText: { color: 'white', fontSize: 15 },
    dropdownContainer: { gap: 8 },
    dropdownOption: {
        backgroundColor: 'rgba(64, 156, 186, 0.3)',
        padding: 14,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dropdownOptionSelected: { borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.2)' },
    dropdownOptionText: { color: 'white', fontSize: 15 },
    dropdownOptionTextSelected: { color: '#34d399', fontWeight: '600' },
    signButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center' },
    signButtonDisabled: { backgroundColor: '#666', opacity: 0.6 },
    signButtonText: { color: '#1e40af', fontSize: 16, fontWeight: '600' },
    documentLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    documentLinkText: { color: '#60a5fa', fontSize: 14, textDecorationLine: 'underline' },
    helperText: { color: '#9cc2ff', fontSize: 13, marginTop: 8, textAlign: 'center' },
    sectionHeader: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },
    linkButton: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    linkButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    centeredLinkButton: {
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 8,
    },
    centeredLinkText: {
        color: '#FFFFFF',
        fontSize: 16,
        textDecorationLine: 'underline',
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
    assessmentLabel: { color: '#9cc2ff', fontSize: 14 },
    submitButton: {
        backgroundColor: '#34d399',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: { backgroundColor: '#666', opacity: 0.6 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
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
    button: {
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
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'white',
    },
    buttonText: {
        color: '#2563eb',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    buttonTextOutline: {
        color: 'white',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    meetingBanner: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bannerIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerIconText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bannerText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    checkboxDisabled: {
        opacity: 0.6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    textInputDisabled: {
        opacity: 0.8,
        color: '#ccc',
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
    completedDate: {
        color: 'white',
        fontSize: 14,
    },
});
