import { AssessmentCard } from "@/components/atom/cards";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Tab } from "@/components/atom/tab";
import { Header } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Survey() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  const dummyRoadMaps = [
    {
      title: "Church Assessment Evaluation(CMA)",
      description: "Review the overall health of your church",
      type: "CMA",
      status: "Due",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      title: "Pastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Not Started",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 8,
        completed: false,
      },
    },
    {
      title: "Church Empowerment PhasePastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Submitted",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 18,
        completed: false,
      },
    },
    {
      title: "Church Assessment Evaluation(CMA)",
      description: "Review the overall health of your church ",
      type: "CMA",
      status: "Completed",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      title: "Pastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Completed",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
  ];

  const availableTabs = [
    { tab: "All" },
    { tab: "Due" },
    { tab: "Not Started" },
    { tab: "In Progress" },
    { tab: "Completed" },
    { tab: "Overdue" },
    { tab: "Pending Review" },
    { tab: "On Hold" },
  ];

  const filteredRoadMaps = dummyRoadMaps.filter((item) => {
    if (tabs === "All") return true;
    return item.status === tabs;
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
            <PastorNavigationHeader />

            {/* Header Section */}
            <Header title="Assessment" />

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
                  tabs={tabs}
                  setTabs={setTabs}
                  onPress={() => {
                    setTabs(e.tab);
                  }}
                />
              ))}
            </ScrollView>

            {/* Content Section */}
            <View
              style={{
                marginVertical: 10,
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              {filteredRoadMaps.map((e, i) => (
                <React.Fragment key={i}>
                  <AssessmentCard data={e} navigation={router} />
                  {i < filteredRoadMaps.length - 1 && (
                    <View className="h-[0.5px] bg-white/30 my-4" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Modal */}
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
        />
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
