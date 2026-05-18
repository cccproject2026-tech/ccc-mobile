// hooks/roadmaps/useRoadmaps.ts
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
import { resolveRoadmapDocumentUrl } from '@/lib/roadmap/helpers';
import { roadmapService } from '@/services/roadmap.service';
import { useAuthStore } from "@/stores";
import { UserRole } from "@/types";
import { RoadmapProgress } from "@/types/progress.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { progressKeys, useProgress } from "../progress/useProgress";

// ============================================
// ROADMAP QUERY KEYS
// ============================================
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
export function mergeRoadmapWithProgress(
    roadmap: Roadmap,
    progressItem: RoadmapProgress | undefined
): Roadmap {
    if (!progressItem || !roadmap.roadmaps) {
        return roadmap;
    }

    // Map nested roadmaps with their progress
    const updatedNestedRoadmaps = roadmap.roadmaps.map((nestedRoadmap) => {
        if (!nestedRoadmap) return nestedRoadmap;

        const nestedProgress = progressItem.nestedRoadmaps?.find(
            (np) => np && np.nestedRoadmapId === nestedRoadmap._id
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
            const response = await apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch roadmaps');
            }
            return response.data.data as Roadmap[];
        },
        staleTime: 0,
        // gcTime: 1000 , // 10 seconds
        retry: 1,
    });
};

// ============================================
// FETCH ASSIGNED ROADMAPS WITH PROGRESS (PASTOR USE)
// ============================================
export const useAssignedRoadmaps = (userId?: string) => {
    const { user } = useAuthStore();
    const targetUserId = userId || user?.id;

    // First, get the progress data to know which roadmaps are assigned
    const {
        data: progressData,
        isLoading: isProgressLoading,
        isError: isProgressError,
        error: progressError
    } = useProgress(targetUserId);

    // Extract assigned roadmap IDs
    const assignedRoadmapIds = progressData?.roadmaps.items.map(item => item.roadMapId) || [];

    // Then fetch all roadmaps, but only when we have the progress data
    const roadmapsQuery = useQuery({
        queryKey: roadmapKeys.assigned(assignedRoadmapIds.join(',')),
        queryFn: async () => {
            const response = await apiClient.get(ENDPOINTS.ROADMAPS.GET_ALL);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch roadmaps');
            }

            const allRoadmaps = response.data.data as Roadmap[];

            // Filter to only assigned roadmaps
            const assignedRoadmaps = allRoadmaps.filter(roadmap =>
                assignedRoadmapIds.includes(roadmap._id)
            );

            return assignedRoadmaps;
        },
        enabled: !!progressData && assignedRoadmapIds.length > 0,
        staleTime: 0,
        // gcTime: 1000 ,
        retry: 1,
    });

    // Merge roadmaps with progress data using useMemo for optimization
    const roadmapsWithProgress = useMemo(() => {
        if (!roadmapsQuery.data || !progressData) {
            return roadmapsQuery.data || [];
        }

        const merged = roadmapsQuery.data.map((roadmap) => {
            const progressItem = progressData?.roadmaps?.items?.find(
                (p) => p && p.roadMapId === roadmap._id
            );
            return mergeRoadmapWithProgress(roadmap, progressItem);
        });
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
export function useRoadmaps(userRole?: UserRole, userId?: string) {
    // If role is not provided, default to 'pastor' for safety
    const role = userRole || 'pastor';

    // Use different hooks based on role
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

// ============================================
// FETCH SINGLE ROADMAP BY ID WITH PROGRESS
// ============================================
export function useRoadmap(roadmapId: string | undefined, userId?: string, includeProgress: boolean = true) {
    const { data: progressData } = useProgress(userId);

    const roadmapQuery = useQuery<Roadmap>({
        queryKey: roadmapKeys.detail(roadmapId || ''),
        queryFn: async () => {
            console.log("📤 Fetching roadmap:", roadmapId);
            const roadmap = await roadmapService.getRoadmapById(roadmapId!);
            console.log("📥 Roadmap fetched:", roadmap);
            return roadmap;
        },
        staleTime: 0,
        enabled: !!roadmapId,
        retry: 1,
    });

    // Merge with progress if requested
    const roadmapWithProgress = useMemo(() => {
        if (!includeProgress || !roadmapQuery.data || !progressData) {
            return roadmapQuery.data;
        }

        const progressItem = progressData?.roadmaps?.items?.find(
            (p) => p && p.roadMapId === roadmapQuery.data._id
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
/**
 * Loads saved extras for a nested task; if empty, falls back to roadmap-level extras (Jumpstart).
 */
export function useRoadmapExtrasWithFallback(
    roadmapId: string | undefined,
    nestedRoadMapItemId?: string,
    userId?: string,
) {
    const nested = useRoadmapExtras(roadmapId, nestedRoadMapItemId, userId);
    const hasNestedValues =
        Array.isArray(nested.data?.extras) && nested.data.extras.length > 0;
    const root = useRoadmapExtras(
        roadmapId,
        undefined,
        userId,
        { enabled: nested.isSuccess && !hasNestedValues },
    );

    const data = hasNestedValues ? nested.data : root.data;
    const isLoading = nested.isLoading || (!hasNestedValues && root.isLoading);
    const isFetching = nested.isFetching || (!hasNestedValues && root.isFetching);
    const error = nested.error ?? root.error;

    return { data, isLoading, isFetching, error, hasNestedValues };
}

export function useRoadmapExtras(
    roadmapId: string | undefined,
    nestedRoadMapItemId?: string,
    userId?: string,
    options?: { enabled?: boolean },
) {
    console.log('useRoadmapExtras----->>>>>>>>>>>>>>', { roadmapId, nestedRoadMapItemId, userId });
    // Validate that roadmapId is a valid truthy string
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
        enabled: isValidRoadmapId === true && (options?.enabled ?? true),
        staleTime: 0,
        // gcTime: 1000 ,
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

            // Filter by field name ("extraName")
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
        // gcTime: 1000 ,
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
        onSuccess: (data, variables) => {
            console.log("✅ Roadmap comment added successfully");

            // Invalidate relevant queries to refresh comments
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
            // Invalidate comments query
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.comments(variables.roadmapId, variables.payload.userId)
            });
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

            // Invalidate relevant queries to refresh queries list
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
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

            // Invalidate relevant queries to refresh queries list
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.detail(variables.roadmapId)
            });
            queryClient.invalidateQueries({
                queryKey: roadmapKeys.all
            });
            queryClient.invalidateQueries({
                queryKey: ["pastor-focus-feedback"],
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

            // Flatten threads → single list of queries with threadId
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
        // and by treating results as fresh briefly.
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
        queryKey: ["roadmap-comments", rid, uid],
        queryFn: () => roadmapService.getRoadmapComments(rid!, uid!),
        enabled: !!rid && !!uid,
        staleTime: 0,
        refetchOnMount: "always",
    });
}
