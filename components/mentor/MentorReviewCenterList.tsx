import { ReviewListRow } from "@/components/mentor/review-center/ReviewListRow";
import { ReviewRoadmapSectionHeader } from "@/components/mentor/review-center/ReviewRoadmapSectionHeader";
import { DASHBOARD_CARD_CONFIG } from "@/components/mentor/review-center/ReviewDashboardCard";
import { useNavigationBack } from "@/hooks/navigation/useNavigationBack";
import { useReviewCenterV2 } from "@/hooks/mentors/useReviewCenterV2";
import {
  buildReviewCenterListHref,
} from "@/lib/navigation/reviewCenterNavigation";
import { appendReturnTo } from "@/utils/navigation";
import {
  filterItemsByBucket,
  filterItemsByPastor,
  groupReviewItemsByRoadmap,
  shouldGroupRoadmapList,
  type ReviewDashboardBucket,
  type ReviewItem,
  type ReviewRoadmapSection,
} from "@/lib/mentor/reviewCenter.types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
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

type ListRow =
  | { kind: "task"; item: ReviewItem; index: number; isLastInSection: boolean }
  | { kind: "standalone"; item: ReviewItem; index: number; isLastInSection: boolean };

type ListSection = {
  key: string;
  title?: string;
  roadmapSection?: ReviewRoadmapSection;
  data: ListRow[];
};

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
  const {
    bucket: bucketParam,
    pastorId: pastorIdParam,
    pastorName: pastorNameParam,
  } = useLocalSearchParams<{
    bucket?: string;
    pastorId?: string;
    pastorName?: string;
  }>();
  const bucket = parseBucket(bucketParam);
  const pastorId = String(
    Array.isArray(pastorIdParam) ? pastorIdParam[0] : pastorIdParam ?? "",
  ).trim();
  const pastorName = String(
    Array.isArray(pastorNameParam) ? pastorNameParam[0] : pastorNameParam ?? "",
  ).trim();

  const listFallback = pastorId
    ? ({
        pathname: "/(mentor)/(tabs)/review-center/pastor",
        params: { pastorId, pastorName },
      } as const)
    : ("/(mentor)/(tabs)/review-center" as const);

  const listReturnTo = useMemo(
    () =>
      pastorId
        ? buildReviewCenterListHref(bucket, pastorId, pastorName)
        : buildReviewCenterListHref(bucket),
    [bucket, pastorId, pastorName],
  );

  const { handleBack } = useNavigationBack(listFallback);

  const appendReturnToParams = useCallback(
    (nextParams: Record<string, string | undefined>) =>
      appendReturnTo(nextParams, listReturnTo),
    [listReturnTo],
  );
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

  const sections = useMemo((): ListSection[] => {
    if (!shouldGroupRoadmapList(bucket)) {
      return [
        {
          key: "flat",
          data: listItems.map((item, index) => ({
            kind: "standalone" as const,
            item,
            index,
            isLastInSection: index === listItems.length - 1,
          })),
        },
      ];
    }

    const { sections: roadmapSections, standaloneItems } =
      groupReviewItemsByRoadmap(listItems);

    const result: ListSection[] = roadmapSections.map((roadmapSection) => ({
      key: `roadmap-${roadmapSection.roadmapId}`,
      roadmapSection,
      data: roadmapSection.items.map((item, index) => ({
        kind: "task" as const,
        item,
        index,
        isLastInSection: index === roadmapSection.items.length - 1,
      })),
    }));

    if (standaloneItems.length > 0) {
      result.push({
        key: "assessments",
        title: "Assessments",
        data: standaloneItems.map((item, index) => ({
          kind: "standalone" as const,
          item,
          index,
          isLastInSection: index === standaloneItems.length - 1,
        })),
      });
    }

    return result;
  }, [bucket, listItems]);

  const config = DASHBOARD_CARD_CONFIG[bucket];
  const headerTitle = pastorName
    ? `${pastorName} · ${config.title}`
    : config.title;

  const handleItemPress = useCallback(
    (item: ReviewItem) => {
      markAsSeen(item.id);

      if (item.type === "roadmap" && item.roadmapId && item.nestedRoadMapItemId) {
        router.push({
          pathname: "/(mentor)/roadmap/[phaseId]/[itemId]" as any,
          params: appendReturnToParams({
            phaseId: item.roadmapId,
            itemId: item.nestedRoadMapItemId,
            menteeId: item.pastorId,
            menteeName: item.pastorName,
          }),
        });
      } else if (item.type === "assessment" && item.assessmentId) {
        router.push({
          pathname: "/(mentor)/assessments/answer-questions" as any,
          params: appendReturnToParams({
            assessmentId: item.assessmentId,
            viewMode: "true",
            targetUserId: item.pastorId,
            hasPreSurvey: "true",
            scheduleMeeting: "false",
          }),
        });
      }
    },
    [markAsSeen, router, appendReturnToParams],
  );

  const renderRow = useCallback(
    ({ row }: { row: ListRow }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(row.index * 40, 320)).springify()}>
        <ReviewListRow
          item={row.item}
          onPress={() => handleItemPress(row.item)}
          nested={row.kind === "task"}
          hidePastorName={Boolean(pastorId)}
          isLastInSection={row.isLastInSection}
        />
      </Animated.View>
    ),
    [handleItemPress, pastorId],
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
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            {listItems.length} {listItems.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(row) => row.item.id}
        renderItem={({ item: row }) => renderRow({ row })}
        renderSectionHeader={({ section }) => {
          if (section.roadmapSection) {
            return <ReviewRoadmapSectionHeader section={section.roadmapSection} />;
          }
          if (section.title) {
            return (
              <View style={styles.assessmentSectionHeader}>
                <Text style={styles.assessmentSectionTitle}>{section.title}</Text>
              </View>
            );
          }
          return null;
        }}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[
          styles.listContent,
          listItems.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={44}
              color="rgba(255,255,255,0.35)"
            />
            <Text style={styles.emptyTitle}>Nothing here</Text>
            <Text style={styles.emptySubtitle}>
              No items match this category right now.
            </Text>
          </View>
        }
        SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
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
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listContentEmpty: {
    flexGrow: 1,
    minHeight: 200,
    justifyContent: "center",
  },
  sectionGap: {
    height: 12,
  },
  assessmentSectionHeader: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: "rgba(167,139,250,0.1)",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.1)",
  },
  assessmentSectionTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
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
