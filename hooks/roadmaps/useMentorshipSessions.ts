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
    retry: 1,
  });
};
