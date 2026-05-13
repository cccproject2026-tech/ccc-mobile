import { AssessmentCard } from "@/components/build-components";
import TopBar from "@/components/director/TopBar";
import {
  GradientBackground,
  RoadmapSearchField,
  RoadmapTabStrip,
  SectionHeader,
} from "@/components/ui/design-system";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import type { Assessment } from "@/types/assessment.types";
import { getFontSize } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Survey() {
  const navigation = useNavigation();
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
    const params = { assessmentId: assessment.id };
    if (assessment.type === "CMA") {
      router.push({
        pathname: "/(mentor-tabs)/assessments/cma-survey-page" as any,
        params,
      });
    } else {
      router.push({
        pathname: "/(mentor-tabs)/assessments/(pmp)/pmp-survey-page" as any,
        params,
      });
    }
  };

  if (isLoading && !isRefetching) {
    return (
      <GradientBackground style={styles.centerContainer} decorativeOrbs>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading assessments...</Text>
      </GradientBackground>
    );
  }

  if (error && !assessments.length) {
    return (
      <GradientBackground style={styles.centerContainer} decorativeOrbs>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={64} color="#fff" />
        <Text style={styles.errorText}>Failed to load assessments</Text>
        <Text style={styles.errorSubtext}>Pull down to retry</Text>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground decorativeOrbs>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.scrollContainer}>
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
            variant="compact"
            showBackButton
            alwaysShowBack
            onBackPress={() => {
              if (navigation.canGoBack()) router.back();
              else router.replace("/(mentor-tabs)/(tabs)" as any);
            }}
            style={{ marginBottom: 0 }}
          />
        </View>

        <View style={styles.searchContainer}>
          <RoadmapSearchField
            value={search}
            onChangeText={setSearch}
            placeholder="Search assessments..."
          />
        </View>

          <View style={{ marginTop: 12 }}>
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
                    onPress={() => handleCardPress(assessment)}
                  />
                  <View style={styles.dividerWithMargin} />
                </React.Fragment>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
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
    marginTop: 14,
    marginBottom: 12,
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
  pillDotGold: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E8C88A",
  },
  pillText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "700",
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

