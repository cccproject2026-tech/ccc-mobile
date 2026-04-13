import { roadmapService } from "@/services/roadmap.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mentorshipSessionKeys } from "./useMentorshipSessions";
import { pastorSessionKeys } from "./usePastorSessions";

export type UseRedoSessionOptions = {
  /**
   * Run before session queries are invalidated (e.g. navigate away from detail).
   * After redo, the API often returns a new session id or drops the old row; staying
   * on `/sessions/[id]` would briefly show "details not available" until Retry.
   */
  onBeforeInvalidate?: () => void;
};

export const useRedoSession = (options?: UseRedoSessionOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => roadmapService.redoSession(appointmentId),
    retry: 0,
    onSuccess: async () => {
      options?.onBeforeInvalidate?.();
      await queryClient.invalidateQueries({
        queryKey: mentorshipSessionKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: pastorSessionKeys.all,
      });
    },
  });
};
