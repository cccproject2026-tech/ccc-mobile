import { progressService } from "@/services/progress.service";
import { assessmentService } from "@/services/assessment.service";
import { useAuthStore } from "@/stores/auth.store";
import { AddFinalCommentRequest, DeleteFinalCommentRequest, ProgressData, UpdateFinalCommentRequest } from "@/types/progress.types";
import { applyAssessmentAnswerOverlayToProgress } from "@/lib/progress/applyAssessmentAnswerOverlay";
import { deriveOverallProgressPercent, deriveAssessmentBucketPercent } from "@/lib/progress/deriveOverallProgressPercent";
import type { AssessmentAnswerSectionSlice } from "@/lib/roadmap/helpers";
import { getHttpStatus } from "@/utils/apiConcurrency";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

async function fetchAssessmentAnswersMap(
    assessmentIds: string[],
    userId: string,
): Promise<Map<string, AssessmentAnswerSectionSlice[] | undefined>> {
    const answersByAssessmentId = new Map<string, AssessmentAnswerSectionSlice[] | undefined>();

    await Promise.all(
        assessmentIds.map(async (assessmentId) => {
            try {
                const response = await assessmentService.fetchAnswers(assessmentId, userId);
                if (response?.data?.sections?.length) {
                    answersByAssessmentId.set(assessmentId, response.data.sections);
                }
            } catch {
                // No saved answers for this assessment yet.
            }
        }),
    );

    return answersByAssessmentId;
}

// PROGRESS QUERY KEYS

export const progressKeys = {
    all: ['progress'] as const,
    user: (userId: string) => [...progressKeys.all, 'user', userId] as const,
    roadmaps: (userId: string) => [...progressKeys.all, 'roadmaps', userId] as const,
    assessments: (userId: string) => [...progressKeys.all, 'assessments', userId] as const,
    finalComments: (userId: string) => [...progressKeys.all, 'final-comments', userId] as const,
};

/** Retrying 429 amplifies rate-limit storms — only retry transient failures once. */
const shouldRetryProgressQuery = (failureCount: number, error: unknown) => {
    if (getHttpStatus(error) === 429) return false;
    return failureCount < 1;
};

const sharedProgressQueryOptions = {
    staleTime: 0,
    retry: shouldRetryProgressQuery,
    refetchOnWindowFocus: false,
} as const;

async function buildProgressDataFromResponse(
    data: NonNullable<Awaited<ReturnType<typeof progressService.getProgress>>['data']>,
    userId: string,
): Promise<ProgressData> {
    const assessmentIds = (data.assessments || [])
        .map((item) => item.assessmentId)
        .filter(Boolean);
    const answersByAssessmentId = await fetchAssessmentAnswersMap(assessmentIds, userId);
    const adjustedData = applyAssessmentAnswerOverlayToProgress(data, answersByAssessmentId);

    return {
        overallProgress: deriveOverallProgressPercent(adjustedData),
        roadmaps: {
            total: adjustedData.totalRoadmaps ?? 0,
            completed: adjustedData.completedRoadmaps ?? 0,
            percentage: adjustedData.overallRoadmapProgress ?? 0,
            items: adjustedData.roadmaps || [],
        },
        assessments: {
            total: adjustedData.totalAssessments ?? 0,
            completed:
                adjustedData.assessments?.filter(
                    (item) => item.status?.toLowerCase() === 'completed',
                ).length ?? 0,
            percentage: deriveAssessmentBucketPercent(adjustedData),
            items: adjustedData.assessments || [],
        },
        finalComments: adjustedData.finalComments || [],
    };
}

export const useProgress = (userId?: string) => {
    const { user } = useAuthStore();
    const targetUserId = userId || user?.id;

    return useQuery({
        queryKey: progressKeys.user(targetUserId || ''),
        queryFn: async () => {
            if (!targetUserId) throw new Error("User ID is missing");

            const response = await progressService.getProgress(targetUserId);

            
            if (!response.success || !response.data) {
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
                    },
                    finalComments: []
                };
            }

            const data = response.data;
            return buildProgressDataFromResponse(data, targetUserId);
        },
        enabled: !!targetUserId,
        ...sharedProgressQueryOptions,
    });
};

/**
 * Hook to get assigned roadmap IDs for the current user
 */
