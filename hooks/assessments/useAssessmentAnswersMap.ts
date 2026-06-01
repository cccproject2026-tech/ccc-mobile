import { assessmentService } from '@/services';
import type { SubmittedAnswersResponse } from '@/types/assessment.types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Fetches submitted answers for multiple assessments (pastor / mentee progress lists).
 */
export function useAssessmentAnswersMap(
    assessmentIds: string[],
    userId: string | undefined,
    enabled = true,
) {
    const stableIds = useMemo(
        () => [...new Set(assessmentIds.filter(Boolean))].sort(),
        [assessmentIds],
    );

    const queries = useQueries({
        queries: stableIds.map((assessmentId) => ({
            queryKey: ['answers', assessmentId, userId || ''],
            queryFn: () => assessmentService.fetchAnswers(assessmentId, userId!),
            enabled: enabled && !!userId && !!assessmentId,
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry: 1,
        })),
    });

    const answersVersion = queries.map((q) => q.dataUpdatedAt).join('|');

    const answersMap = useMemo(() => {
        const map = new Map<string, SubmittedAnswersResponse>();
        stableIds.forEach((id, index) => {
            const doc = queries[index]?.data?.data;
            if (doc?.sections?.length) {
                map.set(id, doc);
            }
        });
        return map;
    }, [stableIds, answersVersion]);

    const isLoadingAnswers = queries.some(
        (q) => q.isLoading && q.fetchStatus !== 'idle',
    );

    return { answersMap, isLoadingAnswers };
}
