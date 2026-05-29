import { ReviewPastorRow } from "@/components/mentor/review-center/ReviewPastorRow";
import { useNavigationBack } from "@/hooks/navigation/useNavigationBack";
import { useReviewCenterV2 } from "@/hooks/mentors/useReviewCenterV2";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MentorReviewCenterDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pastorGroups, pendingActionCount, isLoading } = useReviewCenterV2();
  const { handleBack } = useNavigationBack("/(mentor)/(tabs)" as const);

  const openPastor = useCallback(
    (pastorId: string, pastorName: string) => {
      router.push({
        pathname: "/(mentor)/(tabs)/review-center/pastor",
        params: { pastorId, pastorName },
      });
    },
    [router],
  );

  if (isLoading) {
    return (
      <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.root}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Review Center...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="file-tray-full-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Review Center</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {pendingActionCount > 0
              ? `${pendingActionCount} item${pendingActionCount === 1 ? "" : "s"} need your attention`
              : "Select a pastor to review their activity"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {pastorGroups.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color="rgba(255,255,255,0.35)" />
            <Text style={styles.emptyTitle}>No mentees yet</Text>
            <Text style={styles.emptyText}>
              Assigned pastors will appear here with their roadmap and assessment status.
            </Text>
          </View>
        ) : (
          <Animated.View entering={FadeInUp.delay(50).springify()}>
            <Text style={styles.sectionLabel}>Your pastors</Text>
            <View style={styles.pastorList}>
              {pastorGroups.map((group, index) => (
                <Animated.View
                  key={group.pastorId}
                  entering={FadeInUp.delay(80 + index * 40).springify()}
                >
                  <ReviewPastorRow
                    group={group}
                    onPress={() => openPastor(group.pastorId, group.pastorName)}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pastorList: {
    gap: 12,
    marginTop: 10,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
