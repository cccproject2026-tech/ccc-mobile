import { AssessmentCard } from "@/components/build-components";
import PMPBottomSheet from "@/components/director/PMPBottomSheet";
import TopBar from "@/components/director/TopBar";
import {
  GradientBackground,
  RoadmapSearchField,
  RoadmapTabStrip,
  SectionHeader,
} from "@/components/ui/design-system";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useAssessmentMeetingMap } from "@/hooks/assessments/useAssessmentMeetingMap";
import { useAuthStore } from "@/stores";
import type { Assessment } from "@/types/assessment.types";
import { sharePdfFromHtml } from "@/utils/pdf";
import { getFontSize, getIconSize, getSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { appointments = [] } = useAppointments({ userId: user?.id });
  const { meetingMap } = useAssessmentMeetingMap(appointments);

  
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
  
  const pmpBottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  
  const [changeModeModalVisible, setChangeModeModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = React.useState("Zoom");
  
  const sections = useMemo(
    () => [
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
    ],
    [],
  );

  
  const handleRefresh = () => {
    refetch();
  };

  
  const searchedAssessments = useMemo(() => {
    if (!search.trim()) return assessments;

    const query = search.toLowerCase();
    return assessments.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [assessments, search]);

  
  const statusKeys = [
    { key: "Due", label: "Due" },
    { key: "Not Started", label: "Not Started" },
    { key: "Submitted", label: "Submitted" },
    { key: "Completed", label: "Completed" },
  ];

  
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

  
  const filteredAssessments = useMemo(() => {
    if (tabs === "All") return searchedAssessments;
    return searchedAssessments.filter((item) => item.status === tabs);
  }, [searchedAssessments, tabs]);

  

  const handleCardPress = (assessment: Assessment) => {
    router.push({
      pathname: "/assessments/survey-guidelines",
      params: { assessmentId: assessment.id },
    });
  };

  const handleViewResponse = (assessment: Assessment) => {
    router.push({
      pathname: "/assessments/answer-questions",
      params: {
        assessmentId: assessment.id,
        viewMode: "true",
      },
    });
  };

  const handleCustomizedPress = (assessment: Assessment) => {
    router.push({
      pathname: "/assessments/answer-questions",
      params: {
        assessmentId: assessment.id,
        viewMode: "true",
        openCdp: "true",
      },
    });
  };

  const handleMeetingPress = (assessment: Assessment) => {
    const meeting = meetingMap[assessment.id];
    if (!meeting?.appointmentId) return;
    router.push({
      pathname: "/appointments/meeting-details",
      params: { appointmentId: String(meeting.appointmentId) },
    });
  };

  const reportHtml = useMemo(() => {
    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const sectionsHtml = sections
      .map((section) => {
        const plansHtml = section.plans
          .map((p: any) => `<li>${escapeHtml(p.text)}</li>`)
          .join("");
        return `
          <div class="section">
            <h2>${escapeHtml(section.title)}</h2>
            <h3>Customized Development Plans</h3>
            <ul>${plansHtml}</ul>
          </div>
        `;
      })
      .join("");

    const userName = "John Ross";
    const completedDate = new Date().toLocaleDateString("en-GB");
    const assessmentTitle = selectedAssessment?.title || "Assessment";

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, system-ui, Segoe UI, Roboto, Arial; padding: 24px; color: #0f172a; }
            .header { text-align: center; margin-bottom: 18px; }
            .name { font-size: 22px; font-weight: 700; margin: 0; }
            .date { font-size: 13px; color: #475569; margin: 6px 0 0; }
            .survey { margin: 18px 0 22px; }
            .surveyLabel { font-size: 14px; font-weight: 600; margin: 0 0 6px; color: #1e3a8a; }
            .surveyValue { font-size: 16px; font-weight: 700; margin: 0; color: #1e3a8a; }
            .section { margin-bottom: 22px; }
            h2 { font-size: 16px; margin: 0 0 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; color: #1e3a8a; }
            h3 { font-size: 14px; margin: 0 0 10px; color: #1e3a8a; }
            ul { margin: 0; padding-left: 18px; }
            li { margin: 0 0 8px; line-height: 1.35; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="name">${escapeHtml(userName)}</p>
            <p class="date">Completed on: ${escapeHtml(completedDate)}</p>
          </div>
          <div class="survey">
            <p class="surveyLabel">Survey Name :</p>
            <p class="surveyValue">${escapeHtml(assessmentTitle)}</p>
          </div>
          ${sectionsHtml}
        </body>
      </html>
    `;
  }, [sections, selectedAssessment?.title]);

  const handleNextFromSheet = useCallback(() => {
    pmpBottomSheetRef.current?.dismiss();
    router.push({
      pathname: "/assessments/report",
      params: {
        assessmentId: selectedAssessment?.id || "",
        userName: "John Ross",
        completedDate: new Date().toLocaleDateString("en-GB"),
        assessmentTitle: selectedAssessment?.title || "Assessment",
      },
    });
  }, [selectedAssessment?.id, selectedAssessment?.title]);

  const handleDownload = useCallback(async () => {
    
    await sharePdfFromHtml({
      html: reportHtml,
      fileName: `${(selectedAssessment?.title || "Assessment").replaceAll(
        " ",
        "_",
      )}_Report.pdf`,
    });
  }, [reportHtml, selectedAssessment?.title]);

  const handleCloseSheet = () => {
    pmpBottomSheetRef.current?.dismiss();
  };

  const currentSectionData = sections[0];

  
  if (isLoading && !isRefetching) {
    return (
      <GradientBackground style={styles.centerContainer} decorativeOrbs>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading assessments...</Text>
      </GradientBackground>
    );
  }

  
  if (error && !assessments.length) {
    return (
      <GradientBackground style={styles.centerContainer} decorativeOrbs>
        <Ionicons name="alert-circle-outline" size={64} color="#fff" />
        <Text style={styles.errorText}>Failed to load assessments</Text>
        <Text style={styles.errorSubtext}>Pull down to retry</Text>
      </GradientBackground>
    );
  }

  const handleReschedule = (appointment: any) => {
    console.log("Reschedule appointment", appointment);
    
  };
  const handleChangeMode = (appointment: any) => {
    setChangeModeModalVisible(true);
  };

  return (
    <>
      <GradientBackground style={{ flex: 1 }} decorativeOrbs>
        <View style={styles.scrollContainer}>
          <TopBar role="pastor" showUserName />

          <View style={styles.heroHeader}>
            <View style={styles.pill}>
              <View style={styles.pillDots}>
                <View style={styles.pillDot} />
                <View style={styles.pillDotGold} />
              </View>
              <Text style={styles.pillText}>Center for Community Change</Text>
            </View>

            <SectionHeader
              title="Your assessments"
              subtitle="Review assigned assessments and track completion."
              showDivider
              variant="compact"
              showBackButton
              alwaysShowBack
              onBackPress={() => {
                if (navigation.canGoBack()) router.back();
                else router.replace("/(pastor)/(tabs)" as any);
              }}
              style={{ marginBottom: 0 }}
            />
          </View>

          <View style={styles.searchContainer}>
            <RoadmapSearchField value={search} onChangeText={setSearch} placeholder="Search assessments..." dense />
          </View>

          <View style={{ marginTop: 10 }}>
            <View style={styles.tabStripWrap}>
              <RoadmapTabStrip
                tabs={availableTabs.map((t) => ({
                  key: t.key,
                  label: t.label,
                  badge: "badge" in t ? t.badge : undefined,
                }))}
                activeKey={tabs}
                onChange={setTabs}
                scrollable
              />
            </View>
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
                      meetingInfo={meetingMap[assessment.id] ?? null}
                      onPress={() => handleCardPress(assessment)}
                      onMeetingPress={() => handleMeetingPress(assessment)}
                      onViewResponsePress={() => handleViewResponse(assessment)}
                      onCustomizedPress={() => handleCustomizedPress(assessment)}
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
                        
                        
                        
                        
                        
                        
                        
                        
                        
                        
                      ]}
                    />
                    <View style={styles.dividerWithMargin} />
                  </React.Fragment>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </GradientBackground>

      <PMPBottomSheet
        ref={pmpBottomSheetRef}
        title={selectedAssessment?.title || "Pastoral Ministry Profile (PMP)"}
        sectionTitle={currentSectionData?.title}
        levelText={`You are at ${currentSectionData?.level}!`}
        developmentPlans={currentSectionData?.plans}
        showPreviousButton={false}
        onNext={handleNextFromSheet}
        onDownload={handleDownload}
        onClose={handleCloseSheet}
        currentSection={1}
        totalSections={sections.length}
      />

      {}
      {}
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
  tabStripWrap: {
    paddingHorizontal: 16,
  },
  heroHeader: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: 8,
  },
  pillDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6FD4BE" },
  pillDotGold: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#E8C88A" },
  pillText: { color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: "700" },
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
