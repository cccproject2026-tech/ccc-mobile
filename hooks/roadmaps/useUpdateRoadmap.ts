import { UpdateRoadmapRequest, UpdateRoadmapResponse } from '@/lib/roadmaps/types';
import { roadmapService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateRoadmap = () => {
    const queryClient = useQueryClient();

    return useMutation<
        UpdateRoadmapResponse,
        Error,
        { roadmapId: string; data: UpdateRoadmapRequest }
    >({
        mutationFn: ({ roadmapId, data }) => roadmapService.updateRoadmap(roadmapId, data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
            queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
            console.log('✅ Roadmap updated successfully');
        },

        onError: (error) => {
            console.error('❌ Update roadmap failed:', error);
        },
    });
};


