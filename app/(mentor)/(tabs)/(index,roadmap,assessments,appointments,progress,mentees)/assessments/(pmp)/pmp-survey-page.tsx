import { Button } from "@/components/atom/buttons";
import AssessmentDeletedSuccessModal from "@/components/build-components/AssessmentDeletedSuccessModal";
import AssessmentMenuBottomSheet from "@/components/build-components/AssessmentMenuBottomSheet";
import DeleteConfirmationModal from "@/components/build-components/DeleteConfirmationModal";
import { AssessmentCard, GuidelinesPoints } from "@/components/build-components";
import AssessmentFlowHeader from "@/components/mentor";
import { MentorSurveyContextHint } from "@/components/mentor/MentorSurveyContextHint";
import { useAssessment, useDeleteAssessment } from "@/hooks/assessments";
import { ApiAssessment, Assessment } from "@/lib/assessments/types";
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

const mapApiAssessmentToAssessment = (
  apiAssessment: ApiAssessment,
): Assessment => {
  const inferType = (name: string): "CMA" | "PMP" => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("cma") || nameLower.includes("church")) {
      return "CMA";
    }
    return "PMP";
  };

  return {
    id: apiAssessment._id,
    type: inferType(apiAssessment.name),
    title: apiAssessment.name,
    description: apiAssessment.description,
    status: "Not Started" as const,
    guidelines: apiAssessment.instructions,
    sections: apiAssessment.sections.map((section) => ({
      title: section.title,
      subtitle: section.description,
      questionGroups: section.layers.map((layer) => ({
        id: layer._id,
        questions: [
          {
            id: layer._id,
            text: layer.title,
            type: "radio" as const,
            options: layer.choices.map((c) => ({
              label: c.text,
              value: c._id,
            })),
            required: false,
          },
        ],
      })),
    })),
  };
};

export default function PmpSurvey() {
  const { user } = useAuthStore();
  const isMentor = user?.role === "mentor";

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<Assessment | null>(null);
  const deleteAssessmentMutation = useDeleteAssessment();

  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;
  const menteeId = params.menteeId as string | undefined;
  const assessmentStatus = params.assessmentStatus as string | undefined;

  const canViewResponses =
    isMentor &&
    !!menteeId &&
    (assessmentStatus === "Submitted" || assessmentStatus === "Completed");

  const { data: assessment, isLoading: loading, error: queryError } =
    useAssessment(assessmentId);
  const error = queryError
    ? "Failed to load assessment. Please try again."
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
    router.back();
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </AppGradientBackground>
    );
  }

  const assessmentData = mapApiAssessmentToAssessment(assessment);

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
            <AssessmentCard
              data={assessmentData}
              onMenuPress={() => bottomSheetRef.current?.present()}
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
                    pathname: "/assessments/survey-form",
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
                    params: {
                      assessmentId: assessment._id,
                      viewMode: "true",
                      targetUserId: menteeId,
                    },
                  });
                }}
              />
            )}
          </ScrollView>
        </SafeAreaView>

        <AssessmentMenuBottomSheet
          ref={bottomSheetRef}
          assessment={assessmentData}
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
