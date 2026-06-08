
import {
    AddCommentRequest,
    CreateExtrasDto,
    NestedRoadmap,
    ReplyQueryRequest,
    Roadmap,
    RoadmapCommentsThread,
    SubmitQueryRequest,
    UpdateExtrasDto
} from "@/lib/roadmap/types";
import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import {
    applyAssessmentAnswerStatusOverlay,
    applyBackendAssessmentCompletionFromExtras,
    AssessmentAnswerSectionSlice,
    collectDefinitionExtras,
    hasSavableFormExtras,
    isAssessmentOnlyTask,
    normalizeMongoId,
    normalizeNestedTaskStatus,
    resolveRoadmapDocumentUrl,
} from '@/lib/roadmap/helpers';
import { assessmentService } from '@/services/assessment.service';
import { roadmapService } from '@/services/roadmap.service';
import { useAuthStore } from "@/stores";
import { UserRole } from "@/types";
import { RoadmapProgress } from "@/types/progress.types";
import { useMutation, useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { progressKeys, useProgress } from "../progress/useProgress";

// ROADMAP QUERY KEYS

export const roadmapKeys = {
    all: ['roadmaps'] as const,
    lists: () => [...roadmapKeys.all, 'list'] as const,
    list: (filters?: string) => [...roadmapKeys.lists(), { filters }] as const,
    details: () => [...roadmapKeys.all, 'detail'] as const,
    detail: (id: string) => [...roadmapKeys.details(), id] as const,
    queries: (roadmapId: string, userId: string) => [...roadmapKeys.all, 'queries', roadmapId, userId] as const,
    assigned: (userId: string) => [...roadmapKeys.all, 'assigned', userId] as const,
    extras: (roadmapId: string, nestedId?: string, userId?: string) =>
        [...roadmapKeys.all, 'extras', roadmapId, nestedId, userId] as const,
    comments: (roadmapId: string, userId: string) => [...roadmapKeys.all, 'comments', roadmapId, userId] as const,
};

/**
 * Maps progress status to roadmap status with proper type safety
 */
function mapProgressStatus(
    progressStatus: string | undefined | null,
): 'not started' | 'in-progress' | 'completed' | 'submitted' {
    const raw = String(progressStatus ?? '').toLowerCase().replace(/_/g, '-');
    if (raw === 'completed' || raw === 'complete') return 'completed';
    if (raw === 'submitted') return 'submitted';
    if (raw === 'in-progress' || raw === 'in progress') return 'in-progress';
    return 'not started';
}

function resolveNestedTotalSteps(
    nestedRoadmap: NestedRoadmap,
    nestedProgress: { totalSteps?: number },
): number {
    if (typeof nestedProgress.totalSteps === 'number' && nestedProgress.totalSteps > 0) {
        return nestedProgress.totalSteps;
    }
    const templateSteps = collectDefinitionExtras(nestedRoadmap).length;
    return templateSteps > 0 ? templateSteps : 1;
}

function resolveNestedProgressEntry(
    nestedRoadmaps: RoadmapProgress['nestedRoadmaps'],
    nestedId: string,
) {
    if (!nestedRoadmaps?.length || !nestedId) return undefined;
    return nestedRoadmaps.find((np) => {
        if (!np) return false;
        const progressId = normalizeMongoId(
            np.nestedRoadmapId ?? (np as { id?: unknown }).id,
        );
        return progressId === nestedId;
    });
}

/**
 * Merges roadmap with its progress data.
 * Uses step counts as the source of truth for completion when the backend
 * status field lags behind (known issue documented in PROGRESS_AND_SAVE_FLOW.md).
 */
export function mergeRoadmapWithProgress(
    roadmap: Roadmap,
    progressItem: RoadmapProgress | undefined
): Roadmap {
    if (!progressItem || !roadmap.roadmaps) {
        return roadmap;
    }

    
    const updatedNestedRoadmaps = roadmap.roadmaps.map((nestedRoadmap) => {
        if (!nestedRoadmap) return nestedRoadmap;

        const nestedId = normalizeMongoId(nestedRoadmap._id);
        const nestedProgress = resolveNestedProgressEntry(
            progressItem.nestedRoadmaps,
            nestedId,
        );

        if (!nestedProgress) {
            return nestedRoadmap;
        }

        const effectiveTotal = resolveNestedTotalSteps(nestedRoadmap, nestedProgress);
        const stepsComplete =
            nestedProgress.status === 'completed' ||
            (effectiveTotal > 0 &&
                nestedProgress.completedSteps >= effectiveTotal);
        const mappedStatus = mapProgressStatus(nestedProgress.status);
        const resolvedStatus: 'not started' | 'in-progress' | 'completed' | 'submitted' =
            stepsComplete
                ? 'completed'
                : mappedStatus === 'submitted'
                  ? 'submitted'
                  : nestedProgress.completedSteps > 0
                    ? 'in-progress'
                    : mappedStatus;

        return {
            ...nestedRoadmap,
            status: resolvedStatus,
            totalSteps: effectiveTotal,
        } as NestedRoadmap;
    });

    const parentEffectiveTotal =
        progressItem.totalSteps > 0
            ? progressItem.totalSteps
            : updatedNestedRoadmaps.reduce(
                  (sum, nested) => sum + resolveNestedTotalSteps(nested, { totalSteps: 0 }),
                  0,
              ) || 1;
    const parentStepsComplete =
        progressItem.status === 'completed' ||
        (parentEffectiveTotal > 0 &&
            progressItem.completedSteps >= parentEffectiveTotal);
    const resolvedParentStatus: 'not started' | 'in-progress' | 'completed' | 'submitted' =
        parentStepsComplete
            ? 'completed'
            : mapProgressStatus(progressItem.status);

    
    return {
        ...roadmap,
        status: resolvedParentStatus,
        totalSteps: parentEffectiveTotal,
        roadmaps: updatedNestedRoadmaps,
    };
}

type AssessmentExtrasTarget = {
    roadMapId: string;
    task: NestedRoadmap;
};

type AssessmentAnswerTarget = {
    assessmentId: string;
};

function collectAssessmentOnlyTaskAssessmentIds(
    roadmaps: Roadmap | Roadmap[] | undefined | null,
): AssessmentAnswerTarget[] {
    const list = Array.isArray(roadmaps) ? roadmaps : roadmaps ? [roadmaps] : [];
    const ids = new Set<string>();

    for (const roadmap of list) {
        for (const task of roadmap.roadmaps ?? []) {
            if (!task?._id) continue;
            const defExtras = collectDefinitionExtras(task, roadmap);
            if (!isAssessmentOnlyTask(defExtras)) continue;
            const assessmentId = normalizeMongoId(defExtras[0]?.assessmentId);
            if (assessmentId) ids.add(assessmentId);
        }
    }

    return [...ids].map((assessmentId) => ({ assessmentId }));
}

function collectIncompleteAssessmentOnlyTasks(
    roadmaps: Roadmap | Roadmap[] | undefined | null,
): AssessmentExtrasTarget[] {
    const list = Array.isArray(roadmaps) ? roadmaps : roadmaps ? [roadmaps] : [];
    const targets: AssessmentExtrasTarget[] = [];

    for (const roadmap of list) {
        const roadMapId = normalizeMongoId(roadmap._id);
        if (!roadMapId) continue;

        for (const task of roadmap.roadmaps ?? []) {
            if (!task?._id) continue;
            const defExtras = collectDefinitionExtras(task, roadmap);
            if (!isAssessmentOnlyTask(defExtras)) continue;
            if (normalizeNestedTaskStatus(task.status) === 'completed') continue;
            targets.push({ roadMapId, task });
        }
    }

    return targets;
}

function applyAssessmentExtrasOverlay(
    roadmaps: Roadmap | Roadmap[] | undefined | null,
    extrasByPhaseAndTask: Map<string, Record<string, { extras?: unknown[] }>>,
): Roadmap | Roadmap[] | undefined | null {
    if (!roadmaps) return roadmaps;

    const applyOne = (roadmap: Roadmap): Roadmap => {
        const phaseId = normalizeMongoId(roadmap._id);
        const extrasByTaskId = extrasByPhaseAndTask.get(phaseId);
        if (!extrasByTaskId || Object.keys(extrasByTaskId).length === 0) {
            return roadmap;
        }
        return applyBackendAssessmentCompletionFromExtras(roadmap, extrasByTaskId);
    };

    if (Array.isArray(roadmaps)) {
        return roadmaps.map(applyOne);
    }
    return applyOne(roadmaps);
}

/** Fetch saved extras for assessment-only tasks and overlay backend CDP completion. */
function useAssessmentExtrasCompletionOverlay(
    roadmaps: Roadmap | Roadmap[] | undefined | null,
    userId: string | undefined,
    enabled: boolean,
) {
    const queryClient = useQueryClient();
    const targets = useMemo(
        () => collectIncompleteAssessmentOnlyTasks(roadmaps),
        [roadmaps],
    );
    const targetsKey = useMemo(
        () =>
            targets
                .map(
                    (t) =>
                        `${t.roadMapId}:${normalizeMongoId(t.task._id)}`,
                )
                .sort()
                .join('|'),
        [targets],
    );

    const assessmentExtrasQueries = useQueries({
        queries: targets.map(({ roadMapId, task }) => ({
            queryKey: roadmapKeys.extras(
                roadMapId,
                normalizeMongoId(task._id),
                userId || '',
            ),
            queryFn: () =>
                roadmapService.getRoadmapExtras(
                    roadMapId,
                    normalizeMongoId(task._id),
                    userId,
                ),
            enabled: enabled && !!userId && !!roadMapId && !!task._id,
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
        })),
    });

    const extrasDataVersion = assessmentExtrasQueries
        .map((q) => `${q.dataUpdatedAt}:${q.fetchStatus}`)
        .join('|');

    const roadmapsWithAssessmentCompletion = useMemo(() => {
        if (!roadmaps || targets.length === 0) return roadmaps;

        const extrasByPhaseAndTask = new Map<string, Record<string, { extras?: unknown[] }>>();
        targets.forEach(({ roadMapId, task }, index) => {
            const queryResult = assessmentExtrasQueries[index];
            if (!queryResult?.data) return;
            const phaseId = normalizeMongoId(roadMapId);
            const taskId = normalizeMongoId(task._id);
            if (!extrasByPhaseAndTask.has(phaseId)) {
                extrasByPhaseAndTask.set(phaseId, {});
            }
            extrasByPhaseAndTask.get(phaseId)![taskId] = queryResult.data;
        });

        if (extrasByPhaseAndTask.size === 0) return roadmaps;
        return applyAssessmentExtrasOverlay(roadmaps, extrasByPhaseAndTask);
    }, [roadmaps, targets, extrasDataVersion]);

    const refetchAssessmentExtras = useCallback(async () => {
        if (!targets.length) return;
        await Promise.all(
            targets.map(({ roadMapId, task }) =>
                queryClient.refetchQueries({
                    queryKey: roadmapKeys.extras(
                        roadMapId,
                        normalizeMongoId(task._id),
                        userId || '',
                    ),
                }),
            ),
        );
    }, [queryClient, userId, targets, targetsKey]);

    const isAssessmentExtrasFetching = assessmentExtrasQueries.some((q) => q.isFetching);

    return {
        data: roadmapsWithAssessmentCompletion,
        refetchAssessmentExtras,
        isAssessmentExtrasFetching,
    };
}

/** submitted / completed from assessment answers when progress or extras lag behind CDP. */
function useAssessmentAnswerStatusOverlay(
    roadmaps: Roadmap | Roadmap[] | undefined | null,
    userId: string | undefined,
    enabled: boolean,
) {
    const queryClient = useQueryClient();
    const targets = useMemo(
        () => collectAssessmentOnlyTaskAssessmentIds(roadmaps),
        [roadmaps],
    );

    const answerQueries = useQueries({
        queries: targets.map(({ assessmentId }) => ({
            queryKey: ['answers', assessmentId, userId || ''],
            queryFn: async () => {
                const res = await assessmentService.fetchAnswers(
                    assessmentId,
                    userId!,
                );
                return res?.data?.sections as AssessmentAnswerSectionSlice[] | undefined;
            },
            enabled: enabled && !!userId && !!assessmentId,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
        })),
    });

    const answersVersion = answerQueries
        .map((q) => `${q.dataUpdatedAt}:${q.fetchStatus}`)
        .join('|');

    const roadmapsWithAnswerStatus = useMemo(() => {
        if (!roadmaps || targets.length === 0) return roadmaps;

        const answersByAssessmentId: Record<string, AssessmentAnswerSectionSlice[] | undefined> =
            {};
        targets.forEach(({ assessmentId }, index) => {
            const sections = answerQueries[index]?.data;
            if (sections?.length) {
                answersByAssessmentId[assessmentId] = sections;
            }
        });

        if (Object.keys(answersByAssessmentId).length === 0) return roadmaps;

        if (Array.isArray(roadmaps)) {
            return roadmaps.map((r) =>
                applyAssessmentAnswerStatusOverlay(r, answersByAssessmentId),
            );
        }
        return applyAssessmentAnswerStatusOverlay(roadmaps, answersByAssessmentId);
    }, [roadmaps, targets, answersVersion]);

    const refetchAssessmentAnswers = useCallback(async () => {
        if (!targets.length || !userId) return;
        await Promise.all(
            targets.map(({ assessmentId }) =>
                queryClient.invalidateQueries({
                    queryKey: ['answers', assessmentId, userId],
                }),
            ),
        );
    }, [queryClient, targets, userId]);

    const isAssessmentAnswersFetching = answerQueries.some((q) => q.isFetching);

    return {
        data: roadmapsWithAnswerStatus,
        refetchAssessmentAnswers,
        isAssessmentAnswersFetching,
    };
}

export const useAllRoadmaps = () => {
    return useQuery({
        queryKey: roadmapKeys.lists(),
        queryFn: async () => {
            const response = await apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch roadmaps');
            }
            return response.data.data as Roadmap[];
        },
        staleTime: 0,
        
        retry: 1,
    });
};

