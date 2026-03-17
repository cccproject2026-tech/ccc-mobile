import { AssessmentCard } from "@/components/build-components";
import PMPBottomSheet from "@/components/director/PMPBottomSheet";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import type { Assessment } from "@/types/assessment.types";
import { getFontSize, getIconSize, getSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const meetingModes = ["Zoom", "Google Meet", "Teams", "Whatsapp", "Phone call"];
export default function Survey() {
  // CHANGED: Use assigned assessments instead of all assessments
  const {
    data: assessments,
    isLoading,
    error,
    refetch,
    isRefetching,
    assignedCount,
  } = useAssignedAssessments();

  const [search, setSearch] = useState("");
  const [tabs, setTabs] = useState("All");
  const { bottom } = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  // PMP Bottom Sheet state
  const pmpBottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  // change Mode Modal state
  const [changeModeModalVisible, setChangeModeModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = React.useState("Zoom");
  // Mock sections data
  const sections = [
    {
      title: "Section 1 - Personal Well-Being",
      level: "Level 1",
      plans: [
        { id: 1, text: "Schedule 1-on-1 with a mentor" },
        { id: 2, text: "Take trauma survey (via Claritysoft)" },
        { id: 3, text: "Identify areas of stress/anxiety" },
        { id: 4, text: "Family Wellbeing survey" },
        { id: 5, text: "Collaborate on a healing plan" },
        { id: 6, text: "Collaborate on a physical Exercise plan" },
        { id: 7, text: "Establish a prayer covenant/partnership" },
        { id: 8, text: "Finalize a growth plan" },
      ],
    },
    {
      title: "Section 2 - Professional Development/Leadership style",
      level: "Level 1",
      plans: [
        { id: 1, text: "Schedule 1-on-1 with a mentor" },
        { id: 2, text: "Take trauma survey (via Claritysoft)" },
        { id: 3, text: "Identify areas of stress/anxiety" },
        { id: 4, text: "Family Wellbeing survey" },
        { id: 5, text: "Collaborate on a healing plan" },
        { id: 6, text: "Collaborate on a physical Exercise plan" },
        { id: 7, text: "Establish a prayer covenant/partnership" },
        { id: 8, text: "Finalize a growth plan" },
      ],
    },
  ];

  // Handle pull to refresh
  const handleRefresh = () => {
    refetch();
  };

  // Apply search filter
  const searchedAssessments = useMemo(() => {
    if (!search.trim()) return assessments;

    const query = search.toLowerCase();
    return assessments.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [assessments, search]);

  // Status keys for tabs
  const statusKeys = [
    { key: "Due", label: "Due" },
    { key: "Not Started", label: "Not Started" },
    { key: "Submitted", label: "Submitted" },
    { key: "Completed", label: "Completed" },
  ];

  // Calculate available tabs with counts
  const availableTabs = useMemo(() => {
    return [
      { key: "All", label: "All", badge: assignedCount },
      ...statusKeys.map((tab) => {
        const count = searchedAssessments.filter(
          (item) => item.status === tab.label,
        ).length;
        return count > 0 ? { ...tab, badge: count } : tab;
      }),
    ];
  }, [searchedAssessments, assignedCount]);

  // Filter by selected tab
  const filteredAssessments = useMemo(() => {
    if (tabs === "All") return searchedAssessments;
    return searchedAssessments.filter((item) => item.status === tabs);
  }, [searchedAssessments, tabs]);

  // ... rest of your handlers remain the same ...

  const handleCardPress = (assessment: Assessment) => {
    router.push({
      pathname: "/assessments/survey-guidelines",
      params: { assessmentId: assessment.id },
    });
  };

  const handleCustomizedPress = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentSection(0);
    pmpBottomSheetRef.current?.present();
  };

  const handleNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection((prev) => prev + 1);
    } else {
      pmpBottomSheetRef.current?.dismiss();
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  const handleDownload = () => {
    pmpBottomSheetRef.current?.dismiss();
    router.push({
      pathname: "/assessments/report",
      params: {
        assessmentId: selectedAssessment?.id || "",
        userName: "John Ross",
        completedDate: new Date().toLocaleDateString("en-GB"),
      },
    });
  };

  const handleCloseSheet = () => {
    pmpBottomSheetRef.current?.dismiss();
  };

  const currentSectionData = sections[currentSection];

  // Loading state (initial load only)
  if (isLoading && !isRefetching) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.centerContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading assessments...</Text>
      </LinearGradient>
    );
  }

  // Error state
  if (error && !assessments.length) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.centerContainer}
      >
        <Ionicons name="alert-circle-outline" size={64} color="#fff" />
        <Text style={styles.errorText}>Failed to load assessments</Text>
        <Text style={styles.errorSubtext}>Pull down to retry</Text>
      </LinearGradient>
    );
  }

  const handleReschedule = (appointment: any) => {
    console.log("Reschedule appointment", appointment);
    // Navigate to reschedule screen
  };
  const handleChangeMode = (appointment: any) => {
    setChangeModeModalVisible(true);
  };

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <View style={styles.scrollContainer}>
          <TopBar role="pastor" showUserName />

          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={getIconSize(28)}
                color="#fff"
              />
              <Text style={styles.headerTitle}>Assessment</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <SearchBar value={search} onChangeValue={setSearch} />
          </View>

          <View style={{ marginTop: 10 }}>
            <TabSwitcher
              tabs={availableTabs}
              activeTab={tabs}
              onChange={setTabs}
            />
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottom + 20,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor="#fff"
                colors={["#fff"]}
                progressBackgroundColor="rgba(255,255,255,0.2)"
                title="Pull to refresh"
                titleColor="#fff"
              />
            }
          >
            <View style={{ paddingHorizontal: 16, width: "100%" }}>
              {filteredAssessments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-text-outline"
                    size={64}
                    color="rgba(255,255,255,0.3)"
                  />
                  <Text style={styles.emptyText}>
                    {assignedCount === 0
                      ? "No assessments assigned"
                      : "No assessments found"}
                  </Text>
                  <Text style={styles.emptySubtext}>
                    {search
                      ? "Try adjusting your search"
                      : assignedCount === 0
                        ? "Contact your director to assign assessments"
                        : "Pull down to refresh"}
                  </Text>
                </View>
              ) : (
                filteredAssessments.map((assessment) => (
                  <React.Fragment key={assessment.id}>
                    <AssessmentCard
                      data={assessment}
                      onPress={() => handleCardPress(assessment)}
                      menuItems={[
                        {
                          key: "reschedule",
                          title: "Reschedule Meeting",
                          icon: {
                            ios: "calendar.badge.clock",
                            android: "ic_event_available",
                          },
                          onSelect: () => handleReschedule(assessment),
                        },
                        {
                          key: "change_mode",
                          title: "Change Mode",
                          icon: {
                            ios: "arrow.2.circlepath",
                            android: "ic_sync",
                          },
                          onSelect: () => handleChangeMode(assessment),
                        },
                        // {
                        //   key: "cancel",
                        //   title: "Cancel Meeting",
                        //   destructive: true,
                        //   icon: {
                        //     ios: "trash",
                        //     android: "ic_menu_delete",
                        //   },
                        //    onSelect: () => handleCancel(assessment),
                        // },
                      ]}
                    />
                    <View style={styles.dividerWithMargin} />
                  </React.Fragment>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      <PMPBottomSheet
        ref={pmpBottomSheetRef}
        title={selectedAssessment?.title || "Pastoral Ministry Profile (PMP)"}
        sectionTitle={currentSectionData?.title}
        levelText={`You are at ${currentSectionData?.level}!`}
        developmentPlans={currentSectionData?.plans}
        showPreviousButton={currentSection > 0}
        onPrevious={handlePreviousSection}
        onNext={handleNextSection}
        onDownload={handleDownload}
        onClose={handleCloseSheet}
        currentSection={currentSection + 1}
        totalSections={sections.length}
      />

      {/* {changeMeetingMode} */}
      {/* <AssessmentMeetingOptionModal
        isModalVisible={isModalVisible}
        setVisisible={(val: boolean) => setIsModalVisible(val)}
      /> */}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getSpacing(16),
    paddingBottom: getSpacing(12),
    marginVertical: getSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: getSpacing(8),
    fontSize: getFontSize(18),
    fontWeight: "600",
    color: "#fff",
  },
  dividerWithMargin: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: getFontSize(16),
    marginTop: 16,
  },
  errorText: {
    color: "#fff",
    fontSize: getFontSize(18),
    fontWeight: "600",
    marginTop: 16,
  },
  errorSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: getFontSize(14),
    marginTop: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#fff",
    fontSize: getFontSize(18),
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: getFontSize(14),
    marginTop: 8,
    textAlign: "center",
  },
});
