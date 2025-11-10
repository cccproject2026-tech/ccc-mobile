import { CreateRoadmapRequest, CreateRoadmapResponse } from '@/lib/roadmaps/types';
import { roadmapService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateRoadmap = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateRoadmapResponse, Error, CreateRoadmapRequest>({
        mutationFn: (data: CreateRoadmapRequest) => roadmapService.createRoadmap(data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
            console.log('✅ Roadmap created successfully');
        },

        onError: (error) => {
            console.error('❌ Create roadmap failed:', error);
        },
    });
};

