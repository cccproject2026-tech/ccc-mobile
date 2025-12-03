import { Tab } from "@/components/atom/tab";
import PMPBottomSheet from "@/components/director/PMPBottomSheet";
import ProgressAssessmentCard from "@/components/director/ProgressAssessmentCard";
import { ChartData, ProgressBarChart } from "@/components/director/ProgressBarChart";
import { ProgressPieChart } from "@/components/director/ProgressPieChart";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useAssessmentProgress, useProgress, useRoadmapProgress } from '@/hooks/progress/useProgress';
import { useRoadmaps } from '@/hooks/roadmaps/useRoadmaps';
import { getRoadmapCard } from '@/lib/roadmap/mappers';
import { useAuthStore } from '@/stores/auth.store';
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = 'All' | 'Completed' | 'Remaining';

export default function ProgressScreen() {
  const [roadmapTabs, setRoadmapTabs] = useState<TabKey>("All");
  const [assessmentTabs, setAssessmentTabs] = useState<TabKey>("All");
  const pmpSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuthStore();

  // Fetch all backend data
  const { data: progressData, isLoading: isProgressLoading, error: progressError } = useProgress();
  const { data: roadmaps, isLoading: isRoadmapsLoading, refetch: refetchRoadmaps, isRefetching: isRoadmapsRefetching } = useRoadmaps('pastor');
  const { data: assessments, isLoading: isAssessmentsLoading, refetch: refetchAssessments } = useAssignedAssessments();

  const { data: roadmapProgress } = useRoadmapProgress();
  const { data: assessmentProgress } = useAssessmentProgress();

  // Overall Pie Progress
  const overallProgress = useMemo(() => {
    if (!progressData)
      return { completedPercentage: 0, remainingPercentage: 100 };

    return {
      completedPercentage: progressData.overallProgress,
      remainingPercentage: 100 - progressData.overallProgress,
    };
  }, [progressData]);

  // Handle PMP sheet
  const closePMPSheet = useCallback(() => pmpSheetRef.current?.dismiss(), []);
  const openPMPSheet = useCallback(() => pmpSheetRef.current?.present(), []);
  const handleNext = () => { closePMPSheet(); router.push('/progress/report'); };
  const handleDownload = () => { closePMPSheet(); router.push('/progress/report'); };

  const availableTabs = [{ tab: "All" }, { tab: "Completed" }, { tab: "Remaining" }];

  // Filter Roadmaps
  const filteredRoadmaps = useMemo(() => {
    if (!roadmaps) return [];
    switch (roadmapTabs) {
      case 'Completed': return roadmaps.filter(r => r.status === 'completed');
      case 'Remaining': return roadmaps.filter(r => r.status !== 'completed');
      default: return roadmaps;
    }
  }, [roadmaps, roadmapTabs]);

  // Filter Assessments
  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];
    switch (assessmentTabs) {
      case 'Completed': return assessments.filter(a => a.status === "Completed");
      case 'Remaining': return assessments.filter(a => a.status !== "Completed");
      default: return assessments;
    }
  }, [assessments, assessmentTabs]);

  // Bar chart data based on backend
  const chartData: ChartData = useMemo(() => {
    if (!roadmapProgress || !assessmentProgress)
      return {
        roadmapsTotal: 0,
        roadmapsCompleted: 0,
        roadmapsRemaining: 0,
        assessmentsTotal: 0,
        assessmentsCompleted: 0,
        assessmentsRemaining: 0,
      };

    return {
      roadmapsTotal: roadmapProgress.total,
      roadmapsCompleted: roadmapProgress.completed,
      roadmapsRemaining: roadmapProgress.total - roadmapProgress.completed,
      assessmentsTotal: assessmentProgress.total,
      assessmentsCompleted: assessmentProgress.completed,
      assessmentsRemaining: assessmentProgress.total - assessmentProgress.completed,
    };
  }, [roadmapProgress, assessmentProgress]);

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
              <ProgressBarChart data={chartData} showRemaining={true} />
            </View>
          </View>

          {/* Roadmaps */}
          <View style={styles.progressBlock}>
            <Text style={styles.progressBlockTitle}>Revitalization Roadmap Progress</Text>

            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScrollContent}
              style={styles.tabScroll}
            >
              {availableTabs.map((e, i) => (
                <Tab
                  key={i}
                  data={e}
                  tabs={roadmapTabs}
                  setTabs={(tab: string) => setRoadmapTabs(tab as TabKey)}
                  onPress={() => setRoadmapTabs(e.tab as TabKey)}
                />
              ))}
            </ScrollView>

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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScrollContent}
              style={styles.tabScroll}
            >
              {availableTabs.map((e, i) => (
                <Tab
                  key={i}
                  data={e}
                  tabs={assessmentTabs}
                  setTabs={(tab: string) => setAssessmentTabs(tab as TabKey)}
                  onPress={() => setAssessmentTabs(e.tab as TabKey)}
                />
              ))}
            </ScrollView>

            {/* Assessment Cards */}
            <View style={styles.cardListContainer}>
              {filteredAssessments.length > 0 ? (
                filteredAssessments.map((a, i) => (
                  <View key={`assessment-${i}`} style={[styles.cardWrapper, { paddingTop: i === 0 ? 15 : 0 }]}>
                    <ProgressAssessmentCard onDevelopmentPlanPress={openPMPSheet} data={a as any} />
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
  tabScroll: { maxHeight: 50, marginTop: 15 },
  tabScrollContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 5 },
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