export const useAssignedRoadmaps = (userId?: string) => {
    const { user } = useAuthStore();
    const targetUserId = userId || user?.id;

    // First, get the progress data to know which roadmaps are assigned
    const {
        data: progressData,
        isLoading: isProgressLoading,
        isError: isProgressError,
        error: progressError,
        refetch: refetchProgress,
        isFetching: isProgressFetching,
    } = useProgress(targetUserId);

    // Extract assigned roadmap IDs (sorted key avoids duplicate fetches when API order changes)
    const assignedRoadmapIdsKey = useMemo(() => {
        const ids = (progressData?.roadmaps.items ?? [])
            .map((item) => normalizeMongoId(item.roadMapId))
            .filter(Boolean);
        return [...new Set(ids)].sort().join(',');
    }, [progressData?.roadmaps.items]);

    // Then fetch all roadmaps, but only when we have the progress data
    const roadmapsQuery = useQuery({
        queryKey: roadmapKeys.assigned(assignedRoadmapIdsKey),
        queryFn: async () => {
            const response = await apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch roadmaps');
            }

            const allRoadmaps = response.data.data as Roadmap[];

            
            const assignedIdSet = new Set(
                assignedRoadmapIdsKey.split(',').filter(Boolean),
            );
            const assignedRoadmaps = allRoadmaps.filter((roadmap) =>
                assignedIdSet.has(normalizeMongoId(roadmap._id)),
            );

            return assignedRoadmaps;
        },
        enabled: !!progressData && assignedRoadmapIdsKey.length > 0,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    
    const roadmapsWithProgress = useMemo(() => {
        if (!roadmapsQuery.data || !progressData) {
            return roadmapsQuery.data || [];
        }

        const merged = roadmapsQuery.data.map((roadmap) => {
            const progressItem = progressData?.roadmaps?.items?.find(
                (p) => p && normalizeMongoId(p.roadMapId) === normalizeMongoId(roadmap._id),
            );
            return mergeRoadmapWithProgress(roadmap, progressItem);
        });
        return merged;
    }, [roadmapsQuery.data, progressData]);

    const {
        data: roadmapsWithAnswerStatus,
        refetchAssessmentAnswers,
        isAssessmentAnswersFetching,
    } = useAssessmentAnswerStatusOverlay(
        roadmapsWithProgress,
        targetUserId,
        !!roadmapsWithProgress?.length,
    );

    const refetch = useCallback(async () => {
        await Promise.all([
            refetchProgress(),
            roadmapsQuery.refetch(),
            refetchAssessmentAnswers(),
        ]);
    }, [refetchProgress, roadmapsQuery.refetch, refetchAssessmentAnswers]);

    return {
        data: (roadmapsWithAnswerStatus ?? roadmapsWithProgress) as Roadmap[],
        isLoading: isProgressLoading || roadmapsQuery.isLoading,
        isError: isProgressError || roadmapsQuery.isError,
        error: progressError || roadmapsQuery.error,
        refetch,
        isRefetching:
            isProgressFetching ||
            roadmapsQuery.isRefetching ||
            isAssessmentAnswersFetching,
        progressData,
        isProgressLoading,
        isRoadmapsLoading: roadmapsQuery.isLoading,
    };
};

/** Read assigned roadmaps from React Query cache without starting a new fetch chain. */
export function useAssignedRoadmapsSnapshot(): Roadmap[] {
    const queryClient = useQueryClient();

    return useSyncExternalStore(
        (onStoreChange) => queryClient.getQueryCache().subscribe(onStoreChange),
        () => {
            const entries = queryClient.getQueriesData<Roadmap[]>({
                queryKey: [...roadmapKeys.all, 'assigned'],
            });
            const hit = entries.find(([, data]) => Array.isArray(data) && data.length > 0);
            return hit?.[1] ?? [];
        },
        () => [],
    );
}

export function useRoadmaps(userRole?: UserRole, userId?: string) {
    // If role is not provided, default to 'pastor' for safety
    const role = userRole || 'pastor';

    
    const allRoadmapsQuery = useAllRoadmaps();
    const assignedRoadmapsQuery = useAssignedRoadmaps(userId);

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

export function useRoadmap(roadmapId: string | undefined, userId?: string, includeProgress: boolean = true) {
    const {
        data: progressData,
        refetch: refetchProgress,
        isFetching: isProgressFetching,
    } = useProgress(userId);

    const roadmapQuery = useQuery<Roadmap>({
        queryKey: roadmapKeys.detail(roadmapId || ''),
        queryFn: () => roadmapService.getRoadmapById(roadmapId!),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        enabled: !!roadmapId,
        retry: 1,
    });

    
    const roadmapWithProgress = useMemo(() => {
        if (!includeProgress || !roadmapQuery.data || !progressData) {
            return roadmapQuery.data;
        }

        const progressItem = progressData?.roadmaps?.items?.find(
            (p) => p && normalizeMongoId(p.roadMapId) === normalizeMongoId(roadmapQuery.data._id),
        );

        return mergeRoadmapWithProgress(roadmapQuery.data, progressItem);
    }, [roadmapQuery.data, progressData, includeProgress]);

    const {
        data: roadmapWithAssessmentCompletion,
        refetchAssessmentExtras,
        isAssessmentExtrasFetching,
    } = useAssessmentExtrasCompletionOverlay(
        roadmapWithProgress,
        userId,
        !!includeProgress && !!roadmapWithProgress,
    );

    const {
        data: roadmapWithAnswerStatus,
        refetchAssessmentAnswers,
        isAssessmentAnswersFetching,
    } = useAssessmentAnswerStatusOverlay(
        roadmapWithAssessmentCompletion ?? roadmapWithProgress,
        userId,
        !!includeProgress && !!(roadmapWithAssessmentCompletion ?? roadmapWithProgress),
    );

    const mergedRoadmap =
        (roadmapWithAnswerStatus ??
            roadmapWithAssessmentCompletion ??
            roadmapWithProgress) as Roadmap | undefined;

    /** Light refresh (focus): progress + template only; extras stay cached up to staleTime. */
    const refetchLight = useCallback(async () => {
        await Promise.all([refetchProgress(), roadmapQuery.refetch()]);
    }, [refetchProgress, roadmapQuery.refetch]);

    /** Pull-to-refresh: also refresh assessment extras used for CDP completion overlay. */
    const refetch = useCallback(async () => {
        await Promise.all([
            refetchLight(),
            refetchAssessmentExtras(),
            refetchAssessmentAnswers(),
        ]);
    }, [refetchLight, refetchAssessmentExtras, refetchAssessmentAnswers]);

    return {
        ...roadmapQuery,
        data: mergedRoadmap,
        refetch,
        refetchLight,
        isRefetching:
            isProgressFetching ||
            roadmapQuery.isRefetching ||
            isAssessmentExtrasFetching ||
            isAssessmentAnswersFetching,
    };
}

/**
 * Hook for fetching roadmap extras/saved form data
 */
/**
 * Loads saved extras for a nested task; if empty, falls back to roadmap-level extras (Jumpstart).
 */
export function useRoadmapExtrasWithFallback(
    roadmapId: string | undefined,
    nestedRoadMapItemId?: string,
    userId?: string,
    options?: { enabled?: boolean },
) {
    const extrasEnabled = options?.enabled ?? true;
    const nested = useRoadmapExtras(roadmapId, nestedRoadMapItemId, userId, {
        enabled: extrasEnabled,
    });
    const hasNestedExtrasArray =
        Array.isArray(nested.data?.extras) && nested.data.extras.length > 0;
    const hasNestedSavableExtras =
        hasNestedExtrasArray && hasSavableFormExtras(nested.data?.extras);
    const nestedOnlyNonFormMarkers =
        hasNestedExtrasArray && !hasNestedSavableExtras;
    const root = useRoadmapExtras(
        roadmapId,
        undefined,
        userId,
        {
            enabled:
                extrasEnabled &&
                nested.isSuccess &&
                (!hasNestedExtrasArray || nestedOnlyNonFormMarkers),
        },
    );

    const roadmapLevelExtrasExist =
        root.isSuccess &&
        Array.isArray(root.data?.extras) &&
        root.data.extras.length > 0;

    const data = hasNestedExtrasArray ? nested.data : root.data;
    const isLoading = nested.isLoading || (!hasNestedExtrasArray && root.isLoading);
    const isFetching = nested.isFetching || (!hasNestedExtrasArray && root.isFetching);
    const error = nested.error ?? root.error;

    return {
        data,
        isLoading,
        isFetching,
        error,
        hasNestedValues: hasNestedExtrasArray,
        hasNestedSavableExtras,
        roadmapLevelExtrasExist,
    };
}

export function useRoadmapExtras(
    roadmapId: string | undefined,
    nestedRoadMapItemId?: string,
    userId?: string,
    options?: { enabled?: boolean },
) {
    
    const isValidRoadmapId = !!roadmapId && typeof roadmapId === 'string' && roadmapId.trim() !== '';

    // Only pass valid IDs (not undefined, not empty string, not "undefined")
    const validNestedId = nestedRoadMapItemId &&
        typeof nestedRoadMapItemId === 'string' &&
        nestedRoadMapItemId !== 'undefined' &&
        nestedRoadMapItemId.trim() !== ''
        ? nestedRoadMapItemId
        : undefined;

    const validUserId = userId &&
        typeof userId === 'string' &&
        userId !== 'undefined' &&
        userId.trim() !== ''
        ? userId
        : undefined;

    return useQuery({
        queryKey: roadmapKeys.extras(roadmapId || '', validNestedId, validUserId),
        queryFn: () => {
            // Only pass valid values - explicitly pass undefined if not valid (service will filter)
            const finalNestedId = validNestedId || undefined;
            const finalUserId = validUserId || undefined;

            console.log('📤 Fetching roadmap extras:', {
                roadmapId,
                nestedRoadMapItemId: finalNestedId || 'not provided',
                userId: finalUserId || 'not provided'
            });

            return roadmapService.getRoadmapExtras(
                roadmapId!,
                finalNestedId,
                finalUserId
            );
        },
        enabled:
            isValidRoadmapId === true &&
            !!validUserId &&
            (options?.enabled ?? true),
        staleTime: 0,
        
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

            
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.extras(variables.roadMapId, variables.nestedRoadMapItemId, variables.userId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadMapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: progressKeys.all
            });
        },
    });
}
export function useUploadRoadmapDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roadMapId,
            userId,
            nestedRoadMapItemId,
            extraName,
            file
        }: {
            roadMapId: string;
            userId: string;
            nestedRoadMapItemId: string;
            extraName: string;
            file: any;
        }) =>
            roadmapService.uploadDocument(
                roadMapId,
                userId,
                nestedRoadMapItemId,
                extraName,
                file
            ),

        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({
                queryKey: [
                    "roadmap-documents",
                    vars.roadMapId,
                    vars.nestedRoadMapItemId,
                    vars.userId,
                    vars.extraName,
                ],
            });
        },
    });
}

