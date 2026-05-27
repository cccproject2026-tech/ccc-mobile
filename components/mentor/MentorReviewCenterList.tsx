import { ReviewListRow } from "@/components/mentor/review-center/ReviewListRow";
import { DASHBOARD_CARD_CONFIG } from "@/components/mentor/review-center/ReviewDashboardCard";
import { useReviewCenterV2 } from "@/hooks/mentors/useReviewCenterV2";
import {
  filterItemsByBucket,
  filterItemsByPastor,
  type ReviewDashboardBucket,
  type ReviewItem,
} from "@/lib/mentor/reviewCenter.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const VALID_BUCKETS: ReviewDashboardBucket[] = [
  "new_roadmap_submissions",
  "resubmitted_tasks",
  "new_assessments",
  "not_started",
];

function parseBucket(raw: string | string[] | undefined): ReviewDashboardBucket {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && VALID_BUCKETS.includes(value as ReviewDashboardBucket)) {
    return value as ReviewDashboardBucket;
  }
  return "new_roadmap_submissions";
}

export default function MentorReviewCenterList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bucket: bucketParam, pastorId: pastorIdParam, pastorName: pastorNameParam } = useLocalSearchParams<{
    bucket?: string;
    pastorId?: string;
    pastorName?: string;
  }>();
  const bucket = parseBucket(bucketParam);
  const pastorId = String(Array.isArray(pastorIdParam) ? pastorIdParam[0] : pastorIdParam ?? '').trim();
  const pastorName = String(Array.isArray(pastorNameParam) ? pastorNameParam[0] : pastorNameParam ?? '').trim();

  const { allItems, markAsSeen, isLoading } = useReviewCenterV2();

  const listItems = useMemo(() => {
    const scoped = pastorId ? filterItemsByPastor(allItems, pastorId) : allItems;
    const filtered = filterItemsByBucket(scoped, bucket);
    return filtered.sort((a, b) => {
      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [allItems, bucket, pastorId]);

  const config = DASHBOARD_CARD_CONFIG[bucket];

  const handleItemPress = useCallback(
    (item: ReviewItem) => {
      markAsSeen(item.id);

      if (item.type === "roadmap" && item.roadmapId && item.nestedRoadMapItemId) {
        router.push({
          pathname: "/(mentor)/roadmap/[phaseId]/[itemId]" as any,
          params: {
            phaseId: item.roadmapId,
            itemId: item.nestedRoadMapItemId,
            menteeId: item.pastorId,
            menteeName: item.pastorName,
          },
        });
      } else if (item.type === "assessment" && item.assessmentId) {
        router.push({
          pathname: "/(mentor)/assessments/answer-questions" as any,
          params: {
            assessmentId: item.assessmentId,
            viewMode: "true",
            targetUserId: item.pastorId,
            hasPreSurvey: "true",
            scheduleMeeting: "false",
          },
        });
      }
    },
    [markAsSeen, router],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ReviewItem; index: number }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 320)).springify()}>
        <ReviewListRow item={item} onPress={() => handleItemPress(item)} />
      </Animated.View>
    ),
    [handleItemPress],
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
          <Text style={styles.headerTitle} numberOfLines={1}>{pastorName ? `${pastorName} · ${config.title}` : config.title}</Text>
          <Text style={styles.headerSubtitle}>
            {listItems.length} {listItems.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      <FlatList
        data={listItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          listItems.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={44} color="rgba(255,255,255,0.35)" />
            <Text style={styles.emptyTitle}>Nothing here</Text>
            <Text style={styles.emptySubtitle}>No items match this category right now.</Text>
          </View>
        }
      />
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
    paddingBottom: 10,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  listContent: {
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  listContentEmpty: {
    flexGrow: 1,
    minHeight: 200,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    textAlign: "center",
  },
});
