import { progressService } from "@/services/progress.service";
import { AssignRoadmapRequest } from "@/types/progress.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roadmapKeys } from "./useRoadmaps";
import { progressKeys } from "../progress/useProgress";

/**
 * Hook for assigning roadmaps to mentees
 */
export function useAssignRoadmaps() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AssignRoadmapRequest) =>
            progressService.assignRoadmap(payload),
        onSuccess: () => {
            console.log("✅ Roadmaps assigned successfully");

            // Invalidate relevant queries to refresh the UI
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: progressKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: ['mentees']
            });
        },
    });
}