export const useRoadmapDocuments = (
    roadMapId?: string,
    nestedId?: string,
    userId?: string,
    extraName?: string
) => {
    return useQuery({
        queryKey: ["roadmap-documents", roadMapId, nestedId, userId, extraName],
        queryFn: async () => {
            if (!roadMapId || !nestedId || !userId) return [];

            const res = await roadmapService.getRoadmapDocuments(
                roadMapId,
                userId,
                nestedId
            );

            // Backend returns { success, message, data: [...] } or { success, message, documents: [...] }
            const allBatches = res.data ?? res.documents ?? [];

            // Flatten into single array of files and attach batch info
            const flatFiles = allBatches.flatMap((batch: any) =>
                (batch.files ?? []).map((f: any, fileIndex: number) => {
                    const rawUrl =
                        f.fileUrl ?? f.url ?? f.path ?? f.location ?? f.secureUrl ?? '';
                    return {
                        ...f,
                        _id: String(
                            f._id ??
                                f.id ??
                                `${batch.uploadBatchId ?? batch._id ?? 'batch'}-${fileIndex}-${f.fileName ?? f.name ?? 'file'}`,
                        ),
                        fileName: f.fileName ?? f.name ?? 'File',
                        fileUrl: resolveRoadmapDocumentUrl(rawUrl),
                        fileType: f.fileType ?? f.mimeType ?? f.type ?? '',
                        extraName: batch.name,
                        uploadBatchId:
                            batch.uploadBatchId ??
                            batch._id ??
                            batch.id ??
                            f.uploadBatchId,
                    };
                }),
            );

            console.log("Fetched and flattened roadmap documents:", flatFiles);

            
            if (extraName) {
                const norm = (v: any) => String(v ?? "").trim().toLowerCase();
                const wanted = norm(extraName);
                return flatFiles.filter((f: any) => norm(f.extraName) === wanted);
            }
            console.log("Flattened roadmap documents:----->>>>>>>>>>>>>>", flatFiles);

            return flatFiles;
        },
        enabled: !!roadMapId && !!nestedId && !!userId,
        staleTime: 0,
        
    });
};

