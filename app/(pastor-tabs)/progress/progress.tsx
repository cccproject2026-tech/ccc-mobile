import { ProgressCard } from "@/components/atom/cards";
import CustomBarChart from "@/components/atom/CustomBarChart";
import CustomPieChart from "@/components/atom/CustomPieChart";
import { Tab } from "@/components/atom/tab";
import { Header } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProgressScreen() {
  const [roadmapTabs, setRoadmapTabs] = React.useState("All");
  const [assessmentTabs, setAssessmentTabs] = React.useState("All");

  const dummyRoadMaps = [
    {
      title: "Self Revitalizaiton Phase",
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

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                // paddingVertical: 10,
                paddingBottom: 10,
                marginHorizontal: 15,
                marginVertical: 10
              }}
            >
              <Text style={{ color: "white", fontSize: 17, fontWeight: "500" }}>
                Overall Progress - Roadmap & Assessments
              </Text>
            </View>
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
                  <LinearGradient
                    colors={["#183476", "#FFFFFF"]}
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></LinearGradient>
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
                  <LinearGradient
                    colors={["#1535A8", "#FFFFFF"]}
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></LinearGradient>
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
                  <LinearGradient
                    colors={["#118FBA", "#FFFFFF"]}
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></LinearGradient>
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
    marginTop: 16,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
});
