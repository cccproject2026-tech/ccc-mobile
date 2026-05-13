import { ProgressAssessmentCard } from "@/components/director/ProgressAssessmentCard";
import { ChartData, ProgressBarChart } from "@/components/director/ProgressBarChart";
import { ProgressPieChart } from "@/components/director/ProgressPieChart";
import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { SquircleIconButton } from "@/components/ui/design-system/SquircleIconButton";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useProgress } from '@/hooks/progress/useProgress';
import { useRoadmaps } from '@/hooks/roadmaps/useRoadmaps';
import { getRoadmapCard } from '@/lib/roadmap/mappers';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = 'All' | 'Completed' | 'Remaining';

const accent = {
  gold: "#E8C88A",
  mint: "#6FD4BE",
  mintSoft: "rgba(111, 212, 190, 0.28)",
  tealDeep: "#0E5A62",
};

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
  const { bottom } = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const pagePadding = windowWidth >= 430 ? 24 : 16;

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

  const handleAssessmentCdpPress = useCallback((assessment: any) => {
    const assessmentId = assessment?.id || assessment?.assessmentId || assessment?._id;
    if (!assessmentId) return;

    router.push({
      pathname: "/assessments/answer-questions",
      params: {
        assessmentId: String(assessmentId),
        viewMode: "true",
        openCdp: "true",
      },
    });
  }, []);

  const isLoading = isProgressLoading || isRoadmapsLoading;

  // Loading screen
  if (isLoading) {
    return (
      <AppGradientBackground>
        <TopBar role="pastor" showUserName />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 16 }}>Loading your progress...</Text>
        </View>
      </AppGradientBackground>
    );
  }

  // Error screen
  if (progressError) {
    return (
      <AppGradientBackground>
        <TopBar role="pastor" showUserName />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
            Failed to load progress data
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </AppGradientBackground>
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
    <AppGradientBackground>
      <View style={styles.bgCircleTop} pointerEvents="none" />
      <View style={styles.bgCircleBottom} pointerEvents="none" />
      <View style={styles.scrollContainer}>
        {/* Top Bar */}
        <TopBar role="pastor" showUserName />

        {/* Header */}
        <View style={styles.heroHeader}>
          <View style={styles.pill}>
            <View style={styles.pillDots}>
              <View style={styles.pillDot} />
              <View style={styles.pillDotGold} />
            </View>
            <Text style={styles.pillText}>Center for Community Change</Text>
          </View>

          <View style={styles.heroTitleRow}>
            <View style={styles.heroLeftRow}>
              <SquircleIconButton
                icon="chevron-back"
                onPress={() => router.back()}
                accessibilityLabel="Go back"
              />
              <Text style={styles.heroTitle}>Overall progress</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Track your roadmap phases and assessments in one place.
          </Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Ionicons name="leaf-outline" size={14} color={accent.mint} />
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Body */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: bottom * 1.3,
            paddingTop: 6,
            paddingHorizontal: pagePadding,
            alignItems: "center",
          }}
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
          <View style={styles.contentWrap}>
          {/* Pie Chart */}
          <View style={styles.surfaceCard}>
            <ProgressPieChart data={overallProgress} title="Overall Progress" />
          </View>

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
          <View style={styles.surfaceCard}>
            <View style={styles.blockHeaderRow}>
              <Text style={styles.blockTitle}>Roadmap progress</Text>
              <Text style={styles.blockHint}>Latest 5</Text>
            </View>

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
          <View style={styles.surfaceCard}>
            <View style={styles.blockHeaderRow}>
              <Text style={styles.blockTitle}>Assessment progress</Text>
              <Text style={styles.blockHint}>Latest 5</Text>
            </View>

            {/* Tabs */}
            <FilterTabs value={assessmentTabs} onChange={setAssessmentTabs} />

            {/* Assessment Cards */}
            <View style={styles.cardListContainer}>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((a, i) => (
                  <View key={`assessment-${i}`} style={[styles.cardWrapper, { paddingTop: i === 0 ? 15 : 0 }]}>
                    <ProgressAssessmentCard
                      onPress={() => handleAssessmentPress(a)}
                      onDevelopmentPlanPress={() => handleAssessmentCdpPress(a)}
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
          </View>
        </ScrollView>

      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  contentWrap: {
    width: "100%",
    maxWidth: 560,
  },
  bgCircleTop: {
    position: "absolute",
    top: -130,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  bgCircleBottom: {
    position: "absolute",
    bottom: -90,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroHeader: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginTop: 8,
    marginBottom: 12,
  },
  pillDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: accent.mint },
  pillDotGold: { width: 6, height: 6, borderRadius: 3, backgroundColor: accent.gold },
  pillText: { color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: "700" },
  heroTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  heroLeftRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.2 },
  heroSubtitle: { color: "rgba(255,255,255,0.72)", marginTop: 4, fontSize: 13, lineHeight: 18 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, marginBottom: 0 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },
  searchContainer: { marginHorizontal: 16, marginTop: 10 },
  surfaceCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  blockHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  blockTitle: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: -0.15 },
  blockHint: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "700" },
  separator: { height: 20, backgroundColor: "transparent", marginVertical: 10 },
  cardWrapper: { width: "100%", marginBottom: 12 },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
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
  toggleButtonTextActive: { color: accent.tealDeep },
  section: { marginBottom: 6, marginTop: 14 },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  chartWrapper: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
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
    marginTop: 15,
    flexWrap: "nowrap",
  },
  filterTabButton: {
    flex: 1,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
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
    color: accent.tealDeep,
  },
  cardListContainer: {
    marginVertical: 10,
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