export const useDeleteRoadmapDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roadMapId,
            userId,
            nestedId,
            fileUrl,
            uploadBatchId
        }: {
            roadMapId: string;
            userId: string;
            nestedId: string;
            fileUrl: string;
            uploadBatchId: string;
        }) =>
            roadmapService.deleteRoadmapDocument(
                roadMapId,
                userId,
                nestedId,
                fileUrl,
                uploadBatchId
            ),

        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({
                queryKey: ["roadmap-documents", vars.roadMapId],
            });
        },
    });
};

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

            
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.extras(variables.roadMapId, variables.nestedRoadMapItemId, variables.userId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadMapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: progressKeys.all
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

/**
 * Hook for adding a comment to a roadmap
 */
export function useAddRoadmapComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roadmapId,
            payload
        }: {
            roadmapId: string;
            payload: AddCommentRequest;
        }) => roadmapService.addRoadmapComment(roadmapId, payload),
        onSuccess: (response, variables) => {
            console.log("✅ Roadmap comment added successfully");

            const commentsQueryKey = roadmapKeys.comments(
                variables.roadmapId,
                variables.payload.userId,
            );
            const thread = response?.data;
            if (thread && Array.isArray(thread.comments)) {
                queryClient.setQueryData<RoadmapCommentsThread>(commentsQueryKey, {
                    _id: thread._id,
                    userId: thread.userId,
                    roadMapId: thread.roadMapId,
                    comments: thread.comments,
                });
            }

            void queryClient.refetchQueries({ queryKey: commentsQueryKey });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId),
            });
            queryClient.invalidateQueries({ queryKey: roadmapKeys.all });
            queryClient.invalidateQueries({
                queryKey: ["pastor-focus-feedback"],
            });
        },
    });
}

