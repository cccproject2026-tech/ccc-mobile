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
import { useProgress } from "@/hooks/progress/useProgress";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { comparePastorPhasesForHome } from "@/lib/roadmap/helpers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { useAuthStore } from "@/stores";
import { sharePdfFromHtml } from "@/utils/pdf";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RoadmapTabStrip } from "@/components/ui/design-system";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
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
  const { menteeId } = useLocalSearchParams<{ menteeId?: string }>();
  const { user } = useAuthStore();
  const { bottom } = useSafeAreaInsets();
  const pmpSheetRef = useRef<BottomSheetModal>(null);

  const [roadmapTabs, setRoadmapTabs] = useState<TabKey>("All");
  const [assessmentTabs, setAssessmentTabs] = useState<TabKey>("All");

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

  const overallProgress = useMemo(() => {
    const completedPercentage = round1(progressData?.overallProgress ?? 0);
    const remainingPercentage = round1(Math.max(0, 100 - completedPercentage));
    return { completedPercentage, remainingPercentage };
  }, [progressData]);

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

        </ScrollView>
      </View>

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
