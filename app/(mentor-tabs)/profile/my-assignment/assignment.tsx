import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Tab } from "@/components/atom/tab";
import { RoadmapCard as AssignmentCard, Header } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Assignment() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  const dummyRoadMaps = [
    {
      title: "Prayer and Visitation Strategy",
      assignment: true,
      description: "Finalize the teams vision for the church",
      time: "Completion Time Months 1 - 2",
      type: "course",
      read: false,
      sessionDate: "10 / 11 / 24",
      status: "Not Started Yet",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
    },
    {
      assignment: true,
      title: "Calendar",
      description:
        "Finalize a vision team meeting schedule through the end of the year ",
      type: "note",
      time: "Completion Time Months 1 - 2",
      read: false,
      subPhase: true,
      status: "Not Started Yet",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 8,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
    },
    {
      assignment: true,
      title: "Prayer",
      description:
        " Prioritize church prayer times and meet consistently for prayer with your congregation",
      time: "Completion Time Months 10 - 12",
      type: "profile",
      read: true,
      status: "Not Started Yet",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
    },
    {
      assignment: true,
      title: "Mentoring Conversations",
      description: "Schedule two mentoring conversations with your mentor",
      time: "Completion Time Months 3 - 9",
      showBothDate: true,
      sessionDate: "10 / 11 / 24",
      type: "assignment",
      read: true,
      status: "Not Started Yet",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 18,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
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
        <SafeAreaView className="flex-1">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader />

            {}
            <Header title="Assignments" showSettings={false} />

            {}
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

            {}
            <View
              style={{
                marginVertical: 10,
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              {filteredRoadMaps.map((e, i) => (
                <React.Fragment key={i}>
                  <AssignmentCard data={e} navigation={router} />
                  {i < filteredRoadMaps.length - 1 && (
                    <View className="h-[0.5px] bg-white/30 my-4" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>

        {}
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
        />
      </LinearGradient>
    </>
  );
}

