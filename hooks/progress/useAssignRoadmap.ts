// hooks/progress/useAssignRoadmap.ts
import { progressService } from '@/services/progress.service';
import { AssignRoadmapRequest } from '@/types/progress.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { progressKeys } from './useProgress';

export const useAssignRoadmap = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AssignRoadmapRequest) =>
            progressService.assignRoadmap(payload),

        onSuccess: (data, variables) => {
            // Invalidate progress queries for all affected users
            variables.userIds.forEach((userId) => {
                queryClient.invalidateQueries({
                    queryKey: progressKeys.user(userId),
                });
            });

            // Invalidate roadmaps queries to refetch with new assignments
            queryClient.invalidateQueries({ queryKey: ['roadmaps'] });

            console.log('✅ Roadmaps assigned successfully:', data.message);
        },

        onError: (error) => {
            console.error('❌ Assign roadmap failed:', error);
        },
    });
};

