import PMPBottomSheet from "@/components/director/PMPBottomSheet";
import { ProgressAssessmentCard } from "@/components/director/ProgressAssessmentCard";
import { ChartData, ProgressBarChart } from "@/components/director/ProgressBarChart";
import { ProgressPieChart } from "@/components/director/ProgressPieChart";
import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useProgress } from '@/hooks/progress/useProgress';
import { useRoadmaps } from '@/hooks/roadmaps/useRoadmaps';
import { getRoadmapCard } from '@/lib/roadmap/mappers';
import { sharePdfFromHtml } from "@/utils/pdf";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = 'All' | 'Completed' | 'Remaining';

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
    0
  );
}

export default function ProgressScreen() {
  const [roadmapTabs, setRoadmapTabs] = useState<TabKey>("All");
  const [assessmentTabs, setAssessmentTabs] = useState<TabKey>("All");
  const pmpSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();

  // Fetch all backend data
  const { data: progressData, isLoading: isProgressLoading, error: progressError } = useProgress();
  const { data: roadmaps, isLoading: isRoadmapsLoading, refetch: refetchRoadmaps, isRefetching: isRoadmapsRefetching } = useRoadmaps('pastor');
  const { data: assessments } = useAssignedAssessments();

  // Overall Pie Progress
  const overallProgress = useMemo(() => {
    const completedPercentage = round1(progressData?.overallProgress ?? 0);
    const remainingPercentage = round1(100 - completedPercentage);
    return { completedPercentage, remainingPercentage };
  }, [progressData]);

  console.log('=======================')
  console.log("OverallProgress:", overallProgress);
  console.log("ProgressData:", progressData);
  console.log("========================================");
  // Handle PMP sheet
  const closePMPSheet = useCallback(() => pmpSheetRef.current?.dismiss(), []);
  const openPMPSheet = useCallback(() => pmpSheetRef.current?.present(), []);
  const handleNext = () => {
    closePMPSheet();
    router.push({
      pathname: "/progress/report",
      params: {
        userName: "John Ross",
        completedDate: new Date().toLocaleDateString("en-GB"),
        assessmentTitle: "Recommendations",
      },
    });
  };

  const handleDownload = async () => {
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
      fileName: "Recommendations_Report.pdf",
    });
  };

  const availableTabs = [{ tab: "All" }, { tab: "Completed" }, { tab: "Remaining" }];

  // Filter Roadmaps
  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return [];
    const sorted = [...roadmaps].sort((a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt));
    switch (roadmapTabs) {
      case 'Completed': return sorted.filter(r => r.status === 'completed').slice(0, 5);
      case 'Remaining': return sorted.filter(r => r.status !== 'completed').slice(0, 5);
      default: return sorted.slice(0, 5);
    }
  }, [roadmaps, roadmapTabs]);

  // Filter Assessments
  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];
    const sorted = [...assessments].sort((a, b) => getAssessmentActivityEpochMs(b) - getAssessmentActivityEpochMs(a));
    switch (assessmentTabs) {
      case 'Completed': return sorted.filter(a => a.status === "Completed").slice(0, 5);
      case 'Remaining': return sorted.filter(a => a.status !== "Completed").slice(0, 5);
      default: return sorted.slice(0, 5);
    }
  }, [assessments, assessmentTabs]);

  // Bar chart data based on latest 5 items (matches design)
  const chartData: ChartData = useMemo(() => {
    const latestRoadmaps = [...(roadmaps || [])]
      .sort((a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt))
      .slice(0, 5);
    const latestAssessments = [...(assessments || [])]
      .sort((a, b) => getAssessmentActivityEpochMs(b) - getAssessmentActivityEpochMs(a))
      .slice(0, 5);

    const roadmapsCompleted = latestRoadmaps.filter((r) => r.status === 'completed').length;
    const assessmentsCompleted = latestAssessments.filter((a) => a.status === 'Completed').length;

    return {
      roadmapsTotal: latestRoadmaps.length,
      roadmapsCompleted,
      roadmapsRemaining: Math.max(0, latestRoadmaps.length - roadmapsCompleted),
      assessmentsTotal: latestAssessments.length,
      assessmentsCompleted,
      assessmentsRemaining: Math.max(0, latestAssessments.length - assessmentsCompleted),
    };
  }, [roadmaps, assessments]);

  // Refresh
  const handleRefresh = useCallback(() => refetchRoadmaps(), [refetchRoadmaps]);

  // Navigate to Roadmap
  const handleRoadmapPress = useCallback(
    (roadmapId: string, hasNested: boolean, nestedCount: number, firstNestedId?: string) => {
      if (!hasNested || nestedCount === 0) return;

      if (nestedCount === 1 && firstNestedId)
        router.push(`/roadmap/${roadmapId}/${firstNestedId}`);
      else
        router.push(`/roadmap/${roadmapId}`);
    },
    []
  );

  const handleAssessmentPress = useCallback((assessment: any) => {
    const assessmentId = assessment?.id || assessment?.assessmentId || assessment?._id;
    if (!assessmentId) return;

    router.push({
      pathname: "/assessments/survey-guidelines",
      params: { assessmentId: String(assessmentId) },
    });
  }, []);

  const isLoading = isProgressLoading || isRoadmapsLoading;

  // Loading screen
  if (isLoading) {
    return (
      <LinearGradient colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]} style={{ flex: 1 }}>
        <TopBar role="pastor" showUserName />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 16 }}>Loading your progress...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Error screen
  if (progressError) {
    return (
      <LinearGradient colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]} style={{ flex: 1 }}>
        <TopBar role="pastor" showUserName />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
            Failed to load progress data
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const currentTitle = "Individual - Roadmaps, Assessments";

  const FilterTabs = ({
    value,
    onChange,
  }: {
    value: TabKey;
    onChange: (next: TabKey) => void;
  }) => (
    <View style={styles.filterTabsRow}>
      {availableTabs.map((t) => {
        const isActive = value === (t.tab as TabKey);
        return (
          <TouchableOpacity
            key={t.tab}
            onPress={() => onChange(t.tab as TabKey)}
            style={[styles.filterTabButton, isActive && styles.filterTabButtonActive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
              {t.tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <LinearGradient colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]} style={{ flex: 1 }}>
      <View style={styles.scrollContainer}>
        {/* Top Bar */}
        <TopBar role="pastor" showUserName />

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Image source={icons.forward} style={styles.backIcon} />
              <Text style={styles.myProgressText}>My Progress</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Body */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: bottom * 1.3 }}
          refreshControl={
            <RefreshControl
              refreshing={isRoadmapsRefetching}
              onRefresh={handleRefresh}
              tintColor="#fff"
              colors={['#fff']}
              progressBackgroundColor={Colors.darkBlueGradientOne}
            />
          }
        >
          {/* Pie Chart */}
          <ProgressPieChart data={overallProgress} title="Overall Progress - Roadmaps & Assessments" />

          {/* Bar Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{currentTitle}</Text>
            <View style={styles.chartWrapper}>
              <ProgressBarChart
                data={chartData}
                showRemaining={true}
                gridLineColor="rgba(255, 255, 255, 0.35)"
                maxValue={5}
              />
            </View>
          </View>

          {/* Roadmaps */}
          <View style={styles.progressBlock}>
            <Text style={styles.progressBlockTitle}>Revitalization Roadmap Progress</Text>

            {/* Tabs */}
            <FilterTabs value={roadmapTabs} onChange={setRoadmapTabs} />

            {/* Roadmap Cards */}
            <View style={styles.cardListContainer}>
              {filteredRoadmaps.length > 0 ? (
                filteredRoadmaps.map((roadmap, index) => {
                  const cardData = getRoadmapCard(roadmap);
                  return (
                    <View
                      key={roadmap._id}
                      style={[styles.cardWrapper, { paddingTop: index === 0 ? 15 : 0 }]}
                    >
                      <Pressable
                        onPress={() =>
                          handleRoadmapPress(
                            roadmap._id,
                            roadmap.haveNextedRoadMaps,
                            roadmap.roadmaps.length,
                            roadmap.roadmaps[0]?._id
                          )
                        }
                      >
                        <RoadmapCard data={{ ...cardData, phaseNumber: undefined }} />
                      </Pressable>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {roadmapTabs === 'Completed'
                      ? 'No completed roadmaps yet'
                      : 'No roadmaps available'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Assessments */}
          <View style={styles.progressBlock}>
            <Text style={styles.progressBlockTitle}>Assessment Progress</Text>

            {/* Tabs */}
            <FilterTabs value={assessmentTabs} onChange={setAssessmentTabs} />

            {/* Assessment Cards */}
            <View style={styles.cardListContainer}>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((a, i) => (
                  <View key={`assessment-${i}`} style={[styles.cardWrapper, { paddingTop: i === 0 ? 15 : 0 }]}>
                    <ProgressAssessmentCard
                      onPress={() => handleAssessmentPress(a)}
                      onDevelopmentPlanPress={openPMPSheet}
                      data={a as any}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {assessmentTabs === 'Completed'
                      ? 'No completed assessments yet'
                      : 'No assessments available'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Sheet */}
        <PMPBottomSheet
          ref={pmpSheetRef}
          onClose={closePMPSheet}
          onNext={handleNext}
          onDownload={handleDownload}
        />
      </View>
    </LinearGradient>
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
  myProgressText: { color: "#fff", fontWeight: "600", fontSize: 17 },
  searchContainer: { marginHorizontal: 16, marginTop: 10 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  backIcon: { width: 18, height: 18, transform: [{ scaleX: -1 }] },
  separator: { height: 20, backgroundColor: "transparent", marginVertical: 10 },
  cardWrapper: { width: "100%", marginBottom: 12 },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 25,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  toggleButtonActive: { backgroundColor: "#ffffff" },
  toggleButtonLeft: { borderTopLeftRadius: 25, borderBottomLeftRadius: 25 },
  toggleButtonRight: { borderTopRightRadius: 25, borderBottomRightRadius: 25 },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  toggleButtonTextActive: { color: "#1535A8" },
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
