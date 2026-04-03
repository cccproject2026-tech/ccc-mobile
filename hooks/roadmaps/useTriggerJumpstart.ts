import { roadmapService } from "@/services/roadmap.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorshipSessionKeys } from "./useMentorshipSessions";
import { pastorSessionKeys } from "./usePastorSessions";

export const useTriggerJumpstart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roadmapId,
      userId,
      nestedRoadMapItemId,
    }: {
      roadmapId: string;
      userId: string;
      nestedRoadMapItemId?: string;
    }) =>
      roadmapService.triggerJumpstartComplete(
        roadmapId,
        userId,
        nestedRoadMapItemId,
      ),
    // POST /roadmaps/:roadmapId/extras must never be retried automatically.
    // If it fails (e.g. "Extras already exist"), the caller will handle it and still proceed to PATCH.
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorshipSessionKeys.all });
      queryClient.invalidateQueries({ queryKey: pastorSessionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
  });
};
