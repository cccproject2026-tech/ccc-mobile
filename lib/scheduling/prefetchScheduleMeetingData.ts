import { appointmentService } from "@/services/appointments.service";
import type { QueryClient } from "@tanstack/react-query";

const SCHEDULER_STALE_MS = 5 * 60_000;
const PREFETCH_COOLDOWN_MS = 30_000;

/** Avoid duplicate in-flight / back-to-back prefetches for the same mentor. */
const lastPrefetchAtByMentor = new Map<string, number>();

function isQueryFresh(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): boolean {
  const state = queryClient.getQueryState(queryKey);
  if (!state?.data || state.dataUpdatedAt == null) return false;
  return Date.now() - state.dataUpdatedAt < SCHEDULER_STALE_MS;
}

/**
 * Warm only availability caches for the schedule-meeting time picker.
 * Appointments are already loaded on session detail — do not duplicate those calls.
 * Skips work when cache is fresh or a prefetch ran recently.
 */
export function prefetchScheduleMeetingData(
  queryClient: QueryClient,
  params: { mentorId: string },
): void {
  const { mentorId } = params;
  if (!mentorId) return;

  const lastAt = lastPrefetchAtByMentor.get(mentorId) ?? 0;
  if (Date.now() - lastAt < PREFETCH_COOLDOWN_MS) return;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const weeklyKey = ["weekly-availability", mentorId] as const;
  const monthlyKey = ["monthly-availability", mentorId, month, year] as const;

  const needsWeekly = !isQueryFresh(queryClient, weeklyKey);
  const needsMonthly = !isQueryFresh(queryClient, monthlyKey);
  if (!needsWeekly && !needsMonthly) return;

  lastPrefetchAtByMentor.set(mentorId, Date.now());

  void (async () => {
    try {
      if (needsWeekly) {
        await queryClient.prefetchQuery({
          queryKey: weeklyKey,
          queryFn: () => appointmentService.getWeeklyAvailability(mentorId),
          staleTime: SCHEDULER_STALE_MS,
        });
      }
      if (needsMonthly) {
        // Stagger to reduce burst load on the API.
        await new Promise((r) => setTimeout(r, 200));
        await queryClient.prefetchQuery({
          queryKey: monthlyKey,
          queryFn: () =>
            appointmentService.getMonthlyAvailability(mentorId, month, year),
          staleTime: SCHEDULER_STALE_MS,
        });
      }
    } catch {
      // Non-blocking — scheduler will fetch on its own if prefetch fails (e.g. 429).
      lastPrefetchAtByMentor.delete(mentorId);
    }
  })();
}
