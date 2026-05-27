import {
  DASHBOARD_BUCKET_ORDER,
  ReviewDashboardCard,
} from "@/components/mentor/review-center/ReviewDashboardCard";
import { useReviewCenterV2 } from "@/hooks/mentors/useReviewCenterV2";
import type { ReviewDashboardBucket } from "@/lib/mentor/reviewCenter.types";
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
  const { dashboardCounts, pendingActionCount, isLoading } = useReviewCenterV2();

  const openBucket = useCallback(
    (bucket: ReviewDashboardBucket) => {
      router.push({
        pathname: "/(mentor)/review-center/list",
        params: { bucket },
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
          onPress={() => router.back()}
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
              : "Track roadmap and assessment activity"}
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
        <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.cards}>
          {DASHBOARD_BUCKET_ORDER.map((bucket, index) => (
            <Animated.View key={bucket} entering={FadeInUp.delay(80 + index * 60).springify()}>
              <ReviewDashboardCard
                bucket={bucket}
                count={dashboardCounts[bucket]}
                onPress={() => openBucket(bucket)}
              />
            </Animated.View>
          ))}
        </Animated.View>
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
  cards: {
    gap: 12,
  },
});
