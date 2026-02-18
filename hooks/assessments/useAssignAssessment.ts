import { assessmentService } from '@/services/assessment.service';
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
            // Call the new single API endpoint that accepts multiple users
            return assessmentService.assignAssessment(assessmentId, { userIds });
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

