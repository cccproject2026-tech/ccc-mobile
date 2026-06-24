import { ProgressAssessmentCard } from "@/components/director/ProgressAssessmentCard";
import { ChartData, ProgressBarChart } from "@/components/director/ProgressBarChart";
import { ProgressPieChart } from "@/components/director/ProgressPieChart";
import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import CommentBottomSheet, { CommentModalRef } from "@/components/director/CommentBottomSheet";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useMentorProgramCompletion } from "@/hooks/mentor/useMentorProgramCompletion";
import {
  useAddFinalComment,
  useDeleteFinalComment,
  useProgress,
  useUpdateFinalComment,
} from "@/hooks/progress/useProgress";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { canMentorMarkProgramComplete, mentorHasFinalComments } from "@/lib/progress/deriveOverallProgressPercent";
import { comparePastorPhasesForHome, getSingleNestedTaskId } from "@/lib/roadmap/helpers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { useAuthStore } from "@/stores";
import { RoadmapTabStrip } from "@/components/ui/design-system";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "All" | "Completed" | "Remaining";

function toEpochMs(dateString?: string): number {
  if (!dateString) return 0;
  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function getAssessmentActivityEpochMs(a: any): number {
  return (
    toEpochMs(a?.completionDate) ||
    toEpochMs(a?.completedOn) ||
    toEpochMs(a?.submittedDate) ||
    toEpochMs(a?.dueDate) ||
    toEpochMs(a?.meetingDate) ||
    toEpochMs(a?.updatedAt) ||
    0
  );
}

export default function MenteeProgressScreen() {
  const { menteeId, openComments } = useLocalSearchParams<{ menteeId?: string; openComments?: string }>();
  const { user } = useAuthStore();
  const { bottom } = useSafeAreaInsets();
  const commentsSheetRef = useRef<CommentModalRef>(null);

  const [roadmapTabs, setRoadmapTabs] = useState<TabKey>("All");
  const [assessmentTabs, setAssessmentTabs] = useState<TabKey>("All");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const addFinalCommentMutation = useAddFinalComment();
  const updateFinalCommentMutation = useUpdateFinalComment();
  const deleteFinalCommentMutation = useDeleteFinalComment();
  const { requestMarkComplete, markCompleteMutation } = useMentorProgramCompletion();

  const {
    data: menteesData,
    isLoading: isMenteesLoading,
  } = useMentees(100, user?.id, { includeProgress: false, includeProfile: false });
  const {
    data: progressData,
    isLoading: isProgressLoading,
    error: progressError,
    refetch: refetchProgress,
    isRefetching: isProgressRefetching,
  } = useProgress(menteeId);
  const {
    data: roadmaps,
    isLoading: isRoadmapsLoading,
    refetch: refetchRoadmaps,
    isRefetching: isRoadmapsRefetching,
  } = useRoadmaps("pastor", menteeId);
  const {
    data: assessments,
    isLoading: isAssessmentsLoading,
    refetch: refetchAssessments,
    isRefetching: isAssessmentsRefetching,
  } = useAssignedAssessments(menteeId);

  const mentee = useMemo(() => {
    const allMentees = menteesData?.pages.flatMap((page) => page.mentees) ?? [];
    return allMentees.find((item) => item.id === menteeId);
  }, [menteeId, menteesData]);

  const isProgrammeCompleted = Boolean(
    mentee?.hasCompleted ||
      (markCompleteMutation.isSuccess && markCompleteMutation.variables === menteeId),
  );

  const menteeName = useMemo(() => {
    if (!mentee) return "Mentee Progress";
    return `${mentee.firstName ?? ""}${mentee.lastName ? ` ${mentee.lastName}` : ""}`.trim() || "Mentee Progress";
  }, [mentee]);

  const overallProgress = useMemo(() => {
    const completedPercentage = round1(progressData?.overallProgress ?? 0);
    const remainingPercentage = round1(Math.max(0, 100 - completedPercentage));
    return { completedPercentage, remainingPercentage };
  }, [progressData]);

  const finalComments = progressData?.finalComments ?? [];
  const hasFinalComment = mentorHasFinalComments(finalComments.length, finalComments);
  const isProgramProgressComplete = overallProgress.completedPercentage >= 100;
  const canMarkComplete = canMentorMarkProgramComplete({
    overallProgress: overallProgress.completedPercentage,
    hasFinalComment,
    hasCompleted: isProgrammeCompleted,
  });

  const formattedComments = useMemo(
    () =>
      finalComments.map((comment) => ({
        id: comment._id,
        text: comment.comment,
        author: comment.commentorName || "Mentor",
        role: "Mentor",
        timestamp: new Date(comment.createdAt),
      })),
    [finalComments],
  );

  const openCommentsSheet = useCallback(() => {
    setTimeout(() => commentsSheetRef.current?.present(), 0);
  }, []);

  useEffect(() => {
    if (openComments === "1" && mentee && progressData) {
      openCommentsSheet();
    }
  }, [openComments, mentee, progressData, openCommentsSheet]);

  const availableTabs = [
    { key: "All", label: "All" },
    { key: "Remaining", label: "Remaining" },
    { key: "Completed", label: "Completed" },
  ];

  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return [];

    const sorted = [...roadmaps].sort(comparePastorPhasesForHome);

    switch (roadmapTabs) {
      case "Completed":
        return sorted.filter((item) => item.status === "completed");
      case "Remaining":
        return sorted.filter((item) => item.status !== "completed");
      default:
        return sorted;
    }
  }, [roadmapTabs, roadmaps]);

  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];

    const sorted = [...assessments].sort((a, b) => getAssessmentActivityEpochMs(b) - getAssessmentActivityEpochMs(a));

    switch (assessmentTabs) {
      case "Completed":
        return sorted.filter((item) => item.status === "Completed").slice(0, 5);
      case "Remaining":
        return sorted.filter((item) => item.status !== "Completed").slice(0, 5);
      default:
        return sorted.slice(0, 5);
    }
  }, [assessmentTabs, assessments]);

  const chartData: ChartData = useMemo(() => {
    const latestRoadmaps = [...(roadmaps || [])]
      .sort((a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt))
      .slice(0, 5);
    const latestAssessments = [...(assessments || [])]
      .sort((a, b) => getAssessmentActivityEpochMs(b) - getAssessmentActivityEpochMs(a))
      .slice(0, 5);

    const roadmapsCompleted = latestRoadmaps.filter((item) => item.status === "completed").length;
    const assessmentsCompleted = latestAssessments.filter((item) => item.status === "Completed").length;

    return {
      roadmapsTotal: latestRoadmaps.length,
      roadmapsCompleted,
      roadmapsRemaining: Math.max(0, latestRoadmaps.length - roadmapsCompleted),
      assessmentsTotal: latestAssessments.length,
      assessmentsCompleted,
      assessmentsRemaining: Math.max(0, latestAssessments.length - assessmentsCompleted),
    };
  }, [assessments, roadmaps]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchProgress(),
      refetchRoadmaps(),
      refetchAssessments(),
    ]);
  }, [refetchAssessments, refetchProgress, refetchRoadmaps]);

  const handleSubmitComment = useCallback(
    (text: string) => {
      if (!user?.id || !menteeId || !text.trim()) return;

      if (editingCommentId) {
        updateFinalCommentMutation.mutate(
          {
            userId: menteeId,
            commentId: editingCommentId,
            comment: text.trim(),
          },
          {
            onSuccess: () => {
              setEditingCommentId(null);
              commentsSheetRef.current?.dismiss();
            },
            onError: () => {
              Alert.alert("Error", "Failed to update final comment.");
            },
          },
        );
        return;
      }

      addFinalCommentMutation.mutate(
        {
          userId: menteeId,
          commentorId: user.id,
          comment: text.trim(),
        },
        {
          onSuccess: () => {
            commentsSheetRef.current?.dismiss();
          },
          onError: () => {
            Alert.alert("Error", "Failed to submit final comment.");
          },
        },
      );
    },
    [
      addFinalCommentMutation,
      editingCommentId,
      menteeId,
      updateFinalCommentMutation,
      user?.id,
    ],
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      if (!menteeId) return;

      Alert.alert("Delete comment", "Remove this final comment?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteFinalCommentMutation.mutate(
              { userId: menteeId, commentId },
              {
                onError: () => {
                  Alert.alert("Error", "Failed to delete final comment.");
                },
              },
            );
          },
        },
      ]);
    },
    [deleteFinalCommentMutation, menteeId],
  );

  const handleEditComment = useCallback((commentId: string) => {
    setEditingCommentId(commentId);
    openCommentsSheet();
  }, [openCommentsSheet]);

  const handleMarkProgramComplete = useCallback(() => {
    if (!menteeId) return;

    requestMarkComplete({
      userId: menteeId,
      overallProgress: overallProgress.completedPercentage,
      hasFinalComment,
      hasCompleted: isProgrammeCompleted,
      menteeName: mentee?.firstName,
    });
  }, [
    hasFinalComment,
    isProgrammeCompleted,
    mentee?.firstName,
    menteeId,
    overallProgress.completedPercentage,
    requestMarkComplete,
  ]);

  const handleAssessmentCdpPress = useCallback((assessment: any) => {
    const assessmentId = assessment?.id || assessment?.assessmentId || assessment?._id;
    if (!assessmentId || !menteeId) return;

    router.push({
      pathname: "/(mentor)/assessments/answer-questions" as any,
      params: {
        assessmentId: String(assessmentId),
        viewMode: "true",
        targetUserId: menteeId,
        openCdp: "true",
      },
    });
  }, [menteeId]);

  const handleRoadmapPress = useCallback(
    (roadmapId: string) => {
      if (!menteeId) return;

      const roadmap = roadmaps?.find((r) => r._id === roadmapId);
      const singleTaskId = roadmap ? getSingleNestedTaskId(roadmap) : undefined;
      const params = { menteeId, menteeName };

      if (singleTaskId) {
        router.push({
          pathname: `/(mentor)/roadmap/${roadmapId}/${singleTaskId}` as any,
          params,
        });
        return;
      }

      router.push({
        pathname: "/(mentor)/roadmap/[phaseId]" as any,
        params: { phaseId: roadmapId, ...params },
      });
    },
    [menteeId, menteeName, roadmaps],
  );

  const handleAssessmentPress = useCallback((assessment: any) => {
    if (!assessment?.id) return;

    const params: { assessmentId: string; menteeId?: string; assessmentStatus?: string } = {
      assessmentId: assessment.id,
      assessmentStatus: assessment.status,
    };

    if (menteeId) {
      params.menteeId = menteeId;
    }

    if (assessment.type === "CMA") {
      router.push({
        pathname: "/(mentor)/assessments/cma-survey-page" as any,
        params,
      });
      return;
    }

    router.push({
      pathname: "/(mentor)/assessments/(pmp)/pmp-survey-page" as any,
      params,
    });
  }, [menteeId]);

  const isLoading =
    isMenteesLoading ||
    isProgressLoading ||
    isRoadmapsLoading ||
    isAssessmentsLoading;

  const isRefreshing =
    isProgressRefetching ||
    isRoadmapsRefetching ||
    isAssessmentsRefetching;

  if (isLoading) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <TopBar role="mentor" showUserName showSearch={false} />
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.stateText}>Loading mentee progress...</Text>
        </View>
      </AppGradientBackground>
    );
  }

  if (!menteeId || !mentee) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <TopBar role="mentor" showUserName showSearch={false} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Mentee not found.</Text>
        </View>
      </AppGradientBackground>
    );
  }

  if (progressError) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <TopBar role="mentor" showUserName showSearch={false} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Failed to load progress data.</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <View style={styles.scrollContainer}>
        <TopBar role="mentor" showUserName showSearch={false} />

          <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Image source={icons.forward} style={styles.backIcon} />
              <View style={styles.headerTextBlock}>
                <Text style={styles.headerTitle}>Progress Tracker</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {menteeName}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: bottom * 1.3 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
              colors={["#fff"]}
              progressBackgroundColor={Colors.darkBlueGradientOne}
            />
          }
        >
          <ProgressPieChart
            data={overallProgress}
            title={`${menteeName} - Roadmaps & Assessments`}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Individual - Roadmaps, Assessments</Text>
            <View style={styles.chartWrapper}>
              <ProgressBarChart
                data={chartData}
                showRemaining
                gridLineColor="rgba(255, 255, 255, 0.35)"
                maxValue={5}
              />
            </View>
          </View>

          <View style={styles.progressBlock}>
            <Text style={styles.progressBlockTitle}>Revitalization Roadmap Progress</Text>
            <View style={styles.tabStripWrap}>
              <RoadmapTabStrip
                tabs={availableTabs}
                activeKey={roadmapTabs}
                onChange={(k) => setRoadmapTabs(k as TabKey)}
                scrollable
              />
            </View>

            <View style={styles.cardListContainer}>
              {filteredRoadmaps.length > 0 ? (
                filteredRoadmaps.map((roadmap, index) => {
                  const cardData = getRoadmapCard(roadmap);

                  return (
                    <View
                      key={roadmap._id}
                      style={[styles.cardWrapper, { paddingTop: index === 0 ? 15 : 0 }]}
                    >
                      <RoadmapCard
                        data={{ ...cardData, phaseNumber: undefined }}
                        onPress={() => handleRoadmapPress(roadmap._id)}
                      />
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {roadmapTabs === "Completed" ? "No completed roadmaps yet" : "No roadmaps available"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.progressBlock}>
            <Text style={styles.progressBlockTitle}>Assessment Progress</Text>
            <View style={styles.tabStripWrap}>
              <RoadmapTabStrip
                tabs={availableTabs}
                activeKey={assessmentTabs}
                onChange={(k) => setAssessmentTabs(k as TabKey)}
                scrollable
              />
            </View>

            <View style={styles.cardListContainer}>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((assessment, index) => (
                  <View
                    key={`${assessment.id}-${index}`}
                    style={[styles.cardWrapper, { paddingTop: index === 0 ? 15 : 0 }]}
                  >
                    <ProgressAssessmentCard
                      data={assessment as any}
                      onPress={() => handleAssessmentPress(assessment)}
                      onDevelopmentPlanPress={() => handleAssessmentCdpPress(assessment)}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {assessmentTabs === "Completed" ? "No completed assessments yet" : "No assessments available"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.completionSection}>
            <Text style={styles.completionSectionTitle}>Programme completion</Text>

            {isProgrammeCompleted ? (
              <View style={styles.completedBanner}>
                <View style={styles.completedBannerHeader}>
                  <Ionicons name="checkmark-circle" size={22} color="#6FD4BE" />
                  <Text style={styles.completedBannerTitle}>Marked as completed</Text>
                </View>
                <Text style={styles.completedBannerText}>
                  You have marked this pastor as programme complete. Certificate and field mentor steps are handled by the director.
                </Text>
                {hasFinalComment ? (
                  <TouchableOpacity style={styles.commentsActionButton} onPress={openCommentsSheet}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6FD4BE" />
                    <Text style={styles.commentsActionButtonText}>View Final Comments</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : isProgramProgressComplete ? (
              <>
                <TouchableOpacity style={styles.commentsActionButton} onPress={openCommentsSheet}>
                  <Ionicons
                    name={hasFinalComment ? "chatbubble-ellipses-outline" : "create-outline"}
                    size={18}
                    color="#6FD4BE"
                  />
                  <Text style={styles.commentsActionButtonText}>
                    {hasFinalComment ? "View Final Comments" : "Add Final Comments"}
                  </Text>
                </TouchableOpacity>

                {!hasFinalComment ? (
                  <Text style={styles.completionHint}>
                    Add final comments before marking the programme as completed.
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.markCompleteButton,
                    (!canMarkComplete || markCompleteMutation.isPending) && styles.markCompleteButtonDisabled,
                  ]}
                  disabled={!canMarkComplete || markCompleteMutation.isPending}
                  onPress={handleMarkProgramComplete}
                >
                  {markCompleteMutation.isPending ? (
                    <ActivityIndicator size="small" color="#0B3D5C" />
                  ) : (
                    <Ionicons name="checkmark-circle-outline" size={18} color="#0B3D5C" />
                  )}
                  <Text style={styles.markCompleteButtonText}>
                    {markCompleteMutation.isPending ? "Marking as completed..." : "Mark programme as completed"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.completionHint}>
                Programme completion unlocks when roadmaps and assessments reach 100%.
              </Text>
            )}
          </View>

        </ScrollView>
      </View>

      <CommentBottomSheet
        ref={commentsSheetRef}
        title={menteeName}
        subtitle="Final Comments"
        comments={formattedComments}
        editingCommentId={editingCommentId}
        onClose={() => {
          setEditingCommentId(null);
          commentsSheetRef.current?.dismiss();
        }}
        onSubmit={handleSubmitComment}
        onDelete={handleDeleteComment}
        onEdit={handleEditComment}
        maxCommentsReached={finalComments.length >= 2}
        submitButtonText={editingCommentId ? "Update" : "Submit"}
        readOnly={isProgrammeCompleted}
      />
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  headerContainer: { width: "100%", alignItems: "center", paddingVertical: 10 },
  headerContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  backIcon: { width: 18, height: 18, transform: [{ scaleX: -1 }] },
  headerTextBlock: {
    flexShrink: 1,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 13,
    marginTop: 2,
  },
  completionSection: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  completionSectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  commentsActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.55)",
    backgroundColor: "rgba(111, 212, 190, 0.08)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  commentsActionButtonText: {
    color: "#6FD4BE",
    fontSize: 14,
    fontWeight: "600",
  },
  completionHint: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 18,
  },
  markCompleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#6FD4BE",
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  markCompleteButtonDisabled: {
    opacity: 0.45,
  },
  markCompleteButtonText: {
    color: "#0B3D5C",
    fontSize: 14,
    fontWeight: "700",
  },
  completedBanner: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "rgba(111, 212, 190, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.3)",
  },
  completedBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  completedBannerTitle: {
    color: "#6FD4BE",
    fontSize: 16,
    fontWeight: "700",
  },
  completedBannerText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 18,
  },
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 10,
  },
  chartWrapper: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    paddingVertical: 20,
    paddingLeft: 16,
    paddingRight: 10,
  },
  progressBlock: { marginTop: 20, gap: 20 },
  progressBlockTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
  },
  tabStripWrap: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cardListContainer: {
    marginVertical: 10,
    paddingHorizontal: 16,
    width: "100%",
  },
  cardWrapper: { width: "100%", marginBottom: 12 },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 15,
    textAlign: "center",
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stateText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
