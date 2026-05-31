import { Button } from "@/components/atom/buttons";
import AssessmentDeletedSuccessModal from "@/components/build-components/AssessmentDeletedSuccessModal";
import AssessmentMenuBottomSheet from "@/components/build-components/AssessmentMenuBottomSheet";
import DeleteConfirmationModal from "@/components/build-components/DeleteConfirmationModal";
import { AssessmentMainCard, GuidelinesPoints } from "@/components/build-components";
import AssessmentFlowHeader from "@/components/mentor";
import { MentorSurveyContextHint } from "@/components/mentor/MentorSurveyContextHint";
import { useDeleteAssessment, useAssessment } from "@/hooks/assessments";
import { useNavigationBack } from "@/hooks/navigation/useNavigationBack";
import { Assessment } from "@/lib/assessments/types";
import { useAuthStore } from "@/stores";
import { getFontSize } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CmaSurvey() {
  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;
  const menteeId = params.menteeId as string | undefined;
  const assessmentStatus = params.assessmentStatus as string | undefined;
  const { handleBack, appendReturnToParams } = useNavigationBack(
    "/(mentor)/assessments-v2" as const,
  );

  const { user } = useAuthStore();
  const isMentor = user?.role === "mentor";
  const canViewResponses =
    isMentor &&
    !!menteeId &&
    (assessmentStatus === "Submitted" || assessmentStatus === "Completed");

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<Assessment | null>(null);
  const deleteAssessmentMutation = useDeleteAssessment();

  const { data: assessment, isLoading: loading, error: queryError } =
    useAssessment(assessmentId);
  const error = queryError
    ? "Failed to load assessment. Please try again."
    : null;

  const inferType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("cma") || nameLower.includes("church")) {
      return "CMA";
    }
    return "PMP";
  };

  const assessmentForSheet: Assessment | null = assessment
    ? {
        id: assessment._id,
        type: inferType(assessment.name) as "CMA" | "PMP",
        title: assessment.name,
        description: assessment.description ?? "",
        status: "Not Started",
        guidelines: assessment.instructions ?? [],
        sections: [],
      }
    : null;

  const handleAssignTo = (a: Assessment) => {
    bottomSheetRef.current?.dismiss();
    router.push({
      pathname: "/(mentor)/assessments-v2/assign-to" as any,
      params: { assessmentId: a.id },
    });
  };
  const handleEditSurvey = (a: Assessment) => {
    bottomSheetRef.current?.dismiss();
    router.push({
      pathname: "/(mentor)/assessments-v2/edit-instructions" as any,
      params: { assessmentId: a.id },
    });
  };
  const handleDeleteSurvey = (a: Assessment) => {
    setAssessmentToDelete(a);
    setShowDeleteConfirmationModal(true);
  };
  const handleConfirmDelete = () => {
    if (!assessmentToDelete) return;
    setShowDeleteConfirmationModal(false);
    bottomSheetRef.current?.dismiss();
    deleteAssessmentMutation.mutate(assessmentToDelete.id, {
      onSuccess: () => {
        setShowDeleteSuccessModal(true);
        setAssessmentToDelete(null);
      },
      onError: () => {
        setAssessmentToDelete(null);
      },
    });
  };
  const handleCancelDelete = () => {
    setShowDeleteConfirmationModal(false);
    setAssessmentToDelete(null);
  };
  const handleDeleteSuccessModalClose = () => {
    setShowDeleteSuccessModal(false);
    handleBack();
  };

  if (loading) {
    return (
      <AppGradientBackground style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading assessment...</Text>
      </AppGradientBackground>
    );
  }

  if (error || !assessment) {
    return (
      <AppGradientBackground style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={64} color="#fff" />
        <Text style={styles.errorTitle}>
          {error || "Assessment not found"}
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </AppGradientBackground>
    );
  }

  const assessmentType = inferType(assessment.name);

  return (
    <>
      <AppGradientBackground style={styles.flex}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <AssessmentFlowHeader
            title={assessment.name}
            showMenu={isMentor}
            onMenuPress={() => bottomSheetRef.current?.present()}
          />

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
              paddingHorizontal: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            <AssessmentMainCard
              type={assessmentType}
              dueDate={undefined}
              dueDateClass="text-yellow-500"
            />

            <GuidelinesPoints guidelines={assessment.instructions} />

            <MentorSurveyContextHint
              isMentor={isMentor}
              menteeId={menteeId}
              assessmentStatus={assessmentStatus}
            />

            {!isMentor && (
              <Button
                type="start"
                title="Start Now"
                textStyle={{
                  color: roadmapTheme.textActive,
                  fontSize: 16,
                  fontWeight: "600",
                }}
                style={{
                  backgroundColor: "#fff",
                  maxWidth: "50%",
                  width: "100%",
                  marginHorizontal: "auto",
                  marginTop: 24,
                  borderRadius: 16,
                  minHeight: 48,
                }}
                onPress={() => {
                  router.push({
                    pathname: "/(mentor)/assessments/answer-question-page" as any,
                    params: { assessmentId: assessment._id },
                  });
                }}
              />
            )}

            {canViewResponses && (
              <Button
                type="start"
                title="View Survey"
                textStyle={{
                  color: roadmapTheme.textActive,
                  fontSize: 16,
                  fontWeight: "600",
                }}
                style={{
                  backgroundColor: "#fff",
                  maxWidth: "50%",
                  width: "100%",
                  marginHorizontal: "auto",
                  marginTop: 12,
                  borderRadius: 16,
                  minHeight: 48,
                }}
                onPress={() => {
                  router.push({
                    pathname: "/(mentor)/assessments/answer-questions" as any,
                    params: appendReturnToParams({
                      assessmentId: assessment._id,
                      viewMode: "true",
                      targetUserId: menteeId,
                    }),
                  });
                }}
              />
            )}
          </ScrollView>
        </SafeAreaView>

        <AssessmentMenuBottomSheet
          ref={bottomSheetRef}
          assessment={assessmentForSheet}
          onClose={() => {}}
          onAssignTo={handleAssignTo}
          onEditSurvey={handleEditSurvey}
          onDeleteSurvey={handleDeleteSurvey}
        />
        <DeleteConfirmationModal
          visible={showDeleteConfirmationModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
        <AssessmentDeletedSuccessModal
          visible={showDeleteSuccessModal}
          onClose={handleDeleteSuccessModalClose}
        />
      </AppGradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    color: "#fff",
    fontSize: getFontSize(16),
    marginTop: 16,
  },
  errorTitle: {
    color: "#fff",
    fontSize: getFontSize(16),
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    color: "#fff",
    textDecorationLine: "underline",
    fontSize: getFontSize(15),
  },
});
