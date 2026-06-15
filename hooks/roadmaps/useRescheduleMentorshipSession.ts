import { mentorshipSessionKeys } from "@/hooks/roadmaps/useMentorshipSessions";
import { pastorSessionKeys } from "@/hooks/roadmaps/usePastorSessions";
import { mentoringSessionsService } from "@/services/mentoring-sessions.service";
import type { MentorshipRescheduleResponse } from "@/types/mentoringSessions.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface RescheduleMentorshipSessionPayload {
  sessionId: string;
  mentorId: string;
  newMeetingDate: string;
}

export function useRescheduleMentorshipSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RescheduleMentorshipSessionPayload) =>
      mentoringSessionsService.rescheduleSession(payload.sessionId, {
        mentorId: payload.mentorId,
        newMeetingDate: payload.newMeetingDate,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: mentorshipSessionKeys.all }),
        queryClient.invalidateQueries({ queryKey: pastorSessionKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        queryClient.invalidateQueries({ queryKey: ["weekly-availability"] }),
        queryClient.invalidateQueries({ queryKey: ["monthly-availability"] }),
      ]);
    },
  });
}

export type { MentorshipRescheduleResponse };
