import { progressService } from '@/services/progress.service';
import { AssignAssessmentRequest } from '@/types/progress.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { progressKeys } from '../progress/useProgress';

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
            // Call the API for each user (new API accepts single user)
            const results = await Promise.all(
                userIds.map((userId) =>
                    progressService.assignAssessment({
                        userId,
                        assessmentId,
                    })
                )
            );
            // Return the last result for compatibility
            return results[results.length - 1];
        },

        onSuccess: (data, variables) => {
            // Invalidate progress queries for all affected users
            variables.userIds.forEach((userId) => {
                queryClient.invalidateQueries({
                    queryKey: progressKeys.user(userId),
                });
            });

            // Invalidate assessments list to refetch
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
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

