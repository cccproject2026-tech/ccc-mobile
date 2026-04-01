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
    retry: 1,
  });
}
