import AssessmentQuestionsSection from "@/components/AnswerQuestionSection";
import PreSurveySection from "@/components/PreSurveySection";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import ScheduleMeetingBottomSheet from "@/components/director/ScheduleMeetingBottomSheet";
import TopBar from "@/components/director/TopBar";
import { useAssessment } from "@/hooks/assessments";
import { useFetchAnswers } from "@/hooks/assessments/useFetchAnswers";
import { useSendRecommendation } from "@/hooks/assessments/useSendRecommendation";
import {
  useSubmitAssessmentAnswers,
  useSubmitPreSurvey,
} from "@/hooks/assessments/useSubmitAnswers";
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
  const {
    assessmentId,
    viewMode,
    hasPreSurvey,
    scheduleMeeting,
    targetUserId,
  } = useLocalSearchParams();
  console.log(
    "assessmentId",
    assessmentId,
    viewMode,
    hasPreSurvey,
    scheduleMeeting,
    targetUserId,
  );
  const router = useRouter();
  const { user } = useAuthStore();

  // Determine the user ID to fetch answers for: passed targetUserId (mentee) or current user (if fallback)
  // For mentor view, targetUserId should be provided.
  const userIdToFetch = (targetUserId as string) || user?.id;

  // Fetch assessment data from API
  const { data, isLoading, error } = useAssessment(assessmentId as string);
  const assessment = useMemo(() => {
    if (!data) return null;
    return mapApiToFrontend(data as ApiAssessment);
  }, [data, isLoading]);

  const isViewMode = viewMode === "true";
  const shouldScheduleMeeting = scheduleMeeting === "true";
  console.log("isViewMode", isViewMode, shouldScheduleMeeting);

  // ONLY fetch submitted answers in VIEW MODE (not for regular editing)
  const { data: submittedAnswers, isLoading: isLoadingSubmitted } =
    useFetchAnswers(assessmentId as string, userIdToFetch, isViewMode);

  // Get draft from store
  const getDraft = useAssessmentStore((state) => state.getDraft);
  const setDraft = useAssessmentStore((state) => state.saveDraft);
  const previousResponse = getDraft(assessmentId as string);

  // Submission hooks - not used in view mode mostly
  const submitPreSurvey = useSubmitPreSurvey();
  const submitAssessmentAnswers = useSubmitAssessmentAnswers();
  const { mutateAsync: sendRecommendation } = useSendRecommendation();

  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewSectionAnswers, setViewSectionAnswers] = useState<
    Record<number, Record<string, any>> | undefined
  >(undefined);

  // Load submitted answers (ONLY for view mode)
  useEffect(() => {
    if (isViewMode && submittedAnswers && assessment && data && userIdToFetch) {
      const transformed = transformSubmittedAnswersToStore(
        submittedAnswers.data,
        assessment,
        data,
      );

      // Keep a local copy for view mode so mentor can see pastor's choices
      setViewSectionAnswers(transformed.sectionAnswers);

      // Optionally persist into draft store (so other flows can reuse)
      setDraft(assessmentId as string, {
        assessmentId: assessmentId as string,
        assessmentType: assessment.type,
        assessmentTitle: assessment.title,
        preSurveyAnswers: transformed.preSurveyAnswers,
        sectionAnswers: transformed.sectionAnswers,
        status: "Submitted",
        currentSectionIndex: 0,
      });
    }
  }, [
    isViewMode,
    submittedAnswers,
    assessment,
    data,
    assessmentId,
    userIdToFetch,
    setDraft,
    isLoadingSubmitted,
  ]);

  // Track if pre-survey is completed
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

  const handleSendCdp = async (payload: {
    recommendations: Array<{
      sectionId: string;
      selectedItems: Array<{ level: number; text: string }>;
    }>;
  }) => {
    if (!targetUserId || !assessmentId) return;
    const id = assessmentId as string;
    const userId = targetUserId as string;
    try {
      await Promise.all(
        payload.recommendations.map((section) =>
          sendRecommendation({
            assessmentId: id,
            payload: {
              userId,
              sectionId: section.sectionId,
              recommendations: section.selectedItems.map((item) => item.text),
            },
          }),
        ),
      );
      setSuccessMessage("Customized Development Plans sent successfully.");
      setShowSuccessModal(true);
      setTimeout(() => router.back(), 2000);
    } catch (error) {
      console.error("Failed to send CDP recommendations:", error);
      Alert.alert(
        "Error",
        "Failed to send recommendations. Please try again.",
      );
    }
  };

  const handleAssessmentSubmit = async (
    sectionAnswers: Record<number, Record<string, any>>,
  ) => {
    if (isViewMode || targetUserId) return;
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
    setShowSuccessModal(true);

    setTimeout(() => {
      router.back();
    }, 2000);
  };

  // Build mentor review sections from answers API (score + recommendations per section)
  const mentorReviewSections = useMemo(() => {
    if (!assessment || !data?.sections || !submittedAnswers?.data?.sections)
      return undefined;
    console.log("Answer Sections:", submittedAnswers?.data?.sections);
    return data.sections.map((apiSection, index) => {
      const submitted = submittedAnswers.data.sections.find(
        (s) => s.sectionId === apiSection._id,
      );
      return {
        sectionId: apiSection._id,
        title: assessment.sections[index]?.title ?? apiSection.title,
        score: submitted?.sectionScore,
        recommendations: submitted?.recommendations ?? [],
      };
    });
  }, [assessment, data?.sections, submittedAnswers?.data?.sections]);

  // Loading state
  if (isLoading || (isViewMode && isLoadingSubmitted)) {
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
          {isLoadingSubmitted
            ? "Loading submitted answers..."
            : "Loading assessment..."}
        </Text>
      </LinearGradient>
    );
  }

  // Error state
  if (error || !assessment) {
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
          Failed to load assessment
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
      {/* TopBar tailored for mentor view */}
      <TopBar role="mentor" showUserName={true} showNotifications={false} />

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
          isViewMode={isViewMode}
          initialSectionAnswers={isViewMode ? viewSectionAnswers : undefined}
          reviewMode={isViewMode && !!targetUserId}
          mentorReviewSections={mentorReviewSections}
          onSubmit={handleAssessmentSubmit}
          onClose={() => {
            router.back();
          }}
          onSendCdp={handleSendCdp}
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
      />

      <SimpleSuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          if (isViewMode || targetUserId) {
            router.back();
          } else {
            router.push({
              pathname: "/assessments/survey-guidelines",
              params: { assessmentId: assessment.id },
            });
            router.back();
          }
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
