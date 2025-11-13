// hooks/roadmaps/useRoadmaps.ts
import {
    CreateExtrasDto,
    NestedRoadmap,
    Roadmap,
    UpdateExtrasDto
} from "@/lib/roadmap/types";
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { roadmapService } from '@/services/roadmap.service';
import { UserRole } from "@/types";
import { RoadmapProgress } from "@/types/progress.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useProgress } from "../progress/useProgress";

// ============================================
// ROADMAP QUERY KEYS
// ============================================
export const roadmapKeys = {
    all: ['roadmaps'] as const,
    lists: () => [...roadmapKeys.all, 'list'] as const,
    list: (filters?: string) => [...roadmapKeys.lists(), { filters }] as const,
    details: () => [...roadmapKeys.all, 'detail'] as const,
    detail: (id: string) => [...roadmapKeys.details(), id] as const,
    assigned: (userId: string) => [...roadmapKeys.all, 'assigned', userId] as const,
    extras: (roadmapId: string, nestedId?: string, userId?: string) =>
        [...roadmapKeys.all, 'extras', roadmapId, nestedId, userId] as const,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Maps progress status to roadmap status with proper type safety
 */
function mapProgressStatus(
    progressStatus: 'not_started' | 'in_progress' | 'completed'
): 'not started' | 'in-progress' | 'completed' {
    const statusMap = {
        'not_started': 'not started' as const,
        'in_progress': 'in-progress' as const,
        'completed': 'completed' as const,
    };
    return statusMap[progressStatus];
}

/**
 * Merges roadmap with its progress data
 */
function mergeRoadmapWithProgress(
    roadmap: Roadmap,
    progressItem: RoadmapProgress | undefined
): Roadmap {
    if (!progressItem) {
        return roadmap;
    }

    // Map nested roadmaps with their progress
    const updatedNestedRoadmaps = roadmap.roadmaps.map((nestedRoadmap) => {
        const nestedProgress = progressItem.nestedRoadmaps?.find(
            (np) => np.nestedRoadmapId === nestedRoadmap._id
        );

        if (!nestedProgress) {
            return nestedRoadmap;
        }

        return {
            ...nestedRoadmap,
            status: mapProgressStatus(nestedProgress.status),
            totalSteps: nestedProgress.totalSteps,
        } as NestedRoadmap;
    });

    // Return roadmap with updated status and nested roadmaps
    return {
        ...roadmap,
        status: mapProgressStatus(progressItem.status),
        totalSteps: progressItem.totalSteps,
        roadmaps: updatedNestedRoadmaps,
    };
}

// ============================================
// FETCH ALL ROADMAPS (ADMIN/DIRECTOR USE)
// ============================================
export const useAllRoadmaps = () => {
    return useQuery({
        queryKey: roadmapKeys.lists(),
        queryFn: async () => {
            console.log("📤 Fetching all roadmaps...");
            const response = await apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch roadmaps');
            }
            return response.data.data as Roadmap[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        retry: 1,
    });
};

// ============================================
// FETCH ASSIGNED ROADMAPS WITH PROGRESS (PASTOR USE)
// ============================================
export const useAssignedRoadmaps = () => {
    // First, get the progress data to know which roadmaps are assigned
    const {
        data: progressData,
        isLoading: isProgressLoading,
        isError: isProgressError,
        error: progressError
    } = useProgress();

    // Extract assigned roadmap IDs
    const assignedRoadmapIds = progressData?.roadmaps.items.map(item => item.roadMapId) || [];

    // Then fetch all roadmaps, but only when we have the progress data
    const roadmapsQuery = useQuery({
        queryKey: roadmapKeys.assigned(assignedRoadmapIds.join(',')),
        queryFn: async () => {
            console.log("📤 Fetching roadmaps for filtering and status merge...");
            const response = await apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch roadmaps');
            }

            const allRoadmaps = response.data.data as Roadmap[];

            // Filter to only assigned roadmaps
            const assignedRoadmaps = allRoadmaps.filter(roadmap =>
                assignedRoadmapIds.includes(roadmap._id)
            );

            console.log("📥 Roadmaps filtered. Total:", allRoadmaps.length, "Assigned:", assignedRoadmaps.length);

            return assignedRoadmaps;
        },
        enabled: !!progressData && assignedRoadmapIds.length > 0,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
        retry: 1,
    });

    // Merge roadmaps with progress data using useMemo for optimization
    const roadmapsWithProgress = useMemo(() => {
        if (!roadmapsQuery.data || !progressData) {
            return roadmapsQuery.data || [];
        }

        console.log("🔄 Merging roadmaps with progress data...");

        const merged = roadmapsQuery.data.map((roadmap) => {
            const progressItem = progressData.roadmaps.items.find(
                (p) => p.roadMapId === roadmap._id
            );
            return mergeRoadmapWithProgress(roadmap, progressItem);
        });

        console.log("✅ Roadmaps merged with progress status");
        return merged;
    }, [roadmapsQuery.data, progressData]);

    return {
        data: roadmapsWithProgress,
        isLoading: isProgressLoading || roadmapsQuery.isLoading,
        isError: isProgressError || roadmapsQuery.isError,
        error: progressError || roadmapsQuery.error,
        refetch: roadmapsQuery.refetch,
        isRefetching: roadmapsQuery.isRefetching,
        // Additional state for granular control
        progressData,
        isProgressLoading,
        isRoadmapsLoading: roadmapsQuery.isLoading,
    };
};

// ============================================
// SMART HOOK - AUTO-DETECTS USER ROLE
// ============================================
export function useRoadmaps(userRole?: UserRole) {
    // If role is not provided, default to 'pastor' for safety
    const role = userRole || 'pastor';

    // Use different hooks based on role
    const allRoadmapsQuery = useAllRoadmaps();
    const assignedRoadmapsQuery = useAssignedRoadmaps();

    if (role === 'pastor') {
        return assignedRoadmapsQuery;
    }

    return {
        data: allRoadmapsQuery.data,
        isLoading: allRoadmapsQuery.isLoading,
        isError: allRoadmapsQuery.isError,
        error: allRoadmapsQuery.error,
        refetch: allRoadmapsQuery.refetch,
        isRefetching: allRoadmapsQuery.isRefetching,
    };
}

// ============================================
// FETCH SINGLE ROADMAP BY ID WITH PROGRESS
// ============================================
export function useRoadmap(roadmapId: string | undefined, includeProgress: boolean = true) {
    const { data: progressData } = useProgress();

    const roadmapQuery = useQuery<Roadmap>({
        queryKey: roadmapKeys.detail(roadmapId || ''),
        queryFn: async () => {
            console.log("📤 Fetching roadmap:", roadmapId);
            const roadmap = await roadmapService.getRoadmapById(roadmapId!);
            console.log("📥 Roadmap fetched:", roadmap);
            return roadmap;
        },
        enabled: !!roadmapId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    // Merge with progress if requested
    const roadmapWithProgress = useMemo(() => {
        if (!includeProgress || !roadmapQuery.data || !progressData) {
            return roadmapQuery.data;
        }

        const progressItem = progressData.roadmaps.items.find(
            (p) => p.roadMapId === roadmapQuery.data._id
        );

        return mergeRoadmapWithProgress(roadmapQuery.data, progressItem);
    }, [roadmapQuery.data, progressData, includeProgress]);

    return {
        ...roadmapQuery,
        data: roadmapWithProgress,
    };
}

// ============================================
// ROADMAP EXTRAS HOOKS
// ============================================

/**
 * Hook for fetching roadmap extras/saved form data
 */
export function useRoadmapExtras(
    roadmapId: string | undefined,
    nestedRoadMapItemId?: string,
    userId?: string
) {
    return useQuery({
        queryKey: roadmapKeys.extras(roadmapId || '', nestedRoadMapItemId, userId),
        queryFn: () => roadmapService.getRoadmapExtras(
            roadmapId!,
            nestedRoadMapItemId,
            userId
        ),
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
            console.log("✅ Roadmap extras created successfully");

            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.extras(variables.roadMapId, variables.nestedRoadMapItemId, variables.userId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadMapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
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
        mutationFn: ({
            roadMapId,
            payload,
            userId,
            nestedRoadMapItemId
        }: {
            roadMapId: string;
            payload: UpdateExtrasDto;
            userId: string;
            nestedRoadMapItemId: string | undefined
        }) => roadmapService.updateRoadmapExtras(roadMapId, payload, userId, nestedRoadMapItemId),
        onSuccess: (data, variables) => {
            console.log("✅ Roadmap extras updated successfully");

            // Invalidate relevant queries
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.extras(variables.roadMapId, variables.nestedRoadMapItemId, variables.userId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadMapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
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
            console.log("✅ Roadmap extras deleted successfully");

            queryClient.invalidateQueries({
                queryKey: roadmapKeys.extras(roadMapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(roadMapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
        },
    });
}
