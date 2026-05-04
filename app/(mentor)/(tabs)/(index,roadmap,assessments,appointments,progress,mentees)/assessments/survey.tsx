import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { AssessmentCard } from "@/components/build-components";
import TopBar from "@/components/director/TopBar";
import {
  GradientBackground,
  RoadmapSearchField,
  RoadmapTabStrip,
  SectionHeader,
} from "@/components/ui/design-system";
import { router, Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Survey() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  const dummyRoadMaps = [
    {
      id: '1',
      title: "Church Assessment Evaluation(CMA)",
      description: "Review the overall health of your church",
      type: "CMA",
      status: "Due",
      completionDate: "20 Oct 2024",
      guidelines: [],
      sections: [],
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      id: '2',
      title: "Pastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Not Started",
      completionDate: "20 Oct 2024",
      guidelines: [],
      sections: [],
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 8,
        completed: false,
      },
    },
    {
      id: '3',
      title: "Church Empowerment PhasePastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Submitted",
      completionDate: "20 Oct 2024",
      guidelines: [],
      sections: [],
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 18,
        completed: false,
      },
    },
    {
      id: '4',
      title: "Church Assessment Evaluation(CMA)",
      description: "Review the overall health of your church ",
      type: "CMA",
      status: "Completed",
      completionDate: "20 Oct 2024",
      guidelines: [],
      sections: [],
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      id: '5',
      title: "Pastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Completed",
      completionDate: "20 Oct 2024",
      guidelines: [],
      sections: [],
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

  const searchedRoadMaps = dummyRoadMaps.filter((item) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const filteredRoadMaps = searchedRoadMaps.filter((item) => {
    if (tabs === "All") return true;
    return item.status === tabs;
  });

  return (
    <>
      <GradientBackground decorativeOrbs>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <TopBar role="mentor" showUserName />

            <View style={styles.heroHeader}>
              <View style={styles.pill}>
                <View style={styles.pillDots}>
                  <View style={styles.pillDot} />
                  <View style={styles.pillDotGold} />
                </View>
                <Text style={styles.pillText} numberOfLines={1}>
                  Center for Community Change
                </Text>
              </View>
              <SectionHeader
                title="Your assessments"
                subtitle="Review assigned assessments and track completion."
                showDivider
                style={{ marginBottom: 0 }}
              />
            </View>

            <View style={styles.searchContainer}>
              <RoadmapSearchField
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search assessments..."
              />
            </View>

            <View style={styles.tabStripWrap}>
              <RoadmapTabStrip
                tabs={availableTabs.map((t) => ({ key: t.tab, label: t.tab }))}
                activeKey={tabs}
                onChange={setTabs}
                scrollable
              />
            </View>

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
                  <AssessmentCard 
                    data={e as any} 
                    onPress={(data) => {
                      if (data.type === 'CMA') {
                        router.push({
                          pathname: "/(mentor)/assessments/cma-survey-page" as any,
                          params: { data: JSON.stringify(data) }
                        });
                      } else {
                        router.push({
                          pathname: "/(mentor)/assessments/(pmp)/pmp-survey-page" as any,
                          params: { data: JSON.stringify(data) }
                        });
                      }
                    }} 
                  />
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
      </GradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  tabStripWrap: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  heroHeader: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
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
    marginBottom: 12,
  },
  pillDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6FD4BE" },
  pillDotGold: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E8C88A" },
  pillText: { color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: "700" },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
});
