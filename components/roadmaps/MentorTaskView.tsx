import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import { useAssessmentProgress } from "@/hooks/progress/useProgress";
import {
    useCreateSubmission,
    useLatestSubmission,
    useUploadSubmissionDocument,
} from "@/hooks/roadmap/useTaskSubmissions";
import {
    useCreateRoadmapExtras,
    useDeleteRoadmapDocument,
    useRoadmapDocuments,
    useTaskCurrentDocuments,
    useRoadmapExtrasWithFallback,
    useUpdateRoadmapExtras,
    useUploadRoadmapDocument,
} from "@/hooks/roadmaps/useRoadmaps";
import {
    getEffectiveTaskExtras,
    isAssessmentOnlyTask,
    normalizeMongoId,
    normalizeNestedTaskStatus,
    parseRoadmapTimestampMs,
    savedExtrasToFormValues,
    shouldUpdateTaskExtras,
} from "@/lib/roadmap/helpers";
import {
    buildExtraFieldKey,
    buildSectionCheckboxKey,
    findExtraByFieldKey,
    seedDefaultFormValues,
} from "@/lib/roadmap/extraFieldKeys";
import {
    coerceDatePickerValue,
    collectPastDateFieldErrors,
    getStartOfTodayLocal,
    isBeforeTodayLocal,
    parseRoadmapDateValue,
    PAST_DATE_VALIDATION_MESSAGE,
} from "@/lib/dates/pastorDateSelection";
import {
    withJumpstartCompleteExtra,
} from "@/lib/roadmap/ensureJumpstartPastorSubmit";
import {
    isJumpstartBlockingError,
    presentJumpstartBlockingError,
} from "@/lib/roadmap/jumpstartErrors";
import { isJumpStartRoadmap } from "@/lib/roadmap/journeyFlow";
import { saveTaskRoadmapExtras } from "@/lib/roadmap/saveTaskExtras";
import { extractApiErrorMessage } from "@/utils/availability/api-error";
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
import { format } from "date-fns";
import { pickUploadFiles } from "@/lib/media/pickUploadFiles";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Image,
    Linking,
    Modal,
    Pressable,
    Animated as RNAnimated,
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
    userId?: string;
    /** When provided, called after a successful save instead of showing the default modal + router.back(). */
    onSaveSuccess?: () => void;
    /** Mentor browsing Roadmap Library templates — view-only, no save/submit. */
    libraryPreview?: boolean;
}

