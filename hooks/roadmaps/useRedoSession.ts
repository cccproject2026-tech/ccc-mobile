import { roadmapService } from "@/services/roadmap.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorshipSessionKeys } from "./useMentorshipSessions";
import { pastorSessionKeys } from "./usePastorSessions";

export const useRedoSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => roadmapService.redoSession(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipSessionKeys.all });
      queryClient.invalidateQueries({ queryKey: pastorSessionKeys.all });
    },
  });
};
