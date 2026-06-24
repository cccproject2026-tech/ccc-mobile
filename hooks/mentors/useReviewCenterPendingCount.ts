import {
  computeDashboardCounts,
  computePendingActionCount,
} from "@/lib/mentor/reviewCenter.types";
import {
  loadPersistedPendingCount,
  persistPendingCount,
} from "@/lib/mentor/reviewCenterPendingCountCache";
import {
  mentorReviewCenterKeys,
  REVIEW_CENTER_GC_MS,
  REVIEW_CENTER_STALE_MS,
} from "@/lib/mentor/reviewCenterQueryKeys";
import { useAuthStore } from "@/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Lightweight badge hook for Mentor Home — reads cached pending count only.
 * Does not trigger the full Review Center scan (submissions / extras / assessments).
 * Count is populated after a Review Center visit or from a recent persisted value.
 */
export function useReviewCenterPendingCount() {
  const { user } = useAuthStore();
  const mentorId = user?.id;

  const { data: pendingActionCount = 0 } = useQuery({
    queryKey: mentorReviewCenterKeys.pendingCount(mentorId ?? ""),
    enabled: !!mentorId,
    staleTime: REVIEW_CENTER_STALE_MS,
    gcTime: REVIEW_CENTER_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    queryFn: async () => {
      const persisted = await loadPersistedPendingCount(mentorId!);
      return persisted ?? 0;
    },
  });

  return { pendingActionCount };
}

/** Sync pending-count cache after a full Review Center scan completes. */
export function syncReviewCenterPendingCount(
  queryClient: ReturnType<typeof useQueryClient>,
  mentorId: string,
  items: Parameters<typeof computeDashboardCounts>[0],
): number {
  const count = computePendingActionCount(computeDashboardCounts(items));
  queryClient.setQueryData(mentorReviewCenterKeys.pendingCount(mentorId), count);
  void persistPendingCount(mentorId, count);
  return count;
}
