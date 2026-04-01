import { roadmapService } from "@/services/roadmap.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorshipSessionKeys } from "./useMentorshipSessions";

export const useTriggerJumpstart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roadmapId,
      userId,
    }: {
      roadmapId: string;
      userId: string;
    }) => roadmapService.triggerJumpstartComplete(roadmapId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipSessionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
};
