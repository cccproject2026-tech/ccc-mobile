import { ApiAssessment } from '@/lib/assessments/types';
import { assessmentService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useAssignAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            assessmentId,
            userIds,
        }: {
            assessmentId: string;
            userIds: string[];
        }) => assessmentService.assignAssessment(assessmentId, userIds),

        onSuccess: (data, variables) => {
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

