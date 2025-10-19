import { ProgressCard } from "@/components/atom/cards";
import { Tab } from "@/components/atom/tab";
import { Header } from "@/components/build-components";
import { ChartData, ProgressBarChart } from "@/components/director/ProgressBarChart";
import { ProgressPieChart } from "@/components/director/ProgressPieChart";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgressScreen() {
  const [roadmapTabs, setRoadmapTabs] = React.useState("All");
  const [assessmentTabs, setAssessmentTabs] = React.useState("All");
  const [showCompleted, setShowCompleted] = React.useState(false);

  const [progress, setProgress] = React.useState<{ completedPercentage: number; remainingPercentage: number }>({
    completedPercentage: 62.5,
    remainingPercentage: 37.5,
  });

  const dummyRoadMaps = [
    {
      title: "Self Revitalization Phase",
      time: "Completion Time Months 1 - 2",
      status: "Due",
      image: require("@/assets/images/jumpstart.png"),
      progress: "1",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      title: "Church Empowerment Phase",
      time: "Completion Time Months 3 - 9",
      status: "In Progress",
      image: require("@/assets/images/roadmap.jpg"),
      progress: "1",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      title: " Community Revitalization and Multiplication Phase",
      time: "Completion Time Months 3 - 9",
      type: "assignment",
      read: true,
      status: "Not Started Yet",
      image: require("@/assets/images/roadmap.jpg"),
      progress: "0",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      title: "Jump-start",
      description: "Interested in receiving mentoring in community engagement",
      time: "Completion Time Months 3 - 9",
      type: "assignment",
      read: true,
      status: "Completed",
      image: require("@/assets/images/roadmap.jpg"),
      progress: "0",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
      completedTime: "20 Oct 2024",
    },
  ];

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

  const filteredRoadMaps = dummyRoadMaps.filter((item) => {
    if (roadmapTabs === "All") {
      return true;
    } else if (roadmapTabs === "Completed") {
      return item.status === "Completed";
    } else {
      return item.status !== "Completed";
    }
  });

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
            <Header title="My Progress" showSettings={false} hideSearchBar={true} />

            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !showCompleted && styles.toggleButtonActive,
                  styles.toggleButtonLeft,
                ]}
                onPress={() => handleSwitchProgress('inprogress')}
              >
                <Text style={[
                  styles.toggleButtonText,
                  !showCompleted && styles.toggleButtonTextActive
                ]}>
                  Inprogress
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  showCompleted && styles.toggleButtonActive,
                  styles.toggleButtonRight,
                ]}
                onPress={() => handleSwitchProgress('completed')}
              >
                <Text style={[
                  styles.toggleButtonText,
                  showCompleted && styles.toggleButtonTextActive
                ]}>
                  Completed
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pie Chart Section */}
            <ProgressPieChart
              data={progress}
              title="Overall Progress - Roadmaps & Assessments"
            />

            {/* Bar Chart Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{currentTitle}</Text>

              <View style={styles.chartWrapper}>
                <ProgressBarChart
                  data={currentData}
                  showRemaining={!showCompleted}
                />
              </View>
            </View>

            <View
              className="flex flex-col gap-5 mt-5"
              style={{ marginTop: 20 }}
            >
              <Text
                className="px-4 text-white"
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
                    className="flex-1 w-full "
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
                className="px-4 text-white"
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
                    className="flex-1 w-full "
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
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  separator: {
    height: 20,
    backgroundColor: "transparent",
    marginVertical: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
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
  toggleButtonActive: {
    backgroundColor: "#ffffff",
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  toggleButtonRight: {
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.7)",
  },
  toggleButtonTextActive: {
    color: "#1535A8",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
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
});
