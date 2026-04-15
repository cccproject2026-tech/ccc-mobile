import { roadmapService } from "@/services/roadmap.service";
import { MentorshipSession } from "@/types/session.types";
import { useQuery } from "@tanstack/react-query";

export const mentorshipSessionKeys = {
  all: ["mentorship-sessions"] as const,
  /** mentorId: sessions aggregated from all assigned pastors */
  list: (mentorId: string) =>
    [...mentorshipSessionKeys.all, "mentor-aggregate", mentorId] as const,
};

export const useMentorshipSessions = (mentorId?: string) => {
  return useQuery<MentorshipSession[]>({
    queryKey: mentorshipSessionKeys.list(mentorId || ""),
    queryFn: () => roadmapService.getMentorshipSessionsForMentor(mentorId!),
    enabled: !!mentorId,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // Avoid duplicate bursts on navigation + manual refresh
    refetchOnMount: true,
    refetchOnReconnect: true,
    // Keep showing last good data if a refetch gets throttled (429)
    placeholderData: (prev) => prev ?? [],
    retry: (failureCount, error: any) => {
      const status = error?.statusCode;
      if (status === 429) return false;
      if (status === 404 || status === 503) return failureCount < 2;
      return failureCount < 1;
    },
    retryDelay: (attemptIndex, error: any) => {
      if (error?.statusCode === 404 || error?.statusCode === 503) {
        return Math.min(1000 * 2 ** attemptIndex, 8000);
      }
      return 500;
    },
  });
};
