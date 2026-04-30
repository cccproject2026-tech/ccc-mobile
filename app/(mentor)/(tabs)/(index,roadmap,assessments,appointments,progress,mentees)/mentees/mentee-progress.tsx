import PMPBottomSheet from "@/components/director/PMPBottomSheet";
import { ProgressAssessmentCard } from "@/components/director/ProgressAssessmentCard";
import { ChartData, ProgressBarChart } from "@/components/director/ProgressBarChart";
import { ProgressPieChart } from "@/components/director/ProgressPieChart";
import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useAddFinalComment, useDeleteFinalComment, useProgress, useUpdateFinalComment } from "@/hooks/progress/useProgress";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { useAuthStore } from "@/stores";
import { sharePdfFromHtml } from "@/utils/pdf";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const { menteeId } = useLocalSearchParams<{ menteeId?: string }>();
  const { user } = useAuthStore();
  const { bottom } = useSafeAreaInsets();
  const pmpSheetRef = useRef<BottomSheetModal>(null);

  const [roadmapTabs, setRoadmapTabs] = useState<TabKey>("All");
  const [assessmentTabs, setAssessmentTabs] = useState<TabKey>("All");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [finalComments, setFinalComments] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const addFinalCommentMutation = useAddFinalComment();
  const updateFinalCommentMutation = useUpdateFinalComment();
  const deleteFinalCommentMutation = useDeleteFinalComment();

  const {
    data: menteesData,
    isLoading: isMenteesLoading,
  } = useMentees(100, user?.id);
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

  const menteeName = useMemo(() => {
    if (!mentee) return "Mentee Progress";
    return `${mentee.firstName ?? ""}${mentee.lastName ? ` ${mentee.lastName}` : ""}`.trim() || "Mentee Progress";
  }, [mentee]);

  const existingComments = useMemo(() => {
    return progressData?.finalComments || [];
  }, [progressData?.finalComments]);

  const overallProgress = useMemo(() => {
    const completedPercentage = round1(progressData?.overallProgress ?? 0);
    const remainingPercentage = round1(Math.max(0, 100 - completedPercentage));
    return { completedPercentage, remainingPercentage };
  }, [progressData]);

  const availableTabs = [{ tab: "All" }, { tab: "Completed" }, { tab: "Remaining" }];

  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return [];

    const sorted = [...roadmaps].sort((a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt));

    switch (roadmapTabs) {
      case "Completed":
        return sorted.filter((item) => item.status === "completed").slice(0, 5);
      case "Remaining":
        return sorted.filter((item) => item.status !== "completed").slice(0, 5);
      default:
        return sorted.slice(0, 5);
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

  const closePMPSheet = useCallback(() => pmpSheetRef.current?.dismiss(), []);
  const openPMPSheet = useCallback(() => pmpSheetRef.current?.present(), []);

  const handlePmpNext = useCallback(() => {
    closePMPSheet();
    router.push({
      pathname: "/progress/report",
      params: {
        userName: menteeName,
        completedDate: new Date().toLocaleDateString("en-GB"),
        assessmentTitle: "Recommendations",
      },
    });
  }, [closePMPSheet, menteeName]);

  const handlePmpDownload = useCallback(async () => {
    closePMPSheet();

    const plans = [
      "Schedule 1-on-1 with a mentor",
      "Take trauma survey (via Claritysoft)",
      "Identify areas of stress/anxiety",
      "Family Wellbeing survey",
      "Collaborate on a healing plan",
      "Collaborate on a physical Exercise plan",
      "Establish a prayer covenant/partnership",
      "Finalize a growth plan",
    ];

    const listHtml = plans.map((t) => `<li>${t}</li>`).join("");

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, system-ui, Segoe UI, Roboto, Arial; padding: 24px; color: #0f172a; }
            h1 { font-size: 18px; margin: 0 0 10px; color: #1e3a8a; }
            h2 { font-size: 16px; margin: 18px 0 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; color: #1e3a8a; }
            ul { margin: 0; padding-left: 18px; }
            li { margin: 0 0 8px; line-height: 1.35; }
          </style>
        </head>
        <body>
          <h1>Recommendations</h1>
          <h2>Section 1 - Personal Well-Being</h2>
          <ul>${listHtml}</ul>
        </body>
      </html>
    `;

    await sharePdfFromHtml({
      html,
      fileName: `${menteeName.replace(/\s+/g, "_") || "Recommendations"}_Report.pdf`,
    });
  }, [closePMPSheet, menteeName]);

  const handleRoadmapPress = useCallback((roadmapId: string) => {
    if (!menteeId) return;

    router.push({
      pathname: "/(mentor)/roadmap/[phaseId]" as any,
      params: {
        phaseId: roadmapId,
        menteeId,
        menteeName,
      },
    });
  }, [menteeId, menteeName]);

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

  const handleAddComments = useCallback(() => {
    setEditingCommentId(null);
    setFinalComments("");
    setShowCommentsModal(true);
  }, []);

  const handleEditComment = useCallback((commentId: string, commentText: string) => {
    setEditingCommentId(commentId);
    setFinalComments(commentText);
    setShowCommentsModal(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setFinalComments("");
    setShowCommentsModal(false);
  }, []);

  const handleDeleteComment = useCallback((commentId: string) => {
    if (!menteeId) return;

    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteFinalCommentMutation.mutate(
              {
                userId: menteeId,
                commentId,
              },
              {
                onError: () => {
                  Alert.alert("Error", "Failed to delete comment. Please try again.");
                },
              }
            );
          },
        },
      ]
    );
  }, [deleteFinalCommentMutation, menteeId]);

  const handleSubmitComments = useCallback(() => {
    if (!finalComments.trim() || !user?.id || !menteeId) return;

    if (editingCommentId) {
      updateFinalCommentMutation.mutate(
        {
          userId: menteeId,
          commentId: editingCommentId,
          comment: finalComments.trim(),
        },
        {
          onSuccess: () => {
            setFinalComments("");
            setEditingCommentId(null);
            setShowCommentsModal(false);
          },
          onError: () => {
            Alert.alert("Error", "Failed to update comment. Please try again.");
          },
        }
      );
      return;
    }

    addFinalCommentMutation.mutate(
      {
        userId: menteeId,
        commentorId: user.id,
        comment: finalComments.trim(),
      },
      {
        onSuccess: () => {
          setFinalComments("");
          setShowCommentsModal(false);
        },
        onError: () => {
          Alert.alert("Error", "Failed to add comment. Please try again.");
        },
      }
    );
  }, [addFinalCommentMutation, editingCommentId, finalComments, menteeId, updateFinalCommentMutation, user?.id]);

  const isLoading =
    isMenteesLoading ||
    isProgressLoading ||
    isRoadmapsLoading ||
    isAssessmentsLoading;

  const isRefreshing =
    isProgressRefetching ||
    isRoadmapsRefetching ||
    isAssessmentsRefetching;

  const FilterTabs = ({
    value,
    onChange,
  }: {
    value: TabKey;
    onChange: (next: TabKey) => void;
  }) => (
    <View style={styles.filterTabsRow}>
      {availableTabs.map((tabItem) => {
        const isActive = value === (tabItem.tab as TabKey);
        return (
          <TouchableOpacity
            key={tabItem.tab}
            onPress={() => onChange(tabItem.tab as TabKey)}
            style={[styles.filterTabButton, isActive && styles.filterTabButtonActive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
              {tabItem.tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

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

            <TouchableOpacity style={styles.addCommentsButton} onPress={handleAddComments}>
              <Text style={styles.addCommentsButtonText}>Add Final Comments</Text>
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
            <FilterTabs value={roadmapTabs} onChange={setRoadmapTabs} />

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
            <FilterTabs value={assessmentTabs} onChange={setAssessmentTabs} />

            <View style={styles.cardListContainer}>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((assessment, index) => (
                  <View
                    key={`${assessment.id}-${index}`}
                    style={[styles.cardWrapper, { paddingTop: index === 0 ? 15 : 0 }]}
                  >
                    <ProgressAssessmentCard
                      data={{
                        ...(assessment as any),
                        image: mentee?.profilePicture,
                      }}
                      onPress={() => handleAssessmentPress(assessment)}
                      onDevelopmentPlanPress={openPMPSheet}
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

          <View style={styles.commentsSection}>
            <View style={styles.commentsHeaderRow}>
              <Text style={styles.progressBlockTitle}>Final Comments</Text>
              {existingComments.length > 0 ? (
                <Text style={styles.commentsCountText}>{existingComments.length}</Text>
              ) : null}
            </View>

            <View style={styles.commentsCard}>
              {existingComments.length > 0 ? (
                existingComments.map((comment, index) => (
                  <View
                    key={comment._id}
                    style={[
                      styles.commentItem,
                      index !== existingComments.length - 1 && styles.commentItemBorder,
                    ]}
                  >
                    <View style={styles.commentActions}>
                      <TouchableOpacity
                        style={styles.commentActionButton}
                        onPress={() => handleEditComment(comment._id, comment.comment)}
                      >
                        <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.commentActionButton, styles.commentDeleteButton]}
                        onPress={() => handleDeleteComment(comment._id)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FFB4B4" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.commentText}>{comment.comment}</Text>
                    <Text style={styles.commentMeta}>
                      {new Date(comment.updatedAt || comment.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No final comments added yet</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={showCommentsModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingCommentId ? "Edit Final Comment" : "Add Final Comment"}
            </Text>

            <TextInput
              value={finalComments}
              onChangeText={setFinalComments}
              placeholder="Write your final comments here"
              placeholderTextColor="rgba(255, 255, 255, 0.55)"
              multiline
              textAlignVertical="top"
              style={styles.commentInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!finalComments.trim() ||
                    addFinalCommentMutation.isPending ||
                    updateFinalCommentMutation.isPending) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitComments}
                disabled={
                  !finalComments.trim() ||
                  addFinalCommentMutation.isPending ||
                  updateFinalCommentMutation.isPending
                }
              >
                <Text style={styles.submitButtonText}>
                  {editingCommentId ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PMPBottomSheet
        ref={pmpSheetRef}
        onClose={closePMPSheet}
        onNext={handlePmpNext}
        onDownload={handlePmpDownload}
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
    justifyContent: "space-between",
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
  addCommentsButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addCommentsButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
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
  filterTabsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 15,
  },
  filterTabButton: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  filterTabText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#1535A8",
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
  commentsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  commentsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  commentsCountText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
  },
  commentsCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    padding: 16,
  },
  commentItem: {
    paddingVertical: 4,
  },
  commentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
    marginBottom: 12,
    paddingBottom: 12,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 10,
  },
  commentActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  commentDeleteButton: {
    borderColor: "rgba(255,120,120,0.25)",
    backgroundColor: "rgba(255,107,107,0.08)",
  },
  commentText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  commentMeta: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#165A8B",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  commentInput: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: 15,
    padding: 14,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  cancelButtonText: {
    color: "#1A4882",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#1A4882",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
