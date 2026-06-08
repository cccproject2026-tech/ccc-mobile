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
            
            variables.userIds.forEach((userId) => {
                queryClient.invalidateQueries({
                    queryKey: progressKeys.user(userId),
                });
            });

            
            queryClient.invalidateQueries({ queryKey: ['progress'] });

            
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            
            queryClient.invalidateQueries({ queryKey: ['mentees'] });
            
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

