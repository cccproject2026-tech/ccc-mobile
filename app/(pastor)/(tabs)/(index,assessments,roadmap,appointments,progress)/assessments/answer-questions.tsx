import AssessmentQuestionsSection from "@/components/AnswerQuestionSection";
import PreSurveySection from "@/components/PreSurveySection";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import ScheduleMeetingBottomSheet from "@/components/director/ScheduleMeetingBottomSheet";
import TopBar from "@/components/director/TopBar";
import { useAssessment } from "@/hooks/assessments";
import { useFetchAnswers } from "@/hooks/assessments/useFetchAnswers";
import {
  useSubmitAssessmentAnswers,
  useSubmitPreSurvey,
} from "@/hooks/assessments/useSubmitAnswers";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useTriggerJumpstart } from "@/hooks/roadmaps/useTriggerJumpstart";
import { transformSubmittedAnswersToStore } from "@/lib/assessments/helpers";
import { mapApiToFrontend } from "@/lib/assessments/mappers";
import { useAuthStore } from "@/stores";
import { useAssessmentStore } from "@/stores/assessment.store";
import { ApiAssessment } from "@/types/assessment.types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AnswerQuestionPage() {
  const { assessmentId, viewMode, hasPreSurvey, scheduleMeeting } =
    useLocalSearchParams();
  console.log(
    "assessmentId",
    assessmentId,
    viewMode,
    hasPreSurvey,
    scheduleMeeting,
  );
  const router = useRouter();
  // hasPreSurvey = false;
  const { user } = useAuthStore();
  // console.log('assessmentId',typeof hasPreSurvey, hasPreSurvey);
  // Fetch assessment data from API
  const { data, isLoading, error } = useAssessment(assessmentId as string);
  const assessment = useMemo(() => {
    if (!data) return null;
    return mapApiToFrontend(data as ApiAssessment);
  }, [data]);

  const isViewMode = viewMode === "true";
  const shouldScheduleMeeting = scheduleMeeting === "true";
  console.log("isViewMode", isViewMode, shouldScheduleMeeting);
  // ONLY fetch submitted answers in VIEW MODE (not for regular editing)
  const {
    data: submittedAnswers,
    isLoading: isLoadingSubmitted,
    isError: isSubmittedAnswersError,
    error: submittedAnswersError,
  } = useFetchAnswers(assessmentId as string, user?.id, isViewMode);
  // console.log('submittedAnswers', data);
  // Get draft from store
  const getDraft = useAssessmentStore((state) => state.getDraft);
  const setDraft = useAssessmentStore((state) => state.saveDraft);
  const previousResponse = getDraft(assessmentId as string);

  // Submission hooks
  const submitPreSurvey = useSubmitPreSurvey();
  const submitAssessmentAnswers = useSubmitAssessmentAnswers();
  const { mutateAsync: triggerJumpstartAsync } = useTriggerJumpstart();
  const { data: assignedRoadmaps = [] } = useRoadmaps("pastor", user?.id);
  const normalizeRoadmapName = (value: string) =>
    value.toLowerCase().replace(/[\s-]+/g, "");
  const jumpstartRoadmapId = useMemo(() => {
    if (!assignedRoadmaps.length) return undefined;
    const jumpstart = assignedRoadmaps.find((r: any) => {
      const normalizedName = normalizeRoadmapName(String(r?.name ?? ""));
      return normalizedName.includes("jumpstart");
    });
    return jumpstart?._id;
  }, [assignedRoadmaps]);
  const jumpstartTriggeredUsersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!jumpstartRoadmapId && assignedRoadmaps.length > 0) {
      console.warn(
        "[Jumpstart Trigger] Jumpstart roadmap not found. Skipping trigger.",
        assignedRoadmaps.map((r: any) => ({ id: r?._id, name: r?.name })),
      );
    }
  }, [jumpstartRoadmapId, assignedRoadmaps]);

  // DEBUG helper: always called from final submit before saving extras.
  const ensureJumpstartTriggered = async () => {
    console.log("ensureJumpstartTriggered CALLED");
    console.log("Check conditions", {
      isViewMode,
      userId: user?.id,
      jumpstartRoadmapId,
    });

    // Temporary force path for debugging:
    // if jumpstart roadmap is not detected, use first assigned roadmap id.
    const debugRoadmapId = jumpstartRoadmapId || assignedRoadmaps[0]?._id;
    const debugUserId = user?.id;

    console.log("STEP 1: Trigger Jumpstart");
    console.log("Trigger payload", {
      roadmapId: debugRoadmapId,
      userId: debugUserId,
      source: jumpstartRoadmapId ? "jumpstart-detected" : "fallback-first-assigned",
    });

    if (!debugRoadmapId) {
      console.error("❌ Missing roadmapId — cannot trigger Jumpstart");
    }

    if (!debugUserId) {
      console.error("❌ Missing userId — cannot trigger Jumpstart");
    }

    if (!debugRoadmapId || !debugUserId) {
      return;
    }

    try {
      const response = await triggerJumpstartAsync({
        roadmapId: debugRoadmapId,
        userId: debugUserId,
      });
      console.log("Jumpstart response", response);

      if (response.alreadyExists || response.success) {
        jumpstartTriggeredUsersRef.current.add(debugUserId);
      }
    } catch (triggerError) {
      console.warn(
        "[Jumpstart Trigger] Failed (non-blocking). Continuing assessment flow.",
        triggerError,
      );
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [message, setMessage] = useState("");
  const [viewSectionAnswers, setViewSectionAnswers] = useState<
    Record<number, Record<string, any>> | undefined
  >(undefined);
  // Load submitted answers into store (ONLY for view mode)
  useEffect(() => {
    if (isViewMode && submittedAnswers && assessment && data && user?.id) {
      const transformed = transformSubmittedAnswersToStore(
        submittedAnswers.data,
        assessment,
        data,
      );

      // For view mode, keep transformed answers in local state and avoid touching the draft
      setViewSectionAnswers(transformed.sectionAnswers);
    }
  }, [
    isViewMode,
    submittedAnswers,
    assessment,
    data,
    assessmentId,
    user?.id,
    setDraft,
    isLoadingSubmitted,
  ]);

  // Track if pre-survey is completed - SIMPLE logic like before
  const [preSurveyCompleted, setPreSurveyCompleted] = useState(
    hasPreSurvey !== "true" || !!previousResponse?.preSurveyAnswers,
  );

  const scheduleMeetingBottomSheetRef = useRef<BottomSheetModal>(null);

  const showPreSurvey =
    hasPreSurvey === "true" &&
    !preSurveyCompleted &&
    !isViewMode &&
    (assessment?.preSurvey?.length ?? 0) > 0;

  // Check if pre-survey has been submitted
  const hasPreSurveyAnswers = isViewMode
    ? !!submittedAnswers?.data?.preSurveyAnswers
    : !!previousResponse?.preSurveyAnswers &&
      Object.keys(previousResponse.preSurveyAnswers).length > 0;

  // const mockMentors: Mentor[] = [
  //     { id: '1', name: 'John Ross', role: 'Mentor', profileImage: 'https://randomuser.me/api/portraits/men/1.jpg' },
  //     { id: '2', name: 'Sarah Johnson', role: 'Field Mentor', profileImage: 'https://randomuser.me/api/portraits/women/2.jpg' },
  //     { id: '3', name: 'Michael Chen', role: 'Mentor', profileImage: 'https://randomuser.me/api/portraits/men/3.jpg' },
  //     { id: '4', name: 'Emily Davis', role: 'Mentor', profileImage: 'https://randomuser.me/api/portraits/women/4.jpg' },
  //     { id: '5', name: 'Robert Wilson', role: 'Field Mentor', profileImage: 'https://randomuser.me/api/portraits/men/5.jpg' },
  //     { id: '6', name: 'Lisa Anderson', role: 'Field Mentor', profileImage: 'https://randomuser.me/api/portraits/women/6.jpg' },
  // ];

  const handlePreSurveyComplete = async (
    preSurveyAnswers: Record<string, string>,
  ) => {
    if (!assessment || !assessment.preSurvey) {
      Alert.alert("Error", "Assessment data not found");
      return;
    }

    try {
      const payload = {
        userId: user?.id as string,
        preSurveyAnswers: assessment.preSurvey.map((question) => ({
          questionText: question.text,
          answer: preSurveyAnswers[question.id] || "",
        })),
      };

      await submitPreSurvey.mutateAsync({
        assessmentId: assessmentId as string,
        payload,
      });

      setPreSurveyCompleted(true);
      Alert.alert("Success", "Pre-survey submitted successfully!");
    } catch (error) {
      console.error("Failed to submit pre-survey:", error);
      Alert.alert("Error", "Failed to submit pre-survey. Please try again.");
    }
  };

  const handlePreSurveyCancel = () => {
    router.back();
  };

  const handleAssessmentSubmit = async (
    sectionAnswers: Record<number, Record<string, any>>,
  ) => {
    if (!assessment || !data) {
      Alert.alert("Error", "Assessment data not found");
      return;
    }

    try {
      const answers = Object.entries(sectionAnswers)
        .map(([sectionIndex, layerAnswers]) => {
          const section = data.sections[parseInt(sectionIndex)];

          const layers = Object.entries(layerAnswers)
            .filter(([_, choiceId]) => choiceId)
            .map(([layerId, choiceId]) => ({
              layerId,
              selectedChoice: String(choiceId),
            }));

          return {
            sectionId: section._id,
            layers,
          };
        })
        .filter((section) => section.layers.length > 0);

      const payload = {
        userId: user?.id as string,
        answers,
      };

      // Trigger jumpstart BEFORE any extras/answers save.
      await ensureJumpstartTriggered();

      console.log("STEP 2: Saving extras");
      await submitAssessmentAnswers.mutateAsync({
        assessmentId: assessmentId as string,
        payload,
      });

      if (shouldScheduleMeeting) {
        setShowModal(true);
      } else {
        setSuccessMessage("Assessment submitted successfully!");
        setShowSuccessModal(true);
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      Alert.alert("Error", "Failed to submit assessment. Please try again.");
    }
  };

  const handleScheduleMeeting = () => {
    setShowModal(false);
    setTimeout(() => {
      scheduleMeetingBottomSheetRef.current?.present();
    }, 300);
  };

  const handleSkipScheduling = () => {
    setShowModal(false);
    setTimeout(() => {
      router.back();
    }, 300);
  };

  // CDP sections for pastor view mode (score + recommendations from ANSWERS API only)
  const cdpSectionsForView = useMemo(() => {
    if (!assessment || !data?.sections || !submittedAnswers?.data?.sections) {
      return undefined;
    }

    // Drive CDP content purely from the ANSWERS API; use assessment only for titles.
    return submittedAnswers.data.sections.map((submittedSection) => {
      const apiSectionIndex = data.sections.findIndex(
        (s) => s._id === submittedSection.sectionId,
      );
      const apiSection = apiSectionIndex >= 0 ? data.sections[apiSectionIndex] : undefined;
      return {
        sectionId: submittedSection.sectionId,
        title:
          assessment.sections[apiSectionIndex]?.title ??
          apiSection?.title ??
          "Section",
        score: submittedSection.sectionScore,
        recommendations: submittedSection.recommendations ?? [],
      };
    });
  }, [assessment, data?.sections, submittedAnswers?.data?.sections]);

  const submittedSections = submittedAnswers?.data?.sections || [];

  const handleScheduleComplete = (data: any) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      return `${day} ${month} ${year}`;
    };

    setSuccessMessage(
      `Meeting scheduled with ${data.selectedMentor.name} on ${formatDate(data.selectedDate)} at ${data.selectedTime.label}`,
    );
    // Set the message for the guidelines page
    setShowSuccessModal(true);

    setTimeout(() => {
      router.replace({
        pathname: "/assessments/survey-guidelines",
        params: {
          assessmentId,
          message: `Meeting scheduled on ${formatDate(data.selectedDate)} at ${data.selectedTime.label}`,
        },
      });
    }, 2000);
  };

  // Loading state
  if (
    isLoading ||
    (isViewMode && isLoadingSubmitted) ||
    submitPreSurvey.isPending ||
    submitAssessmentAnswers.isPending
  ) {
    return (
      <LinearGradient
        colors={["#176192", "#1D548D", "#264387"]}
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 16 }}>
          {submitPreSurvey.isPending
            ? "Submitting pre-survey..."
            : submitAssessmentAnswers.isPending
              ? "Submitting assessment..."
              : isLoadingSubmitted
                ? "Loading submitted answers..."
                : "Loading assessment..."}
        </Text>
      </LinearGradient>
    );
  }

  // Error state
  if (error || !assessment || (isViewMode && isSubmittedAnswersError)) {
    const errorMessage =
      isViewMode && isSubmittedAnswersError
        ? submittedAnswersError instanceof Error
          ? submittedAnswersError.message
          : "Failed to load submitted answers"
        : "Failed to load assessment";

    return (
      <LinearGradient
        colors={["#176192", "#1D548D", "#264387"]}
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={64} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 18, marginTop: 16 }}>
          {errorMessage}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: "#fff", textDecorationLine: "underline" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#176192", "#1D548D", "#264387"]}
      style={styles.container}
    >
      {showPreSurvey ? (
        <TopBar showUserName={true} showNotifications={true} />
      ) : (
        <TopBar showDrawer={false} showNotifications={false} />
      )}

      {showPreSurvey ? (
        <PreSurveySection
          assessment={assessment}
          assessmentId={assessmentId as string}
          onComplete={handlePreSurveyComplete}
          onCancel={handlePreSurveyCancel}
          hasExistingAnswers={hasPreSurveyAnswers}
        />
      ) : (
        <AssessmentQuestionsSection
          assessment={assessment}
          assessmentId={assessmentId as string}
          userRole={user?.role}
          isViewMode={isViewMode}
          initialSectionAnswers={isViewMode ? viewSectionAnswers : undefined}
          mentorReviewSections={cdpSectionsForView}
          submittedSections={submittedSections}
          onSubmit={handleAssessmentSubmit}
          onClose={() => {
            router.back();
          }}
        />
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              On completion of the PMP and CMA assessment tools please schedule
              a meeting with your mentor.
            </Text>
            <View style={styles.modalButtons}>
              {/* <TouchableOpacity style={[styles.modalButton, styles.skipButton]} onPress={handleSkipScheduling}>
                                <Text style={styles.modalButtonText}>Skip for Now</Text>
                            </TouchableOpacity> */}
              <TouchableOpacity
                style={[styles.modalButton, styles.scheduleButton]}
                onPress={handleScheduleMeeting}
              >
                <Text style={styles.modalButtonText}>Schedule Meeting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScheduleMeetingBottomSheet
        ref={scheduleMeetingBottomSheetRef}
        onClose={() => scheduleMeetingBottomSheetRef.current?.dismiss()}
        onSchedule={handleScheduleComplete}
        colorScheme={{
          background: "#1E3A6F",
          text: "#FFFFFF",
          accent: "#FFC107",
          cardBackground: "rgba(255, 255, 255, 0.1)",
        }}
        mode={undefined}
        disableOutsideClose={true}
      />

      <SimpleSuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        title={successMessage}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    elevation: 2,
    margin: 20,
    maxWidth: 400,
  },
  modalText: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 24,
    color: "#176192",
    lineHeight: 24,
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  skipButton: { backgroundColor: "#6B7280" },
  scheduleButton: { backgroundColor: "#223A74" },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
