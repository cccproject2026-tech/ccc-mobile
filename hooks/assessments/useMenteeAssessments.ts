import { mapApiToFrontend } from '@/lib/assessments/mappers';
import {
    completionDatesFromAnswers,
    resolveAssessmentDisplayStatus,
} from '@/lib/assessments/status';
import type { Assessment } from '@/types/assessment.types';
import { useMemo } from 'react';
import { useProgressByUserId } from '../progress/useProgress';
import { useAssessmentAnswersMap } from './useAssessmentAnswersMap';
import { useAssessments } from './useAssessments';

/**
 * Hook to get assessments assigned to a specific mentee with progress status
 * If menteeId is null/undefined, returns all assessments (library view)
 */
export const useMenteeAssessments = (menteeId: string | null | undefined) => {
    const { data: allAssessments, isLoading, error, refetch, isRefetching } = useAssessments();

    const { data: assessmentProgress, isLoading: isLoadingProgress } = useProgressByUserId(menteeId || undefined);

    const progressMap = useMemo(() => {
        const map = new Map();
        assessmentProgress?.assessments?.items?.forEach(item => {
            map.set(item.assessmentId, item);
        });
        return map;
    }, [assessmentProgress]);

    const assignedAssessmentIds = useMemo(() => {
        if (!menteeId) return [];

        const ids = new Set<string>(progressMap.keys());

        allAssessments?.forEach((assessment) => {
            if (assessment.assignments?.some((a) => a.userId === menteeId)) {
                ids.add(assessment._id);
            }
        });

        return Array.from(ids);
    }, [allAssessments, menteeId, progressMap]);

    const { answersMap, isLoadingAnswers } = useAssessmentAnswersMap(
        menteeId ? assignedAssessmentIds : [],
        menteeId || undefined,
        !!menteeId && assignedAssessmentIds.length > 0,
    );

    const assessments = useMemo(() => {
        if (!allAssessments) return [];

        if (!menteeId) {
            return allAssessments.map(apiAssessment => mapApiToFrontend(apiAssessment));
        }

        const filtered = allAssessments.filter(assessment =>
            assignedAssessmentIds.includes(assessment._id)
        );

        return filtered.map(apiAssessment => {
            const frontendAssessment = mapApiToFrontend(apiAssessment);
            const progress = progressMap.get(apiAssessment._id);
            const answerDoc = answersMap.get(apiAssessment._id);
            const userAssignment = apiAssessment.assignments?.find(
                (a) => a.userId === menteeId,
            );
            const assignedAt = userAssignment?.assignedAt;
            const expectedSections =
                progress?.totalSections ?? apiAssessment.sections?.length ?? 0;

            const { status, isInProgress } = resolveAssessmentDisplayStatus({
                progressStatus: progress?.status,
                answerSections: answerDoc?.sections,
                expectedSectionCount: expectedSections,
                completedSections: progress?.completedSections,
                totalSections: progress?.totalSections,
            });

            const dates =
                status === 'Submitted' || status === 'Completed'
                    ? completionDatesFromAnswers(answerDoc)
                    : {};

            return {
                ...frontendAssessment,
                assignedAt: assignedAt ?? frontendAssessment.assignedAt,
                status,
                isInProgress,
                progressPercentage: progress?.progressPercentage,
                completedSections: progress?.completedSections,
                totalSections: progress?.totalSections,
                ...dates,
            } satisfies Assessment;
        });
    }, [allAssessments, menteeId, assignedAssessmentIds, progressMap, answersMap]);

    return {
        data: assessments,
        isLoading: isLoading || (menteeId ? isLoadingProgress || isLoadingAnswers : false),
        error,
        refetch,
        isRefetching,
        assignedCount: menteeId ? assignedAssessmentIds.length : allAssessments?.length || 0,
    };
};
