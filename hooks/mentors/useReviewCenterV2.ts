import { useMentees } from "@/hooks/mentees/useMentees";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import {
  syncReviewCenterPendingCount,
} from "@/hooks/mentors/useReviewCenterPendingCount";
import {
  fetchMentorReviewCenterItems,
  isReviewCenterTooManyRequestsError,
  REVIEW_CENTER_MAX_MENTEES,
} from "@/lib/mentor/fetchMentorReviewCenterItems";
import {
  mentorReviewCenterKeys,
  REVIEW_CENTER_GC_MS,
  REVIEW_CENTER_STALE_MS,
} from "@/lib/mentor/reviewCenterQueryKeys";
import {
  type ReviewBadgeCounts,
  type ReviewCategoryCounts,
  type ReviewDashboardCounts,
  type ReviewFilterTab,
  REVIEW_PRIORITY,
  buildPastorGroups,
  computeDashboardCounts,
  computePendingActionCount,
  type ReviewPastorGroup,
} from "@/lib/mentor/reviewCenter.types";
import { useAuthStore } from "@/stores";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

const SEEN_STORAGE_KEY = "mentor_review_center_seen";

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function persistSeenIds(ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function uniqueNonEmpty(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.map((v) => String(v ?? "").trim()).filter(Boolean))];
}

export type UseReviewCenterV2Options = {
  /** When false, skips the expensive review scan (default: true). */
  scanEnabled?: boolean;
};

/**
 * Full Review Center data — intended for Review Center screens only.
 * Pass `scanEnabled: false` only if you need derived state from an existing cache.
 */
