import { roadmapService } from "@/services/roadmap.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorshipSessionKeys } from "./useMentorshipSessions";
import { pastorSessionKeys } from "./usePastorSessions";
import { appointmentKeys } from "@/hooks/appointments/useAppointments";

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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: mentorshipSessionKeys.all,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: pastorSessionKeys.all,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
        refetchType: "active",
      });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });

      // Backend may create Session 1 asynchronously right after jumpstart save.
      // Re-fetch once more shortly after to surface the new session without manual app refresh.
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: pastorSessionKeys.list(variables.userId),
          type: "all",
        });
        queryClient.refetchQueries({
          queryKey: mentorshipSessionKeys.all,
          type: "all",
        });
        queryClient.refetchQueries({
          queryKey: appointmentKeys.user(variables.userId),
          type: "all",
        });
      }, 1500);
    },
  });
};
