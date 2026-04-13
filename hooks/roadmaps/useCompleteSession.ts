import { roadmapService } from "@/services/roadmap.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorshipSessionKeys } from "./useMentorshipSessions";
import { pastorSessionKeys } from "./usePastorSessions";

export const useCompleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      roadmapService.completeSession(appointmentId),
    retry: 0,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: mentorshipSessionKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: pastorSessionKeys.all,
      });
    },
  });
};
