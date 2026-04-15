import { roadmapService } from "@/services/roadmap.service";
import { MentorshipSession } from "@/types/session.types";
import { useQuery } from "@tanstack/react-query";

/** Query key: ["mentorship-sessions", pastorId] — refetch when parent ["mentorship-sessions"] is invalidated */
export const pastorSessionKeys = {
  all: ["mentorship-sessions"] as const,
  list: (pastorId: string) => [...pastorSessionKeys.all, pastorId] as const,
};

/**
 * Pastor-only: sessions for the logged-in pastor (GET /roadmaps/sessions/:pastorId).
 * Mentors use useMentorshipSessions (aggregated).
 */
export function usePastorSessions(pastorId?: string) {
  return useQuery<MentorshipSession[]>({
    queryKey: pastorSessionKeys.list(pastorId || ""),
    queryFn: () => roadmapService.getMentorshipSessions(pastorId!),
    enabled: !!pastorId,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Avoid duplicate bursts on navigation + manual refresh
    refetchOnMount: true,
    refetchOnReconnect: true,
    // Keep showing last good data if a refetch gets throttled (429)
    placeholderData: (prev) => prev ?? [],
    retry: (failureCount, error: any) => {
      const status = error?.statusCode ?? error?.response?.status;
      if (status === 429) return false;
      // Transient backend propagation / overload right after session creation
      if (status === 404 || status === 503) return failureCount < 2;
      return failureCount < 1;
    },
    retryDelay: (attemptIndex, error: any) => {
      const status = error?.statusCode ?? error?.response?.status;
      if (status === 404 || status === 503) {
        return Math.min(1000 * 2 ** attemptIndex, 8000);
      }
      return 500;
    },
  });
}
