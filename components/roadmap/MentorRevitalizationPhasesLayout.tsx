import { RevitalizationCard } from "@/components/atom/cards";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import TopBar from "@/components/director/TopBar";
import {
  GradientBackground,
  RoadmapNavRow,
  RoadmapSearchField,
  RoadmapTabStrip,
  SectionHeader,
} from "@/components/ui/design-system/index";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

/**
 * Shared UI for mentor phase-1 / phase-2 revitalization placeholder routes.
 * Business logic and dummy content unchanged from legacy screens.
 */
export default function MentorRevitalizationPhasesLayout() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  const dummyRoadMaps = [
    {
      title: "Self Revitalization Phase",
      description:
        "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
      time: "Completion Time Months 1 - 2",
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
      title: "Church Empowerment Phase",
      description:
        "Create community to empower your church and make a long-term impact on coordinated community service programs.",
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
      title: "Community Revitalization and Multiplication Phase",
      description:
        "Review community service outcomes and empower others as you explore opportunities for further growth.",
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
    { key: "All", label: "All" },
    { key: "Due", label: "Due" },
    { key: "Not Started", label: "Not Started" },
    { key: "In Progress", label: "In Progress" },
    { key: "Completed", label: "Completed" },
    { key: "Overdue", label: "Overdue" },
    { key: "Pending Review", label: "Pending Review" },
    { key: "On Hold", label: "On Hold" },
  ];

  const filteredRoadMaps = dummyRoadMaps.filter((item) => {
    if (tabs === "All") return true;
    return item.status === tabs;
  });

  return (
    <GradientBackground decorativeOrbs>
      <TopBar role="mentor" showUserName />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pad}>
          <RoadmapNavRow
            onBack={() => router.back()}
            pillLabel="Revitalization Roadmap"
            rightSlot={
              <Pressable onPress={() => setIsRoadmapModalVisible(true)} hitSlop={10} style={styles.iconGhost}>
                <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.92)" />
              </Pressable>
            }
          />

          <SectionHeader
            title="Phase overview"
            subtitle="Review revitalization phases and track status."
            showDivider
          />

          <RoadmapSearchField
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search phases..."
          />

          <RoadmapTabStrip
            tabs={availableTabs}
            activeKey={tabs}
            onChange={(k) => setTabs(k)}
            scrollable
          />

          <View style={styles.cardList}>
            {filteredRoadMaps.map((e, i) => (
              <RevitalizationCard key={i} data={e} navigation={router} />
            ))}
          </View>
        </View>
      </ScrollView>

      <RoadMapOutcomeModal
        isMenuVisible={isRoadmapModalVisible}
        closeMenu={() => setIsRoadmapModalVisible(false)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  pad: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  iconGhost: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cardList: {
    gap: 12,
    marginTop: 4,
    paddingBottom: 8,
  },
});