export function useReviewCenterV2(options?: UseReviewCenterV2Options) {
  const scanEnabled = options?.scanEnabled ?? true;
  const { user } = useAuthStore();
  const mentorId = user?.id;
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<ReviewFilterTab>("all");

  const { data: menteesData, isLoading: isLoadingMentees } = useMentees(
    REVIEW_CENTER_MAX_MENTEES,
    mentorId,
  );
  const { data: allRoadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();
  const {
    data: assessments,
    isLoading: isLoadingAssessments,
  } = useAssessments();

  const mentees = useMemo(() => {
    const pages = (menteesData?.pages ?? []) as any[];
    return pages.flatMap((p) => p?.mentees ?? []);
  }, [menteesData]);

  const menteeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mentees as any[]) {
      const ids = uniqueNonEmpty([m?.id, m?._id]);
      if (ids.length === 0) continue;
      const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
      for (const id of ids) {
        map.set(String(id), name || "Pastor");
      }
    }
    return map;
  }, [mentees]);

  const roadmapNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of (allRoadmaps ?? []) as any[]) {
      const id = r?._id;
      if (!id) continue;
      map.set(String(id), String(r?.name ?? "Roadmap"));
    }
    return map;
  }, [allRoadmaps]);

  const roadmapTasksById = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();
    for (const r of (allRoadmaps ?? []) as any[]) {
      const rid = r?._id;
      if (!rid) continue;
      const tasks = (r.roadmaps ?? [])
        .filter((t: any) => t?._id)
        .map((t: any) => ({
          id: String(t._id),
          name: String(t?.name ?? t?.title ?? "Task"),
        }));
      map.set(String(rid), tasks);
    }
    return map;
  }, [allRoadmaps]);

  const assessmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of (assessments ?? []) as any[]) {
      const id = a?._id;
      if (!id) continue;
      map.set(String(id), String(a?.name ?? a?.title ?? "Assessment"));
    }
    return map;
  }, [assessments]);

  const menteeIdsKey = useMemo(() => {
    return (mentees as any[])
      .map((m) => String(m?.id ?? ""))
      .filter(Boolean)
      .sort()
      .join(",");
  }, [mentees]);

  const { data: reviewData, isLoading: isLoadingReview } = useQuery({
    queryKey: mentorReviewCenterKeys.scan(mentorId ?? "", menteeIdsKey),
    enabled:
      scanEnabled &&
      !!mentorId &&
      !isLoadingMentees &&
      !isLoadingRoadmaps &&
      !isLoadingAssessments,
    staleTime: REVIEW_CENTER_STALE_MS,
    gcTime: REVIEW_CENTER_GC_MS,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isReviewCenterTooManyRequestsError(error)) return false;
      return failureCount < 2;
    },
    queryFn: () =>
      fetchMentorReviewCenterItems({
        mentees: mentees as any[],
        menteeNameById,
        roadmapNameById,
        roadmapTasksById,
        assessmentNameById,
      }),
  });

  useEffect(() => {
    if (!mentorId || !reviewData) return;
    syncReviewCenterPendingCount(queryClient, mentorId, reviewData);
  }, [mentorId, reviewData, queryClient]);

  const allItems = reviewData ?? [];

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeFilter === "roadmaps") items = items.filter((i) => i.type === "roadmap");
    if (activeFilter === "assessments") items = items.filter((i) => i.type === "assessment");

    return items.sort((a, b) => {
      const priorityDiff = REVIEW_PRIORITY[a.category] - REVIEW_PRIORITY[b.category];
      if (priorityDiff !== 0) return priorityDiff;
      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [allItems, activeFilter]);

  const categoryCounts = useMemo((): ReviewCategoryCounts => {
    const counts: ReviewCategoryCounts = {
      pending_review: 0,
      reviewed: 0,
      resubmitted: 0,
      not_started: 0,
    };
    for (const item of allItems) {
      counts[item.category]++;
    }
    return counts;
  }, [allItems]);

  const dashboardCounts = useMemo<ReviewDashboardCounts>(() => {
    return computeDashboardCounts(allItems);
  }, [allItems]);

  const pendingActionCount = useMemo(() => {
    return computePendingActionCount(dashboardCounts);
  }, [dashboardCounts]);

  const menteeAvatarById = useMemo(() => {
    const map = new Map<string, { profilePicture?: string | null; profileImage?: string | null }>();
    for (const m of mentees as any[]) {
      const ids = uniqueNonEmpty([m?.id, m?._id]);
      if (ids.length === 0) continue;
      const avatar = {
        profilePicture: m?.profilePicture ?? null,
        profileImage: m?.profileImage ?? null,
      };
      for (const id of ids) map.set(String(id), avatar);
    }
    return map;
  }, [mentees]);

  const pastorGroups = useMemo((): ReviewPastorGroup[] => {
    return buildPastorGroups(allItems).map((group) => {
      const avatar = menteeAvatarById.get(group.pastorId);
      return avatar ? { ...group, ...avatar } : group;
    });
  }, [allItems, menteeAvatarById]);

  const badgeCounts = useMemo((): ReviewBadgeCounts => {
    const counts: ReviewBadgeCounts = { roadmaps: 0, assessments: 0 };
    for (const item of allItems) {
      if (!item.isSeen && item.status !== "NOT_STARTED") {
        if (item.type === "roadmap") counts.roadmaps++;
        else counts.assessments++;
      }
    }
    return counts;
  }, [allItems]);

  const totalUnseen = badgeCounts.roadmaps + badgeCounts.assessments;

  const markAsSeen = useCallback(
    async (itemId: string) => {
      const seenIds = await loadSeenIds();
      if (seenIds.has(itemId)) return;
      seenIds.add(itemId);
      await persistSeenIds(seenIds);
      queryClient.invalidateQueries({ queryKey: mentorReviewCenterKeys.all });
    },
    [queryClient],
  );

  const isLoading =
    scanEnabled &&
    (isLoadingMentees || isLoadingRoadmaps || isLoadingAssessments || isLoadingReview);

  return {
    items: filteredItems,
    allItems,
    pastorGroups,
    categoryCounts,
    dashboardCounts,
    pendingActionCount,
    badgeCounts,
    totalUnseen,
    activeFilter,
    setActiveFilter,
    markAsSeen,
    isLoading,
  };
}
