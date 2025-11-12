import {
    CreateExtrasDto,
    Roadmap,
    UpdateExtrasDto
} from '@/lib/roadmap/types';
import { roadmapService } from '@/services/roadmap.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useRoadmaps() {
    return useQuery<Roadmap[]>({
        queryKey: ['roadmaps'],
        queryFn: () => roadmapService.getRoadmaps(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useRoadmap(roadmapId: string | undefined) {
    return useQuery<Roadmap>({
        queryKey: ['roadmap', roadmapId],
        queryFn: () => roadmapService.getRoadmapById(roadmapId!),
        enabled: !!roadmapId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook for fetching roadmap extras/saved form data
 */
export function useRoadmapExtras(
    roadmapId: string | undefined,
    nestedRoadMapItemId?: string,
    userId?: string
) {
    return useQuery({
        queryKey: ['roadmap-extras', roadmapId, nestedRoadMapItemId, userId],
        queryFn: () => roadmapService.getRoadmapExtras(
            roadmapId!,
            nestedRoadMapItemId,
            userId
        ),
        // Only fetch if roadmapId is valid (24 char hex string)
        enabled: !!roadmapId && roadmapId.length === 24,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook for creating roadmap extras
 */
export function useCreateRoadmapExtras() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateExtrasDto) =>
            roadmapService.createRoadmapExtras(payload),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: ['roadmap-extras', variables.roadMapId]
            });
            queryClient.invalidateQueries({
                queryKey: ['roadmap', variables.roadMapId]
            });
            queryClient.invalidateQueries({
                queryKey: ['roadmaps']
            });
        },
    });
}

/**
 * Hook for updating roadmap extras
 */
export function useUpdateRoadmapExtras() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roadMapId, payload, userId, nestedRoadMapItemId }: { roadMapId: string; payload: UpdateExtrasDto; userId: string; nestedRoadMapItemId: string | undefined }) =>
            roadmapService.updateRoadmapExtras(roadMapId, payload, userId, nestedRoadMapItemId),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: ['roadmap-extras', variables.roadMapId]
            });
            queryClient.invalidateQueries({
                queryKey: ['roadmap', variables.roadMapId]
            });
            queryClient.invalidateQueries({
                queryKey: ['roadmaps']
            });
        },
    });
}

/**
 * Hook for deleting roadmap extras
 */
export function useDeleteRoadmapExtras() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (roadMapId: string) =>
            roadmapService.deleteRoadmapExtras(roadMapId),
        onSuccess: (data, roadMapId) => {
            queryClient.invalidateQueries({
                queryKey: ['roadmap-extras', roadMapId]
            });
            queryClient.invalidateQueries({
                queryKey: ['roadmap', roadMapId]
            });
            queryClient.invalidateQueries({
                queryKey: ['roadmaps']
            });
        },
    });
}
