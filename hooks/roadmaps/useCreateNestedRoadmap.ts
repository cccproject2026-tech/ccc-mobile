import { CreateNestedRoadmapRequest, CreateNestedRoadmapResponse } from '@/lib/roadmaps/types';
import { roadmapService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateNestedRoadmap = () => {
    const queryClient = useQueryClient();

    return useMutation<
        CreateNestedRoadmapResponse,
        Error,
        { roadmapId: string; data: CreateNestedRoadmapRequest }
    >({
        mutationFn: ({ roadmapId, data }) => roadmapService.createNestedRoadmap(roadmapId, data),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['roadmap', variables.roadmapId] });
            queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
            console.log('✅ Nested roadmap created successfully');
        },

        onError: (error) => {
            console.error('❌ Create nested roadmap failed:', error);
        },
    });
};