export function MentorTaskView({
    task,
    parentRoadmap,
    phaseId: roadmapId,
    itemId,
    userId,
    onSaveSuccess,
    libraryPreview = false,
}: Props) {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();

    const targetUserId = userId;

    /** Mentor reviewing a pastor's work — single source of truth for read-only UX. */
    const isViewingPastor = Boolean(
        userId && currentUser?.id && String(userId) !== String(currentUser.id),
    );
    const isLibraryPreview = libraryPreview === true;
    const isPreviewMode = isViewingPastor || isLibraryPreview;

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [pendingFiles, setPendingFiles] = useState<Record<string, { id: string; uri: string; name: string; type: string }[]>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeDateField, setActiveDateField] = useState<string | null>(null);
    const [dateFieldErrors, setDateFieldErrors] = useState<Record<string, string>>({});
    const [signaturePreview, setSignaturePreview] = useState<{ visible: boolean; uri: string | null }>({
        visible: false,
        uri: null,
    });
    const [signatureEditor, setSignatureEditor] = useState<{ visible: boolean; fieldName: string | null }>({
        visible: false,
        fieldName: null,
    });

    const isValidObjectId = (id: string | undefined) => !!id;

    const parseAnyDate = (raw?: string): Date | null => parseRoadmapDateValue(raw);

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
    const {
        data: existingExtras,
        isLoading: isLoadingExtras,
        isFetching: isFetchingExtras,
        hasNestedSavableExtras,
        roadmapLevelExtrasExist,
    } = useRoadmapExtrasWithFallback(
            isValidObjectId(roadmapId) ? roadmapId : undefined,
            isValidObjectId(itemId) ? itemId : undefined,
            isValidObjectId(targetUserId) ? targetUserId : undefined,
            { enabled: !isLibraryPreview },
        );

    const effectiveExtras = useMemo(
        () => getEffectiveTaskExtras(task, parentRoadmap, existingExtras?.extras),
        [task, parentRoadmap, existingExtras?.extras],
    );

    const createExtras = useCreateRoadmapExtras();
    const updateExtras = useUpdateRoadmapExtras();
    const uploadDocument = useUploadRoadmapDocument();
    const deleteDocument = useDeleteRoadmapDocument();
    const { data: assessmentProgress } = useAssessmentProgress(
        isLibraryPreview ? undefined : targetUserId,
    );

    
    const { data: latestSubmission, error: submissionError } = useLatestSubmission(
        roadmapId,
        itemId,
        targetUserId,
    );
    const createSubmission = useCreateSubmission();
    const uploadSubmissionDoc = useUploadSubmissionDocument();

    const hasNestedTaskId = isValidObjectId(itemId);
    const isUpdateMode = shouldUpdateTaskExtras(
        hasNestedTaskId,
        hasNestedSavableExtras,
        existingExtras?.extras,
        roadmapLevelExtrasExist,
    );
    const isTaskAlreadyCompleted = normalizeNestedTaskStatus(task.status) === "completed";

    /**
     * Task has been previously submitted if:
     * - New submission API returns a record, OR
     * - Legacy: existing extras exist AND task is completed (pre-migration fallback)
     */
    const hasSubmission = !!latestSubmission || (isUpdateMode && isTaskAlreadyCompleted);

    /** Submission number for display — from API or inferred as 1 for legacy data. */
    const currentSubmissionNumber = latestSubmission?.submissionNumber ?? (hasSubmission ? 1 : 0);

    const [isResubmitting, setIsResubmitting] = useState(false);
    const [showSubmitToast, setShowSubmitToast] = useState(false);
    const toastOpacity = useRef(new RNAnimated.Value(0)).current;

    /**
     * Read-only when:
     * - Mentor is viewing a pastor's work (isViewingPastor)
     * - Task already has a submission AND we're not in resubmit mode
     */
    const isReadOnly =
        isPreviewMode || (hasSubmission && !isResubmitting);

    const isPastorEditor =
        String(currentUser?.role ?? "").toLowerCase() === "pastor" && !isReadOnly;

    const isJumpStartPhase = useMemo(
        () => isJumpStartRoadmap(parentRoadmap ?? null),
        [parentRoadmap],
    );

    const confirmDiscardResubmit = useCallback(() => {
        Alert.alert(
            "Discard resubmission?",
            "Your new draft will be lost.",
            [
                { text: "Continue Editing", style: "cancel" },
                {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => {
                        setIsResubmitting(false);
                        
                        if (latestSubmission?.responses) {
                            const restored: Record<string, any> = {};
                            for (const r of latestSubmission.responses) {
                                if (r.type === "SIGNATURE") {
                                    restored[r.name] = r.signatureData;
                                } else {
                                    restored[r.name] = r.value;
                                }
                            }
                            setFormData(restored);
                        }
                    },
                },
            ],
        );
    }, [latestSubmission]);

    useEffect(() => {
        if (!isResubmitting) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            confirmDiscardResubmit();
            return true;
        });
        return () => sub.remove();
    }, [isResubmitting, confirmDiscardResubmit]);

    const showToast = useCallback(() => {
        setShowSubmitToast(true);
        RNAnimated.sequence([
            RNAnimated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            RNAnimated.delay(2000),
            RNAnimated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => {
            setShowSubmitToast(false);
            setIsResubmitting(false);
        });
    }, [toastOpacity]);

    const handleStartResubmit = useCallback(() => {
        setIsResubmitting(true);
    }, []);

    const handleViewHistory = useCallback(() => {
        if (!roadmapId || !itemId) return;
        const taskLabel = String((task as any)?.name ?? "");

        if (isViewingPastor) {
            router.push({
                pathname: "/(mentor)/roadmap/submission-history" as any,
                params: {
                    roadmapId,
                    taskId: itemId,
                    taskName: taskLabel || undefined,
                    menteeId: targetUserId,
                },
            });
        } else {
            router.push({
                pathname: "/(pastor)/roadmap/submission-history" as any,
                params: {
                    roadmapId,
                    taskId: itemId,
                    taskName: taskLabel || undefined,
                },
            });
        }
    }, [roadmapId, itemId, task, isViewingPastor, targetUserId, router]);

    /** Initialise formData from API or default dates */
    useEffect(() => {
        const init: Record<string, any> = {};
        
        Object.assign(init, seedDefaultFormValues(effectiveExtras));
        Object.assign(
            init,
            savedExtrasToFormValues(existingExtras?.extras, effectiveExtras),
        );
        
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
        const extraDef = findExtraByFieldKey(effectiveExtras, fieldName);
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

    const getLinkedAssessmentId = useCallback(
        (extra: Extra) => normalizeMongoId(extra.assessmentId),
        [],
    );

    const hasSubmittedAssessmentAnswers = useCallback(
        (linkedAssessmentId?: string) => {
            const normalizedId = normalizeMongoId(linkedAssessmentId);
            if (!normalizedId) return false;
            const item = assessmentProgress?.items?.find(
                (entry: { assessmentId?: string; status?: string }) =>
                    normalizeMongoId(entry.assessmentId) === normalizedId,
            );
            return (
                item?.status === "completed" || item?.status === "in_progress"
            );
        },
        [assessmentProgress?.items],
    );

    const getAssessmentAnswerQuestionsPath = useCallback(() => {
        const role = String(currentUser?.role ?? "").toLowerCase();
        return role === "mentor"
            ? "/(mentor)/assessments/answer-questions"
            : "/(pastor)/assessments/answer-questions";
    }, [currentUser?.role]);

    const getAssessmentSurveyGuidelinesPath = useCallback(() => {
        const role = String(currentUser?.role ?? "").toLowerCase();
        return role === "mentor"
            ? "/(mentor)/assessments/survey-guidelines"
            : "/(pastor)/assessments/survey-guidelines";
    }, [currentUser?.role]);

    const navigateToLinkedAssessment = useCallback(
        (extra: Extra) => {
            const linkedAssessmentId = getLinkedAssessmentId(extra);
            if (!linkedAssessmentId) return;

            const viewParams: Record<string, string> = {
                assessmentId: linkedAssessmentId,
                viewMode: "true",
                hasPreSurvey: "false",
            };

            if (isViewingPastor && targetUserId) {
                viewParams.targetUserId = String(targetUserId);
            }

            if (isPreviewMode || hasSubmittedAssessmentAnswers(linkedAssessmentId)) {
                router.push({
                    pathname: getAssessmentAnswerQuestionsPath() as any,
                    params: viewParams,
                });
                return;
            }

            router.push({
                pathname: getAssessmentSurveyGuidelinesPath() as any,
                params: { assessmentId: linkedAssessmentId },
            });
        },
        [
            getAssessmentAnswerQuestionsPath,
            getAssessmentSurveyGuidelinesPath,
            getLinkedAssessmentId,
            hasSubmittedAssessmentAnswers,
            isPreviewMode,
            isViewingPastor,
            router,
            targetUserId,
        ],
    );

    /** Save progress — always creates a NEW submission record (never PATCH). */
    const handleSubmit = async () => {
        if (isReadOnly) return;
        if (!validateForm()) return;
        if (!currentUser?.id) {
            Alert.alert("Error", "User not authenticated");
            return;
        }

        if (isPastorEditor) {
            const pastDateErrors = collectPastDateFieldErrors(effectiveExtras, formData);
            if (Object.keys(pastDateErrors).length > 0) {
                setDateFieldErrors(pastDateErrors);
                Alert.alert("Invalid date", PAST_DATE_VALIDATION_MESSAGE);
                return;
            }
            setDateFieldErrors({});
        }

        try {
            const isPastorJumpstartSubmit =
                isPastorEditor && isJumpStartPhase && roadmapId && targetUserId;

            const usePatchForExtras = isUpdateMode || roadmapLevelExtrasExist;

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

            const pendingFilesSnapshot = { ...pendingFiles };
            const extrasArray = withJumpstartCompleteExtra(responsesArray, {
                isPastorJumpstartSubmit: Boolean(isPastorJumpstartSubmit),
                existingExtras: existingExtras?.extras,
            });

            // Single atomic extras save (form fields + JUMPSTART_COMPLETE). Backend validates mentor
            // before any progress write; no separate JUMPSTART POST afterward.
            await saveTaskRoadmapExtras({
                isUpdateMode: usePatchForExtras,
                roadMapId: roadmapId!,
                userId: targetUserId!,
                nestedRoadMapItemId: itemId,
                extras: extrasArray,
                createExtras: (payload) => createExtras.mutateAsync(payload),
                updateExtras: (vars) => updateExtras.mutateAsync(vars),
            });

            setPendingFiles({});

            // Upload files to legacy extras endpoint too
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

            try {
                const newSubmission = await createSubmission.mutateAsync({
                    roadMapId: roadmapId!,
                    nestedRoadMapItemId: itemId,
                    submittedBy: targetUserId!,
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

            if (roadmapId && itemId && targetUserId) {
                await recordTaskCompletionTimestamp(targetUserId, roadmapId, itemId, Date.now());
            }

            if (isResubmitting) {
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
    const UploadField = ({ extraName }: { extraName: string }) => {
        const { data: docs = [], isLoading } = useTaskCurrentDocuments(
            roadmapId!,
            itemId!,
            targetUserId!,
            extraName,
            {
                latestSubmission,
                extras: existingExtras ?? undefined,
                isDraftingNewVersion: isResubmitting,
            },
        );

        const isVideoFile = (name: string) =>
            /\.(mp4|mov|avi|mkv|webm|wmv|flv)$/i.test(name);

        const pickFile = async () => {
            if (isReadOnly) return;
            const picked = await pickUploadFiles({ multiple: true, includeVideos: true });
            if (!picked.length) return;

            const newFiles = picked.map((file) => ({
                id: file.id,
                uri: file.uri,
                name: file.name,
                type: file.type || "application/octet-stream",
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
        const uploadButtonLabel = hasServerFiles || hasPendingFiles
            ? "Add file"
            : "Upload";

        return (
            <View style={{ marginBottom: 20 }}>
                {!isReadOnly ? (
                    <Pressable
                        style={[styles.uploadButton, styles.uploadButtonWhite, styles.uploadActionButton]}
                        onPress={pickFile}
                    >
                        <Ionicons name="cloud-upload-outline" size={18} color="rgba(255,255,255,0.9)" />
                        <Text style={[styles.uploadButtonText, styles.uploadActionButtonText]}>{uploadButtonLabel}</Text>
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
                            <Text style={styles.uploadedFilesLabel}>
                                {isResubmitting ? "New upload (not saved yet)" : "Uploaded :"}
                            </Text>
                            {docs.map((doc: any) => {
                                const fileType = String(doc.fileType ?? doc.type ?? "").toLowerCase();
                                const docFileName = String(doc.fileName ?? doc.name ?? "").toLowerCase();
                                const isImage =
                                    fileType.startsWith("image/") ||
                                    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(docFileName);
                                const isVideo =
                                    fileType.startsWith("video/") ||
                                    isVideoFile(docFileName);

                                return (
                                    <View key={doc._id}>
                                        {isImage && doc.fileUrl ? (
                                            <Pressable
                                                onPress={() => Linking.openURL(doc.fileUrl)}
                                                style={styles.imagePreviewWrap}
                                            >
                                                <Image
                                                    source={{ uri: doc.fileUrl }}
                                                    style={styles.imagePreview}
                                                    resizeMode="cover"
                                                />
                                                {!isReadOnly ? (
                                                    <Pressable
                                                        onPress={() => confirmDelete(doc)}
                                                        hitSlop={8}
                                                        style={styles.imageDeleteBtn}
                                                    >
                                                        <Ionicons name="trash-outline" size={16} color="#fff" />
                                                    </Pressable>
                                                ) : null}
                                            </Pressable>
                                        ) : (
                                            <View style={styles.fileRow}>
                                                <Pressable
                                                    onPress={() => Linking.openURL(doc.fileUrl)}
                                                    style={[styles.filePress, { flex: 1 }]}
                                                >
                                                    <View style={styles.fileIcon}>
                                                        <Ionicons
                                                            name={isVideo ? "videocam-outline" : "document-attach-outline"}
                                                            size={18}
                                                            color="#FFFFFF"
                                                        />
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
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )
                )}

            </View>
        );
    };

    /** ───────────────────── RENDER FIELDS ───────────────────── */

    const renderExtra = (
        extra: Extra,
        index: number,
        fieldPath: string[] = [],
    ): JSX.Element | null => {
        const fieldKey = buildExtraFieldKey(fieldPath, extra.name);
        const id = `${fieldKey}-${index}`;

        switch (extra.type) {
            case "UPLOAD":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {renderFieldLabel(extra.name)}
                        <UploadField extraName={fieldKey} />
                    </View>
                );

            case "TEXT_FIELD":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {renderFieldLabel(extra.name)}
                        {isReadOnly ? (
                            <View style={styles.readOnlyValue}>
                                <Text style={styles.readOnlyValueText}>
                                    {formatReadOnlyText(formData[fieldKey])}
                                </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={styles.textInput}
                                value={formData[fieldKey] || ""}
                                editable
                                onChangeText={(v) => handleChange(fieldKey, v)}
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
                                    {formatReadOnlyText(formData[fieldKey])}
                                </Text>
                            </View>
                        ) : (
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                multiline
                                scrollEnabled={false}
                                numberOfLines={4}
                                value={formData[fieldKey] || ""}
                                editable
                                onChangeText={(v) => handleChange(fieldKey, v)}
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
                            onPress={() => handleChange(fieldKey, !formData[fieldKey])}
                            style={styles.checkboxRow}
                            hitSlop={isReadOnly ? 0 : 8}
                            disabled={isReadOnly}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    formData[fieldKey] && styles.checkboxChecked,
                                    isReadOnly && styles.checkboxReadOnly,
                                ]}
                            >
                                {formData[fieldKey] && <Text style={styles.checkmark}>✓</Text>}
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
                                    const cbId = buildExtraFieldKey(
                                        fieldPath,
                                        `${extra.name}-cb-${checkbox.name}`,
                                    );
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
                                            formData[fieldKey] !== undefined
                                                ? formData[fieldKey]
                                                : extra.date || "";
                                        const parsed = parseAnyDate(currentRaw);
                                        return parsed ? formatForUi(parsed) : "No date provided";
                                    })()}
                                </Text>
                            </View>
                        ) : (
                            <Pressable
                                onPress={() => setActiveDateField(fieldKey)}
                                style={styles.dateInputContainer}
                                hitSlop={8}
                            >
                                {(() => {
                                    const currentRaw =
                                        formData[fieldKey] !== undefined
                                            ? formData[fieldKey]
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

                        {!isReadOnly && activeDateField === fieldKey ? (
                            <DateTimePicker
                                value={
                                    isPastorEditor
                                        ? coerceDatePickerValue(
                                              parseAnyDate(formData[fieldKey] ?? extra.date),
                                          )
                                        : parseAnyDate(formData[fieldKey] ?? extra.date) ??
                                          new Date()
                                }
                                mode="date"
                                display="default"
                                minimumDate={
                                    isPastorEditor ? getStartOfTodayLocal() : undefined
                                }
                                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                    if (event.type === "dismissed") {
                                        setActiveDateField(null);
                                        return;
                                    }
                                    if (selectedDate) {
                                        if (
                                            isPastorEditor &&
                                            isBeforeTodayLocal(selectedDate)
                                        ) {
                                            setDateFieldErrors((prev) => ({
                                                ...prev,
                                                [fieldKey]: PAST_DATE_VALIDATION_MESSAGE,
                                            }));
                                            Alert.alert(
                                                "Invalid date",
                                                PAST_DATE_VALIDATION_MESSAGE,
                                            );
                                            setActiveDateField(null);
                                            return;
                                        }
                                        handleChange(fieldKey, formatForApi(selectedDate));
                                        setDateFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next[fieldKey];
                                            return next;
                                        });
                                    }
                                    setActiveDateField(null);
                                }}
                            />
                        ) : null}
                        {dateFieldErrors[fieldKey] ? (
                            <Text style={styles.fieldError}>
                                {dateFieldErrors[fieldKey]}
                            </Text>
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
                                    const cbId = buildSectionCheckboxKey(
                                        fieldPath,
                                        extra.name,
                                        checkbox.name,
                                    );
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
                                    renderExtra(section, sectionIndex, [
                                        ...fieldPath,
                                        extra.name,
                                    ])
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

            case "ASSESSMENT": {
                const linkedAssessmentId = getLinkedAssessmentId(extra);
                const hasSubmittedAnswers = hasSubmittedAssessmentAnswers(linkedAssessmentId);
                const scheduleMeetingAfter = extra.checkboxes?.some(
                    (cb) => cb.name === "Schedule Meeting after the Assessment",
                );

                if (hasSubmittedAnswers) {
                    return (
                        <View key={id} style={styles.fieldContainer}>
                            <TouchableOpacity
                                style={styles.centeredLinkButton}
                                onPress={() => navigateToLinkedAssessment(extra)}
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
                                if (!linkedAssessmentId) return;
                                if (isPreviewMode) {
                                    navigateToLinkedAssessment(extra);
                                    return;
                                }
                                router.push({
                                    pathname: getAssessmentSurveyGuidelinesPath() as any,
                                    params: { assessmentId: linkedAssessmentId },
                                });
                            }}
                        >
                            <View style={styles.linkRow}>
                                <View style={styles.linkIcon}>
                                    <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                                </View>
                                <View style={styles.linkTextWrap}>
                                    <Text style={styles.linkTitle} numberOfLines={2}>
                                        Take {getExtraName(extra.name)} Survey
                                    </Text>
                                    <Text style={styles.linkSubtitle} numberOfLines={1}>
                                        Read guidelines and start your assessment
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.85)" />
                            </View>
                        </Pressable>
                        {scheduleMeetingAfter && (
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
                const signatureValue = formData[fieldKey] || null;
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
                                        setSignatureEditor({ visible: true, fieldName: fieldKey });
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
                                            setSignatureEditor({ visible: true, fieldName: fieldKey }),
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

    const hasOnlyAssessments = isAssessmentOnlyTask(effectiveExtras);

    const isSaving =
        createExtras.isPending ||
        updateExtras.isPending ||
        createSubmission.isPending;

    const isTaskCompleted =
        normalizeNestedTaskStatus(task.status) === "completed";

    const showSaveProgress =
        !isPreviewMode &&
        !isReadOnly &&
        (!isTaskCompleted || isResubmitting) &&
        !hasOnlyAssessments;

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

                {}
                {hasSubmission && !isResubmitting && !isPreviewMode && (
                    <View style={styles.submissionActionsBanner}>
                        <View style={styles.submissionBannerHeader}>
                            <Ionicons name="checkmark-done-outline" size={18} color="#34d399" />
                            <Text style={styles.submissionBannerTitle}>
                                Submission #{currentSubmissionNumber} saved
                            </Text>
                        </View>
                        <Text style={styles.submissionBannerSubtitle}>
                            Your responses are locked. You can view your history or submit a new version.
                        </Text>
                        <View style={styles.submissionActions}>
                            <Pressable
                                style={[styles.submissionActionBtn, styles.submissionActionBtnPrimary]}
                                onPress={handleStartResubmit}
                            >
                                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                                <Text style={styles.submissionActionBtnTextPrimary}>Resubmit Task</Text>
                            </Pressable>
                        </View>
                        <Pressable style={styles.viewHistoryBtn} onPress={handleViewHistory}>
                            <Ionicons name="document-text-outline" size={16} color="rgba(255,255,255,0.75)" />
                            <Text style={styles.viewHistoryBtnText}>
                                View your previous submissions
                            </Text>
                            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
                        </Pressable>
                    </View>
                )}

                {}
                {hasSubmission && isViewingPastor && (
                    <View style={styles.submissionActionsBanner}>
                        <View style={styles.submissionBannerHeader}>
                            <Ionicons name="eye-outline" size={18} color="#7EC8FF" />
                            <Text style={styles.submissionBannerTitle}>
                                Viewing Submission #{currentSubmissionNumber}
                            </Text>
                        </View>
                        <Pressable style={styles.viewHistoryBtn} onPress={handleViewHistory}>
                            <Ionicons name="document-text-outline" size={16} color="rgba(255,255,255,0.75)" />
                            <Text style={styles.viewHistoryBtnText}>
                                View all submissions
                            </Text>
                            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
                        </Pressable>
                    </View>
                )}

                {}
                {isResubmitting && (
                    <View style={styles.resubmitBanner}>
                        <View style={styles.resubmitBadge}>
                            <Ionicons name="add-circle-outline" size={13} color="#3B82F6" />
                            <Text style={styles.resubmitBadgeText}>
                                New Submission #{currentSubmissionNumber + 1}
                            </Text>
                        </View>
                        <Text style={styles.resubmitBannerText}>
                            Edit your responses below and submit as a new version.
                        </Text>
                        <Pressable
                            onPress={confirmDiscardResubmit}
                            hitSlop={8}
                            style={styles.cancelEditBtn}
                        >
                            <Ionicons name="close-outline" size={14} color="rgba(255,255,255,0.75)" />
                            <Text style={styles.cancelEditText}>Cancel</Text>
                        </Pressable>
                    </View>
                )}

                {!(isViewingPastor && hasSubmission) &&
                    effectiveExtras.map((extra, index) => renderExtra(extra, index))
                }

                {}
                {showSaveProgress ? (
                    <Pressable
                        style={[
                            styles.saveButton,
                            isResubmitting && styles.saveButtonUpdate,
                            isSaving ? styles.saveButtonSaving : null,
                        ]}
                        onPress={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <ActivityIndicator color={isResubmitting ? "#fff" : "#2563eb"} size="small" />
                                <Text style={[
                                    styles.saveButtonText,
                                    isResubmitting && styles.saveButtonTextUpdate,
                                ]}>
                                    Submitting...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons
                                    name={isResubmitting ? "paper-plane-outline" : "save-outline"}
                                    size={20}
                                    color={isResubmitting ? "#fff" : "#2563eb"}
                                />
                                <Text style={[
                                    styles.saveButtonText,
                                    isResubmitting && styles.saveButtonTextUpdate,
                                ]}>
                                    {isResubmitting ? "Submit New Version" : "Save Progress"}
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

            {!isPreviewMode ? (
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

            {!isPreviewMode ? (
                <SimpleSuccessModal
                    visible={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title={isResubmitting ? "New Submission Saved!" : "Progress Saved!"}
                />
            ) : null}

            {showSubmitToast && (
                <RNAnimated.View
                    style={[styles.resubmitToast, { opacity: toastOpacity }]}
                    pointerEvents="none"
                >
                    <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                    <Text style={styles.resubmitToastText}>
                        New submission created successfully
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
    fieldError: { color: "#fecaca", fontSize: 13, marginTop: 6 },
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
        paddingVertical: 13,
        paddingHorizontal: 18,
        borderRadius: 14,
        gap: 10,
        backgroundColor: "rgba(255,255,255,0.98)",
        borderWidth: 1,
        borderColor: "rgba(191,219,254,0.65)",
        marginTop: 8,
        shadowColor: "#0B3A63",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 5,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonSaving: {
        opacity: 0.75,
    },
    saveButtonText: {
        color: "#2563eb",
        fontSize: 14,
        fontWeight: "800",
        letterSpacing: 0.15,
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
    uploadActionButton: {
        alignSelf: "center",
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.24)",
        backgroundColor: "rgba(255,255,255,0.08)",
        shadowOpacity: 0,
        elevation: 0,
    },
    uploadActionButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "rgba(255,255,255,0.94)",
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
    imagePreviewWrap: {
        position: 'relative',
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    imagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    imageDeleteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
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
    submissionActionsBanner: {
        backgroundColor: 'rgba(34, 197, 94, 0.06)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.14)',
        marginBottom: 14,
        gap: 10,
    },
    submissionBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    submissionBannerTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    submissionBannerSubtitle: {
        color: 'rgba(200, 225, 255, 0.6)',
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 17,
    },
    submissionActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    submissionActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    submissionActionBtnPrimary: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    submissionActionBtnText: {
        color: '#7EC8FF',
        fontSize: 13,
        fontWeight: '700',
    },
    viewHistoryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(30, 54, 111, 0.35)',
        borderWidth: 1,
        borderColor: 'rgba(126, 200, 255, 0.15)',
    },
    viewHistoryBtnText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    submissionActionBtnTextPrimary: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    resubmitBanner: {
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
        marginBottom: 14,
    },
    resubmitBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    resubmitBadgeText: {
        color: '#60A5FA',
        fontSize: 12,
        fontWeight: '800',
    },
    resubmitBannerText: {
        color: 'rgba(150, 200, 255, 0.85)',
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
