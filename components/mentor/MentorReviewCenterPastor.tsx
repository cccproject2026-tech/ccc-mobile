import {
  DASHBOARD_BUCKET_ORDER,
  ReviewDashboardCard,
} from "@/components/mentor/review-center/ReviewDashboardCard";
import { useReviewCenterV2 } from "@/hooks/mentors/useReviewCenterV2";
import {
  computeDashboardCounts,
  computePendingActionCount,
  filterItemsByPastor,
  type ReviewDashboardBucket,
} from "@/lib/mentor/reviewCenter.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
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

export default function MentorReviewCenterPastor() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pastorId, pastorName: pastorNameParam } = useLocalSearchParams<{
    pastorId?: string;
    pastorName?: string;
  }>();

  const pastorIdStr = String(pastorId ?? "");
  const { allItems, pastorGroups, isLoading } = useReviewCenterV2();

  const pastorName = useMemo(() => {
    if (pastorNameParam) return String(pastorNameParam);
    const g = pastorGroups.find((p) => p.pastorId === pastorIdStr);
    return g?.pastorName ?? "Pastor";
  }, [pastorNameParam, pastorGroups, pastorIdStr]);

  const pastorItems = useMemo(
    () => filterItemsByPastor(allItems, pastorIdStr),
    [allItems, pastorIdStr],
  );

  const dashboardCounts = useMemo(
    () => computeDashboardCounts(pastorItems),
    [pastorItems],
  );

  const pendingActionCount = useMemo(
    () => computePendingActionCount(dashboardCounts),
    [dashboardCounts],
  );

  const openBucket = useCallback(
    (bucket: ReviewDashboardBucket) => {
      router.push({
        pathname: "/(mentor)/review-center/list",
        params: {
          bucket,
          pastorId: pastorIdStr,
          pastorName,
        },
      });
    },
    [router, pastorIdStr, pastorName],
  );

  if (isLoading) {
    return (
      <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.root}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {pastorName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {pendingActionCount > 0
              ? `${pendingActionCount} item${pendingActionCount === 1 ? "" : "s"} need attention`
              : `${pastorItems.length} tracked item${pastorItems.length === 1 ? "" : "s"}`}
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cards: {
    gap: 12,
  },
});
