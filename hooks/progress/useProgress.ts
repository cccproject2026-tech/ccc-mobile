// hooks/useProgress.ts
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { useAuthStore } from "@/stores/auth.store";
import { ProgressData } from "@/types/progress.types";
import { useQuery } from "@tanstack/react-query";

// ============================================
// PROGRESS QUERY KEYS
// ============================================
export const progressKeys = {
    all: ['progress'] as const,
    user: (userId: string) => [...progressKeys.all, 'user', userId] as const,
    roadmaps: (userId: string) => [...progressKeys.all, 'roadmaps', userId] as const,
    assessments: (userId: string) => [...progressKeys.all, 'assessments', userId] as const,
};

// ============================================
// PROGRESS TYPES (Updated with nested roadmaps)
// ============================================


// ============================================
// MAIN PROGRESS HOOK
// ============================================
export const useProgress = () => {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: progressKeys.user(user?.id || ''),
        queryFn: async () => {
            if (!user?.id) throw new Error("User ID is missing");

            console.log("📤 Fetching progress for user:", user.id);

            const response = await apiClient.get(ENDPOINTS.USERS.GET_PROGRESS(user.id));

            // Handle null data case (no progress record)
            if (!response.data.success || !response.data.data) {
                console.log("⚠️ No progress record found for user");
                return {
                    overallProgress: 0,
                    roadmaps: {
                        total: 0,
                        completed: 0,
                        percentage: 0,
                        items: []
                    },
                    assessments: {
                        total: 0,
                        completed: 0,
                        percentage: 0,
                        items: []
                    }
                };
            }

            const data = response.data.data;

            const progressData: ProgressData = {
                overallProgress: data.overallRoadmapProgress ?? 0,
                roadmaps: {
                    total: data.totalRoadmaps ?? 0,
                    completed: data.completedRoadmaps ?? 0,
                    percentage: data.overallRoadmapProgress ?? 0,
                    items: data.roadmaps || []
                },
                assessments: {
                    total: data.totalAssessments ?? 0,
                    completed: data.completedAssessments ?? 0,
                    percentage: data.overallAssessmentProgress ?? 0,
                    items: data.assessments || []
                }
            };

            console.log("📥 Progress data fetched:", progressData);
            return progressData;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 2, // 2 minutes - progress changes frequently
        gcTime: 1000 * 60 * 10, // 10 minutes cache retention
        retry: 1,
        refetchOnWindowFocus: true, // Refetch when user comes back to the app
    });
};

// ============================================
// GRANULAR PROGRESS HOOKS
// ============================================

/**
 * Hook to get assigned roadmap IDs for the current user
 */
export const useAssignedRoadmapIds = () => {
    const { data, isLoading, isError, error } = useProgress();

    const roadmapIds = data?.roadmaps.items.map(item => item.roadMapId) || [];

    return {
        roadmapIds,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get only roadmap progress
 */
export const useRoadmapProgress = () => {
    const { data, isLoading, isError, error } = useProgress();

    return {
        data: data?.roadmaps,
        overallProgress: data?.roadmaps.percentage ?? 0,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get only assessment progress
 */
export const useAssessmentProgress = () => {
    const { data, isLoading, isError, error } = useProgress();

    return {
        data: data?.assessments,
        overallProgress: data?.assessments.percentage ?? 0,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get overall progress percentage
 */
export const useOverallProgress = () => {
    const { data, isLoading, isError, error } = useProgress();

    return {
        progress: data?.overallProgress ?? 0,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get individual roadmap progress by ID
 */
export const useRoadmapProgressById = (roadmapId: string) => {
    const { data, isLoading, isError, error } = useProgress();

    const roadmapProgress = data?.roadmaps.items.find(
        (item) => item.roadMapId === roadmapId
    );

    return {
        data: roadmapProgress || null,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get individual assessment progress by ID
 */
export const useAssessmentProgressById = (assessmentId: string) => {
    const { data, isLoading, isError, error } = useProgress();

    const assessmentProgress = data?.assessments.items.find(
        (item) => item.assessmentId === assessmentId
    );

    return {
        data: assessmentProgress || null,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get nested roadmap progress by ID
 */
export const useNestedRoadmapProgressById = (roadmapId: string, nestedRoadmapId: string) => {
    const { data, isLoading, isError, error } = useProgress();

    const roadmapProgress = data?.roadmaps.items.find(
        (item) => item.roadMapId === roadmapId
    );

    const nestedProgress = roadmapProgress?.nestedRoadmaps?.find(
        (nested) => nested.nestedRoadmapId === nestedRoadmapId
    );

    return {
        data: nestedProgress || null,
        isLoading,
        isError,
        error,
    };
};