/**
 * Hook for submitting a query to a roadmap
 */
export function useSubmitRoadmapQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roadmapId,
            payload
        }: {
            roadmapId: string;
            payload: SubmitQueryRequest;
        }) => roadmapService.submitRoadmapQuery(roadmapId, payload),
        onSuccess: (data, variables) => {
            console.log("✅ Roadmap query submitted successfully");

            
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.queries(variables.roadmapId, variables.payload.userId),
            });
            queryClient.invalidateQueries({
                queryKey: ["pastor-focus-feedback"],
            });
        },
    });
}

export function useReplyRoadmapQuery() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roadmapId,
            queryId,
            payload
        }: {
            roadmapId: string;
            queryId: string;
            payload: ReplyQueryRequest;
        }) => roadmapService.replyRoadmapQuery(roadmapId, queryId, payload),
        onSuccess: (data, variables) => {
            console.log("✅ Roadmap query reply submitted successfully");

            
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: ["pastor-focus-feedback"],
            });
            queryClient.invalidateQueries({
                queryKey: [...roadmapKeys.all, "queries", variables.roadmapId],
            });
        },
    });
}

export const useRoadmapQueries = (roadmapId?: string, userId?: string) => {
    return useQuery({
        queryKey: roadmapKeys.queries(roadmapId!, userId!),
        queryFn: async () => {
            if (!roadmapId || !userId) return [];

            const threads = await roadmapService.getRoadmapQueries(roadmapId, userId);

            
            const flat = threads.flatMap(t =>
                t.queries.map(q => ({
                    ...q,
                    // Backend sometimes varies casing ("PENDING"/"Answered"); normalize so UI filtering is stable.
                    status: String((q as any)?.status ?? "").toLowerCase(),
                    threadId: t._id
                }))
            );

            return flat;
        },
        enabled: !!roadmapId && !!userId,
        // Avoid hammering the backend (429/503) by not refetching on focus
        
        staleTime: 60000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
            const status = error?.statusCode ?? error?.response?.status;
            if (status === 429) return false;
            return failureCount < 1;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    });
};

export function useRoadmapComments(
    roadMapId?: string | string[],
    userId?: string | string[],
) {
    const rid =
        typeof roadMapId === "string"
            ? roadMapId
            : Array.isArray(roadMapId)
              ? roadMapId[0]
              : undefined;
    const uid =
        typeof userId === "string"
            ? userId
            : Array.isArray(userId)
              ? userId[0]
              : undefined;

    return useQuery<RoadmapCommentsThread>({
        queryKey: roadmapKeys.comments(rid!, uid!),
        queryFn: () => roadmapService.getRoadmapComments(rid!, uid!),
        enabled: !!rid && !!uid,
        staleTime: 0,
        refetchOnMount: "always",
    });
}
