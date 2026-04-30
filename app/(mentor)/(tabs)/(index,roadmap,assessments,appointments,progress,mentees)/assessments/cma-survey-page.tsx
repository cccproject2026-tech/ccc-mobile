import { Button } from "@/components/atom/buttons";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import AssessmentDeletedSuccessModal from "@/components/build-components/AssessmentDeletedSuccessModal";
import AssessmentMenuBottomSheet from "@/components/build-components/AssessmentMenuBottomSheet";
import DeleteConfirmationModal from "@/components/build-components/DeleteConfirmationModal";
import {
  AssessmentMainCard,
  GuidelinesPoints,
  Header
} from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { useDeleteAssessment, useAssessment } from "@/hooks/assessments";
import { Assessment } from "@/lib/assessments/types";
import { useAuthStore } from "@/stores";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AssessmentData {
  type: string;
  title?: string;
  status?: string;
  completionDate?: string;
  taskStatus?: {
    notStarted: boolean;
    started: boolean;
    inProgress: number;
    toComplete: number;
    completed: boolean;
  };
}

export default function CmaSurvey() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;
  const menteeId = params.menteeId as string | undefined;
  const assessmentStatus = params.assessmentStatus as string | undefined;

  const { user } = useAuthStore();
  const isMentor = user?.role === 'mentor';
  const canViewResponses =
    isMentor &&
    !!menteeId &&
    (assessmentStatus === "Submitted" || assessmentStatus === "Completed");

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<Assessment | null>(null);
  const deleteAssessmentMutation = useDeleteAssessment();

  // Use TanStack Query hook
  const { data: assessment, isLoading: loading, error: queryError } = useAssessment(assessmentId);
  const error = queryError ? 'Failed to load assessment. Please try again.' : null;

  // Infer type from name or default to 'CMA'
  const inferType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('cma') || nameLower.includes('church')) {
      return 'CMA';
    }
    return 'PMP';
  };

  if (loading) {
    return (
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', marginTop: 12 }}>
              Loading assessment...
            </Text>
          </View>
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  if (error || !assessment) {
    return (
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: '#FF6B6B', fontSize: 16, textAlign: 'center' }}>
              {error || 'Assessment not found'}
            </Text>
          </View>
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  const assessmentType = inferType(assessment.name);

  const assessmentForSheet: Assessment | null = assessment
    ? {
      id: assessment._id,
      type: assessmentType as 'CMA' | 'PMP',
      title: assessment.name,
      description: assessment.description ?? '',
      status: 'Not Started',
      guidelines: assessment.instructions ?? [],
      sections: [],
    }
    : null;

  const handleAssignTo = (a: Assessment) => {
    bottomSheetRef.current?.dismiss();
    router.push({ pathname: "/(mentor)/assessments-v2/assign-to" as any, params: { assessmentId: a.id } });
  };
  const handleEditSurvey = (a: Assessment) => {
    bottomSheetRef.current?.dismiss();
    router.push({ pathname: "/(mentor)/assessments-v2/edit-instructions" as any, params: { assessmentId: a.id } });
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
      onSuccess: () => { setShowDeleteSuccessModal(true); setAssessmentToDelete(null); },
      onError: () => { setAssessmentToDelete(null); },
    });
  };
  const handleCancelDelete = () => { setShowDeleteConfirmationModal(false); setAssessmentToDelete(null); };
  const handleDeleteSuccessModalClose = () => { setShowDeleteSuccessModal(false); router.back(); };

  return (
    <>
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader showNameTag={true} />

            {/* Header Section */}
            <Header
              title={assessment.name}
              subTitle="Assessment"
              hideSearchBar={true}
              onMenuPress={() => {
                if (isMentor) {
                  bottomSheetRef.current?.present();
                } else {
                  setIsRoadmapModalVisible(true);
                }
              }}
            />

            {/* Tabs Section */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 8,
                marginTop: 15,
                paddingBottom: 5,
              }}
              style={{ maxHeight: 50 }}
            >

            </ScrollView>

            {/* Content Section */}
            <AssessmentMainCard
              type={assessmentType}
              dueDate={undefined}
              dueDateClass="text-yellow-500"
            />

            {/* Guidelines points Section */}
            <GuidelinesPoints guidelines={assessment.instructions} />

            {!isMentor && (
              <Button
                type="start"
                title="Start Now"
                textStyle={{
                  color: "#001FC1",
                  fontSize: 16,
                  fontWeight: 600,
                }}
                style={{
                  backgroundColor: "white",
                  maxWidth: "50%",
                  width: "100%",
                  marginHorizontal: "auto",
                  marginTop: 42
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
                  color: "#001FC1",
                  fontSize: 16,
                  fontWeight: 600,
                }}
                style={{
                  backgroundColor: "white",
                  maxWidth: "50%",
                  width: "100%",
                  marginHorizontal: "auto",
                  marginTop: 12
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

        {/* Modal */}
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
        />

        <AssessmentMenuBottomSheet
          ref={bottomSheetRef}
          assessment={assessmentForSheet}
          onClose={() => { }}
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
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
});
