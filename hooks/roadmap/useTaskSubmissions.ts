import { roadmapService } from "@/services/roadmap.service";
import type { CreateSubmissionDto, TaskSubmission } from "@/lib/roadmap/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roadmapKeys } from "../roadmaps/useRoadmaps";
import { progressKeys } from "../progress/useProgress";

export const submissionKeys = {
    all: ["task-submissions"] as const,
    list: (roadMapId: string, nestedId: string, userId: string) =>
        [...submissionKeys.all, "list", roadMapId, nestedId, userId] as const,
    latest: (roadMapId: string, nestedId: string, userId: string) =>
        [...submissionKeys.all, "latest", roadMapId, nestedId, userId] as const,
    detail: (submissionId: string) =>
        [...submissionKeys.all, "detail", submissionId] as const,
};

/**
 * Fetches all submissions for a roadmap task, ordered by submissionNumber descending.
 * Gracefully returns empty array if the submissions API is not yet available.
 */
export function useTaskSubmissions(
    roadMapId?: string,
    nestedRoadMapItemId?: string,
    userId?: string,
) {
    return useQuery<TaskSubmission[]>({
        queryKey: submissionKeys.list(roadMapId ?? "", nestedRoadMapItemId ?? "", userId ?? ""),
        queryFn: async () => {
            try {
                return await roadmapService.getTaskSubmissions(
                    roadMapId!,
                    nestedRoadMapItemId!,
                    userId!,
                );
            } catch {
                return [];
            }
        },
        enabled: !!roadMapId && !!nestedRoadMapItemId && !!userId,
        staleTime: 0,
        retry: false,
    });
}

/**
 * Fetches the latest (most recent) submission for a task.
 * Gracefully returns null if the submissions API is not yet available (404).
 */
export function useLatestSubmission(
    roadMapId?: string,
    nestedRoadMapItemId?: string,
    userId?: string,
) {
    return useQuery<TaskSubmission | null>({
        queryKey: submissionKeys.latest(roadMapId ?? "", nestedRoadMapItemId ?? "", userId ?? ""),
        queryFn: async () => {
            try {
                return await roadmapService.getLatestSubmission(
                    roadMapId!,
                    nestedRoadMapItemId!,
                    userId!,
                );
            } catch {
                return null;
            }
        },
        enabled: !!roadMapId && !!nestedRoadMapItemId && !!userId,
        staleTime: 0,
        retry: false,
    });
}

/**
 * Fetches a single submission by ID.
 */
export function useSubmissionDetail(submissionId?: string) {
    return useQuery<TaskSubmission>({
        queryKey: submissionKeys.detail(submissionId ?? ""),
        queryFn: () => roadmapService.getSubmissionById(submissionId!),
        enabled: !!submissionId,
        staleTime: 0,
    });
}

/**
 * Creates a new submission (never overwrites previous ones).
 */
export function useCreateSubmission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateSubmissionDto) =>
            roadmapService.createSubmission(payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: submissionKeys.list(
                    variables.roadMapId,
                    variables.nestedRoadMapItemId ?? "",
                    variables.submittedBy,
                ),
            });
            queryClient.invalidateQueries({
                queryKey: submissionKeys.latest(
                    variables.roadMapId,
                    variables.nestedRoadMapItemId ?? "",
                    variables.submittedBy,
                ),
            });
            queryClient.invalidateQueries({ queryKey: roadmapKeys.all });
            queryClient.invalidateQueries({ queryKey: progressKeys.all });
        },
    });
}

/**
 * Uploads a document to a specific submission.
 */
export function useUploadSubmissionDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            submissionId,
            extraName,
            file,
        }: {
            submissionId: string;
            extraName: string;
            file: any;
        }) => roadmapService.uploadSubmissionDocument(submissionId, extraName, file),
        onSuccess: (_data, vars) => {
            queryClient.invalidateQueries({
                queryKey: submissionKeys.detail(vars.submissionId),
            });
        },
    });
}
