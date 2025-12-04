import { mapApiToFrontend } from '@/lib/assessments/mappers';
import type { Assessment } from '@/types/assessment.types';
import { useMemo } from 'react';
import { useProgressByUserId } from '../progress/useProgress';
import { useAssessments } from './useAssessments';

/**
 * Hook to get assessments assigned to a specific mentee with progress status
 * If menteeId is null/undefined, returns all assessments (library view)
 */
export const useMenteeAssessments = (menteeId: string | null | undefined) => {
    // Fetch all assessments
    const { data: allAssessments, isLoading, error, refetch, isRefetching } = useAssessments();

    // Fetch mentee's progress data if menteeId is provided
    const { data: assessmentProgress, isLoading: isLoadingProgress } = useProgressByUserId(menteeId || undefined);

    // Get array of assigned assessment progress items
    const progressMap = useMemo(() => {
        const map = new Map();
        assessmentProgress?.assessments?.items?.forEach(item => {
            map.set(item.assessmentId, item);
        });
        return map;
    }, [assessmentProgress]);

    // Get array of assigned assessment IDs
    const assignedAssessmentIds = useMemo(() => {
        return Array.from(progressMap.keys());
    }, [progressMap]);

    // Map progress status to frontend status
    const mapProgressToStatus = (progressStatus?: string): Assessment['status'] => {
        switch (progressStatus) {
            case 'completed':
                return 'Completed';
            case 'in_progress':
                return 'Submitted';
            case 'not_started':
            default:
                return 'Not Started';
        }
    };

    // Filter and map assessments with progress data
    const assessments = useMemo(() => {
        if (!allAssessments) return [];

        // If no mentee selected, return all assessments (library view)
        if (!menteeId) {
            return allAssessments.map(apiAssessment => mapApiToFrontend(apiAssessment));
        }

        // Filter only assigned assessments for the mentee
        const filtered = allAssessments.filter(assessment =>
            assignedAssessmentIds.includes(assessment._id)
        );

        // Map to frontend format and merge with progress data
        return filtered.map(apiAssessment => {
            const frontendAssessment = mapApiToFrontend(apiAssessment);
            const progress = progressMap.get(apiAssessment._id);

            // Override status with progress data
            if (progress) {
                return {
                    ...frontendAssessment,
                    status: mapProgressToStatus(progress.status),
                    progressPercentage: progress.progressPercentage,
                    completedSections: progress.completedSections,
                    totalSections: progress.totalSections,
                };
            }

            return frontendAssessment;
        });
    }, [allAssessments, menteeId, assignedAssessmentIds, progressMap]);

    return {
        data: assessments,
        isLoading: isLoading || (menteeId ? isLoadingProgress : false),
        error,
        refetch,
        isRefetching,
        assignedCount: menteeId ? assignedAssessmentIds.length : allAssessments?.length || 0,
    };
};

