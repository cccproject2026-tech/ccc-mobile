import { Tab } from "@/components/atom/tab";
import PMPBottomSheet from "@/components/director/PMPBottomSheet";
import ProgressAssessmentCard from "@/components/director/ProgressAssessmentCard";
import { ChartData, ProgressBarChart } from "@/components/director/ProgressBarChart";
import { ProgressPieChart } from "@/components/director/ProgressPieChart";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { usePhaseCard } from '@/lib/roadmap/mappers';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { getPhase, getPhaseTasks } from '@/lib/roadmap/selectors';
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function ProgressScreen() {
  const [roadmapTabs, setRoadmapTabs] = React.useState("All");
  const [assessmentTabs, setAssessmentTabs] = React.useState("All");
  const [showCompleted, setShowCompleted] = React.useState(false);
  const pmpSheetRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const [progress, setProgress] = React.useState<{ completedPercentage: number; remainingPercentage: number }>({
    completedPercentage: 62.5,
    remainingPercentage: 37.5,
  });

  const closePMPSheet = useCallback(() => {
    pmpSheetRef.current?.dismiss();
  }, []);

  const handleNext = () => {
    closePMPSheet();
    router.push('/progress/report');
  };

  const handleDownload = () => {
    closePMPSheet();
    router.push('/progress/report');
  };

  const openPMPSheet = useCallback(() => {
    console.log('Opening PMP Bottom Sheet');
    console.log('pmpSheetRef current:', pmpSheetRef.current);
    if (pmpSheetRef.current) {
      pmpSheetRef.current.present();
    } else {
      console.error('PMPBottomSheet ref is null');
    }
  }, []);


  const dummyAssessment = [
    {
      title: "Church Assessment Evaluation(CMA)",
      description:
        "Interested in receiving mentoring in community engagement   ",
      image: require("@/assets/images/jumpstart.png"),
      progress: "0",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
      dueDate: "20 Oct 2024",
      status: "Completed",
      type: "assessment",
    },
    {
      title: "Church Assessment Evaluation(CMA)",
      description:
        "Interested in receiving mentoring in community engagement   ",
      image: require("@/assets/images/jumpstart.png"),
      progress: "0",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
      submittedDate: "20 Oct 2024",
      status: "due",
      type: "assessment",
      completed: "Customized Development Plans",
    },
  ];





  const availableTabs = [
    { tab: "All" },
    { tab: "Completed" },
    { tab: "Remaining" },
  ];

  // Build phase card data from mockRevitalization (matches roadmap index implementation)
  // Note: usePhaseCard is a hook so we call it for each phase (same pattern as roadmap index)
  const phaseCards = (mockRevitalization.program.phases || []).map(phaseId => {
    const phase = getPhase(mockRevitalization, phaseId);
    const tasks = getPhaseTasks(mockRevitalization, phase);
    return usePhaseCard(phase, tasks);
  });

  // Filter based on the Revitalization tabs (All / Completed / Remaining)
  const selectablePhaseCards = useMemo(() => {
    const key = (roadmapTabs || '').toString().toLowerCase();
    if (key === 'all') return phaseCards;
    if (key === 'completed') return phaseCards.filter(c => c.status === 'completed');
    return phaseCards.filter(c => c.status !== 'completed');
  }, [phaseCards, roadmapTabs]);

  // const shuffle = (arr: any[]) => {
  //   const a = arr.slice();
  //   for (let i = a.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [a[i], a[j]] = [a[j], a[i]];
  //   }
  //   return a;
  // };

  // const selectedPhaseCards = useMemo(() => shuffle(selectablePhaseCards).slice(0, 5), [selectablePhaseCards]);



  const filteredAssessments = dummyAssessment.filter((item) => {
    if (assessmentTabs === "All") {
      return true;
    } else if (assessmentTabs === "Completed") {
      return item.status === "Completed";
    } else {
      return item.status !== "Completed";
    }
  });

  // Chart data for completed and in-progress states
  const completedData: ChartData = {
    roadmapsTotal: 5,
    roadmapsCompleted: 5,
    assessmentsTotal: 3,
    assessmentsCompleted: 3,
  };

  const inProgressData: ChartData = {
    roadmapsTotal: 5,
    roadmapsCompleted: 3,
    roadmapsRemaining: 2,
    assessmentsTotal: 3,
    assessmentsCompleted: 2,
    assessmentsRemaining: 1,
  };

  const currentData = showCompleted ? completedData : inProgressData;
  const currentTitle = showCompleted
    ? "Individual - Roadmaps, Assessments"
    : "Individual - Assignment, Survey";

  const handleSwitchProgress = (progressType: 'completed' | 'inprogress') => {
    if (progressType === 'completed') {
      setProgress({ completedPercentage: 100, remainingPercentage: 0 });
      setShowCompleted(true);
    } else {
      setProgress({ completedPercentage: 62.5, remainingPercentage: 37.5 });
      setShowCompleted(false);
    }
  };

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <View style={styles.scrollContainer}>
          <TopBar role="pastor" userName="John Ross" showUserName />
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Image source={icons.forward} style={styles.backIcon} />
                <Text style={styles.myProgressText}>My Mentors</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showCompleted && styles.toggleButtonActive,
                styles.toggleButtonLeft,
              ]}
              onPress={() => handleSwitchProgress("inprogress")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  !showCompleted && styles.toggleButtonTextActive,
                ]}
              >
                Inprogress
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showCompleted && styles.toggleButtonActive,
                styles.toggleButtonRight,
              ]}
              onPress={() => handleSwitchProgress("completed")}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  showCompleted && styles.toggleButtonTextActive,
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottom * 1.3,
            }}
          >
            <ProgressPieChart
              data={progress}
              title="Overall Progress - Roadmaps & Assessments"
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{currentTitle}</Text>
              <View style={styles.chartWrapper}>
                <ProgressBarChart data={currentData} showRemaining={!showCompleted} />
              </View>
            </View>

            <View style={styles.progressBlock}>
              <Text style={styles.progressBlockTitle}>Revitalization Roadmap Progress</Text>
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
                    setTabs={setRoadmapTabs}
                    onPress={() => setRoadmapTabs(e.tab)}
                  />
                ))}
              </ScrollView>

              <View style={styles.cardListContainer}>
                {selectablePhaseCards.map((card, index) => {
                  const phase = getPhase(mockRevitalization, card.phase as string)
                  return (
                    <View
                      key={`roadmap-${index}`}
                      style={[styles.cardWrapper, { paddingTop: index === 0 ? 15 : 0 }]}
                    >
                      <Pressable
                        onPress={() => {
                          try {
                            if (
                              phase?.isSingleRoadmap &&
                              Array.isArray(phase.tasks) &&
                              phase.tasks.length === 1
                            ) {
                              router.push(`/roadmap/${phase.id}/${phase.tasks[0]}`, {
                                withAnchor: true,
                              })
                            } else {
                              router.push(`/roadmap/${phase.id}`, {
                                withAnchor: true,
                              })
                            }
                          } catch {
                            router.push(`/roadmap/${card.phase}` as any, {
                              withAnchor: true,
                            })
                          }
                        }}
                      >
                        <RoadmapCard data={{ ...card, phaseNumber: undefined }} />
                      </Pressable>
                    </View>
                  )
                })}
              </View>
            </View>

            <View style={styles.progressBlock}>
              <Text style={styles.progressBlockTitle}>Assessment Progress</Text>
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
                    setTabs={setAssessmentTabs}
                    onPress={() => setAssessmentTabs(e.tab)}
                  />
                ))}
              </ScrollView>

              <View style={styles.cardListContainer}>
                {filteredAssessments.map((e, i) => (
                  <View
                    key={`assessment-${i}`}
                    style={[styles.cardWrapper, { paddingTop: i === 0 ? 15 : 0 }]}
                  >
                    <ProgressAssessmentCard
                      onDevelopmentPlanPress={openPMPSheet}
                      data={e as any}
                    />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <PMPBottomSheet
            ref={pmpSheetRef}
            onClose={closePMPSheet}
            onNext={handleNext}
            onDownload={handleDownload}
          />
        </View>
      </LinearGradient>
    </>
  )
}
const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  headerContainer: { width: "100%", alignItems: "center" },
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
  cardWrapper: { width: "100%" },
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
})
