import { RevitalizationCard } from "@/components/atom/cards";
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

export default function EmpowermentCards() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  const dummyRoadMaps = [
    {
      title: "God's Vision Team",
      empowerment: true,
      description: "Finalize the teams vision for the church",
      time: "Completion Time Months 1 - 2",
      type: "course",
      read: false,
      status: "Not Started",
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
      title: "Calendar",
      description:
        "Finalize a vision team meeting schedule through the end of the year   ",
      empowerment: true,
      time: "Completion Time Months 1 - 2",
      type: "note",
      read: false,
      subPhase: true,
      status: "Not Started",
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
      title: "Prayer",
      description:
        "Prioritize church prayer times and meet consistently for prayer with your congregation",
      empowerment: true,
      time: "Completion Time Months 3 - 9",
      type: "assignment",
      read: true,
      status: "Not Started",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 18,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
    },
    {
      title: "Mentoring Conversations",
      description: "Schedule two mentoring conversations with your mentor",
      empowerment: true,
      showBothDate: true,
      sessionDate: "10 / 11 / 24",
      time: "Completion Time Months 10 - 12",
      type: "profile",
      read: true,
      status: "Not Started",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
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
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader showNameTag={true} wrapperClass="mt-5" />

            {}
            <Header
              title="Church Empowerment Phase"
              subTitle="Revitalization Roadmap"
            />

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
                  <RevitalizationCard data={e} navigation={router} />
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
