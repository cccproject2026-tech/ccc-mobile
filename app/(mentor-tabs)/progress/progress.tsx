import { ProgressCard } from "@/components/atom/cards";
import CustomBarChart from "@/components/atom/CustomBarChart";
import CustomPieChart from "@/components/atom/CustomPieChart";
import { Tab } from "@/components/atom/tab";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { SectionHeader } from "@/components/ui/design-system";
import { icons } from "@/constants/images";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useProgress } from "@/hooks/progress/useProgress";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { mapApiToFrontend } from "@/lib/assessments/mappers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Stack, router } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgressScreen() {
  const [roadmapTabs, setRoadmapTabs] = React.useState("All");
  const [assessmentTabs, setAssessmentTabs] = React.useState("All");

  // Fetch progress data for the current user
  const { data: progressData, isLoading: isLoadingProgress } = useProgress();

  // Fetch all roadmaps
  const { data: allRoadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();

  // Fetch all assessments
  const { data: allAssessments, isLoading: isLoadingAssessments } = useAssessments();

  // Get assigned roadmap IDs from progress
  const assignedRoadmapIds = useMemo(() => {
    return progressData?.roadmaps.items.map((item) => item.roadMapId) || [];
  }, [progressData]);

  // Get assigned assessment IDs from progress
  const assignedAssessmentIds = useMemo(() => {
    return progressData?.assessments.items.map((item) => item.assessmentId) || [];
  }, [progressData]);

  // Format roadmaps for ProgressCard
  const roadmapsData = useMemo(() => {
    if (!allRoadmaps || !progressData) return [];

    // Filter to only assigned roadmaps
    const assignedRoadmaps = allRoadmaps.filter((roadmap) =>
      assignedRoadmapIds.includes(roadmap._id)
    );

    // Create a map of progress data
    const progressMap = new Map();
    progressData.roadmaps.items.forEach((item) => {
      progressMap.set(item.roadMapId, item);
    });

    return assignedRoadmaps.map((roadmap) => {
      const progress = progressMap.get(roadmap._id);
      const roadmapCard = getRoadmapCard(roadmap);

      // Map status to ProgressCard format
      let status: 'Due' | 'In Progress' | 'Not Started Yet' | 'Completed' = 'Not Started Yet';
      if (roadmapCard.status === 'completed') {
        status = 'Completed';
      } else if (roadmapCard.status === 'due') {
        status = 'Due';
      } else if (roadmapCard.status === 'in-progress') {
        status = 'In Progress';
      }

      // Calculate task status
      const taskStatus = {
        notStarted: roadmapCard.status === 'initial',
        started: roadmapCard.status !== 'initial',
        inProgress: roadmapCard.taskProgress?.completed || 0,
        toComplete: roadmapCard.taskProgress?.total || 0,
        completed: roadmapCard.status === 'completed',
      };

      return {
        title: roadmapCard.title,
        description: roadmapCard.description,
        time: roadmapCard.completionTime,
        status,
        image: roadmapCard.image ? { uri: roadmapCard.image } : require("@/assets/images/jumpstart.png"),
        progress: taskStatus.toComplete > 0 ? "1" : "0",
        taskStatus,
        completedTime: roadmapCard.completedDate,
        type: "roadmap" as const,
        dueDate: progress?.endDate,
      };
    });
  }, [allRoadmaps, progressData, assignedRoadmapIds]);

  // Format assessments for ProgressCard
  const assessmentsData = useMemo(() => {
    if (!allAssessments || !progressData) return [];

    // Filter to only assigned assessments
    const assignedAssessments = allAssessments.filter((assessment) =>
      assignedAssessmentIds.includes(assessment._id)
    );

    // Create a map of progress data
    const progressMap = new Map();
    progressData.assessments.items.forEach((item) => {
      progressMap.set(item.assessmentId, item);
    });

    return assignedAssessments.map((apiAssessment) => {
      const assessment = mapApiToFrontend(apiAssessment);
      const progress = progressMap.get(apiAssessment._id);

      // Map status to ProgressCard format
      let status: 'Due' | 'Completed' | 'due' = 'Due';
      if (assessment.status === 'Completed') {
        status = 'Completed';
      } else if (assessment.status === 'Due') {
        status = 'Due';
      }

      // Calculate task status (using progress data if available)
      const taskStatus = {
        notStarted: assessment.status === 'Not Started',
        started: assessment.status !== 'Not Started',
        inProgress: progress?.completedSections || 0,
        toComplete: progress?.totalSections || 0,
        completed: assessment.status === 'Completed',
      };

      return {
        title: assessment.title,
        description: assessment.description,
        image: icons.Assessments,
        progress: taskStatus.toComplete > 0 ? "1" : "0",
        taskStatus,
        dueDate: progress?.dueDate,
        submittedDate: assessment.status === 'Completed' ? assessment.completedOn : undefined,
        status,
        type: "assessment" as const,
        completed: assessment.completedOn,
      };
    });
  }, [allAssessments, progressData, assignedAssessmentIds]);

  const availableTabs = [
    { tab: "All" },
    { tab: "Completed" },
    { tab: "Remaining" },
  ];

  const filteredRoadMaps = roadmapsData.filter((item) => {
    if (roadmapTabs === "All") {
      return true;
    } else if (roadmapTabs === "Completed") {
      return item.status === "Completed";
    } else {
      return item.status !== "Completed";
    }
  });

  const filteredAssessments = assessmentsData.filter((item) => {
    if (assessmentTabs === "All") {
      return true;
    } else if (assessmentTabs === "Completed") {
      return item.status === "Completed";
    } else {
      return item.status !== "Completed";
    }
  });

  const isLoading = isLoadingProgress || isLoadingRoadmaps || isLoadingAssessments;

  if (isLoading) {
    return (
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: "white", fontSize: 18, marginTop: 16 }}>Loading progress...</Text>
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

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
            <SectionHeader
              title="My Progress"
              subtitle="Overall Progress — Roadmap & Assessments"
              showBackButton
            />

            <View
              style={{
                width: "95%",
                borderWidth: 1,
                borderColor: "white",
                //   backgroundColor: "red",
                paddingVertical: 20,
                paddingHorizontal: 10,
                borderRadius: 10,
                flexDirection: "row",
                gap: 20,
                justifyContent: "space-evenly",
                marginHorizontal: "auto",
              }}
            >
              <View style={{ width: 150 }}>
                <CustomPieChart />
              </View>
              <View
                style={{
                  flexDirection: "column",
                  gap: 20,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    Completed
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#d9d9d9",
                      borderRadius: 5,
                    }}
                  ></View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    Remaining
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingVertical: 10,
                marginHorizontal: 15,
                marginTop: 24,
              }}
            >
              <Text style={{ color: "white", fontSize: 17, fontWeight: "500" }}>
                Individual - Roadmap ,Assessments
              </Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 10,
                marginHorizontal: 16,
                // marginTop: 16,
                paddingVertical: 10,
                // width:"100%"
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  justifyContent: "flex-end",
                  paddingVertical: 10,
                  paddingRight: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#183476",
                      borderRadius: 5,
                    }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "500",
                    }}
                  >
                    Total
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#1535A8",
                      borderRadius: 5,
                    }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "500",
                    }}
                  >
                    Completed
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#118FBA",
                      borderRadius: 5,
                    }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "500",
                    }}
                  >
                    Remaining
                  </Text>
                </View>
              </View>
              <CustomBarChart />
            </View>

            <View
              className="flex flex-col gap-5 mt-5"
              style={{ marginTop: 20 }}
            >
              <Text
                className="text-white px-4"
                style={{ fontWeight: 600, fontSize: 16 }}
              >
                Revitalization Roadmap Progress
              </Text>
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
                {availableTabs.map((e, i) => (
                  <Tab
                    key={i}
                    data={e}
                    tabs={roadmapTabs}
                    setTabs={setRoadmapTabs}
                    onPress={() => {
                      setRoadmapTabs(e.tab);
                    }}
                    className=" flex-1 w-full"
                  />
                ))}
              </ScrollView>

              <View
                style={{
                  marginVertical: 10,
                  paddingHorizontal: 16,
                  width: "100%",
                }}
              >
                {filteredRoadMaps.map((e, i) => (
                  <React.Fragment key={i}>
                    <ProgressCard data={e} navigation={router} />
                    {i < filteredRoadMaps.length - 1 && (
                      <View className="h-[0.5px] bg-white/30 my-4" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Assessment Progress */}
            <View
              className="flex flex-col gap-5 mt-5"
              style={{ marginTop: 20 }}
            >
              <Text
                className="text-white px-4"
                style={{ fontWeight: 600, fontSize: 16 }}
              >
                Assessment Progress
              </Text>
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
                {availableTabs.map((e, i) => (
                  <Tab
                    key={i}
                    data={e}
                    tabs={assessmentTabs}
                    setTabs={setAssessmentTabs}
                    onPress={() => {
                      setAssessmentTabs(e.tab);
                    }}
                    className=" flex-1 w-full"
                  />
                ))}
              </ScrollView>
              <View
                style={{
                  marginVertical: 10,
                  paddingHorizontal: 16,
                  width: "100%",
                }}
              >
                {filteredAssessments.map((e, i) => (
                  <React.Fragment key={i}>
                    <ProgressCard data={e} navigation={router} />
                    {i < filteredAssessments.length - 1 && (
                      <View className="h-[0.5px] bg-white/30 my-4" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
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
