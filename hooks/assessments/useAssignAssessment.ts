import { progressService } from '@/services/progress.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { progressKeys } from '../progress/useProgress';

/**
 * Assigns assessment(s) to users via the progress API (same as Director-Mobile).
 * Using POST /progress/assign-assessment ensures the assignment is stored in progress,
 * so the pastor/mentee sees it in their assessments list and progress.
 */
export const useAssignAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            assessmentId,
            userIds,
        }: {
            assessmentId: string;
            userIds: string[];
        }) => {
            return progressService.assignAssessmentsBulk({
                userIds,
                assessmentIds: [assessmentId],
            });
        },

        onSuccess: (data, variables) => {
            // Invalidate progress queries for all affected users
            variables.userIds.forEach((userId) => {
                queryClient.invalidateQueries({
                    queryKey: progressKeys.user(userId),
                });
            });

            // Invalidate base progress key
            queryClient.invalidateQueries({ queryKey: ['progress'] });

            // Invalidate assessments list to refetch
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            // Invalidate mentees list to update assignment status
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            // Invalidate the specific assessment
            queryClient.invalidateQueries({
                queryKey: ['assessment', variables.assessmentId],
            });
            console.log('✅ Assessment assigned successfully');
        },

        onError: (error) => {
            console.error('❌ Assign assessment failed:', error);
        },
    });
};

