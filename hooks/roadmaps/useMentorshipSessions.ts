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
    retry: (failureCount, error: any) => {
      const status = error?.statusCode;
      if (status === 429) return failureCount < 3;
      return failureCount < 1;
    },
    retryDelay: (attemptIndex, error: any) => {
      if (error?.statusCode === 429) {
        return Math.min(1000 * 2 ** attemptIndex, 8000);
      }
      return 500;
    },
  });
};