export const useAssignedRoadmapIds = (userId?: string) => {
    const { data, isLoading, isError, error } = useProgress(userId);

    const roadmapIds = data?.roadmaps?.items?.map(item => item.roadMapId) || [];

    return {
        roadmapIds,
        isLoading,
        isError,
        error,
        data,
    };
};

/**
 * Hook to get only roadmap progress
 */
export const useRoadmapProgress = (userId?: string) => {
    const { data, isLoading, isError, error } = useProgress(userId);

    return {
        data: data?.roadmaps,
        overallProgress: data?.roadmaps?.percentage ?? 0,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get only assessment progress
 */
export const useAssessmentProgress = (userId?: string) => {
    const { data, isLoading, isError, error } = useProgress(userId);

    return {
        data: data?.assessments,
        overallProgress: data?.assessments?.percentage ?? 0,
        isLoading,
        isError,
        error,
    };
};

/**
 * Hook to get overall progress percentage
 */
export const useOverallProgress = (userId?: string) => {
    const { data, isLoading, isError, error } = useProgress(userId);

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
export const useRoadmapProgressById = (roadmapId: string, userId?: string) => {
    const { data, isLoading, isError, error } = useProgress(userId);

    const roadmapProgress = data?.roadmaps?.items?.find(
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
export const useAssessmentProgressById = (assessmentId: string, userId?: string) => {
    const { data, isLoading, isError, error } = useProgress(userId);

    const assessmentProgress = data?.assessments?.items?.find(
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
export const useNestedRoadmapProgressById = (roadmapId: string, nestedRoadmapId: string, userId?: string) => {
    const { data, isLoading, isError, error } = useProgress(userId);

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

/**
 * Hook to get progress for a specific user (for mentors viewing mentee progress)
 */
export const useProgressByUserId = (userId: string | undefined) => {
    return useQuery({
        queryKey: progressKeys.user(userId || ''),
        queryFn: async () => {
            if (!userId) throw new Error("User ID is missing");

            const response = await progressService.getProgress(userId);

            
            if (!response.success || !response.data) {
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
                    },
                    finalComments: []
                };
            }

            const data = response.data;
            return buildProgressDataFromResponse(data, userId);
        },
        enabled: !!userId,
        ...sharedProgressQueryOptions,
    });
};

/**
 * Hook to get final comments for a user's progress
 */
export const useFinalComments = (userId: string | undefined) => {
    return useQuery({
        queryKey: progressKeys.finalComments(userId || ''),
        queryFn: async () => {
            if (!userId) throw new Error("User ID is missing");
            const response = await progressService.getFinalComments(userId);
            return response.data;
        },
        enabled: !!userId,
        staleTime: 0,
        
    });
};

/**
 * Hook to add final comment for a user's progress
 */
export const useAddFinalComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AddFinalCommentRequest) => progressService.addFinalComment(payload),
        onSuccess: (data, variables) => {
            // Invalidate progress queries for the user to refetch updated data
            queryClient.invalidateQueries({ queryKey: progressKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.finalComments(variables.userId) });
            console.log("✅ Final comment added successfully");
        },
        onError: (error) => {
            console.error("❌ Failed to add final comment:", error);
        },
    });
};

/**
 * Hook to update an existing final comment
 */
export const useUpdateFinalComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateFinalCommentRequest) => progressService.updateFinalComment(payload),
        onSuccess: (data, variables) => {
            // Invalidate progress queries for the user to refetch updated data
            queryClient.invalidateQueries({ queryKey: progressKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.finalComments(variables.userId) });
            console.log("✅ Final comment updated successfully");
        },
        onError: (error) => {
            console.error("❌ Failed to update final comment:", error);
        },
    });
};

/**
 * Hook to delete a final comment
 */
export const useDeleteFinalComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DeleteFinalCommentRequest) => progressService.deleteFinalComment(payload),
        onSuccess: (data, variables) => {
            // Invalidate progress queries for the user to refetch updated data
            queryClient.invalidateQueries({ queryKey: progressKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.finalComments(variables.userId) });
            console.log("✅ Final comment deleted successfully");
        },
        onError: (error) => {
            console.error("❌ Failed to delete final comment:", error);
        },
    });
};
