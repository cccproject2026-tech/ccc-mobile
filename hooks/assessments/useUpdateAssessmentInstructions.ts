import { ApiAssessment } from '@/lib/assessments/types';
import { assessmentService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateAssessmentInstructions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            assessmentId,
            instructions,
        }: {
            assessmentId: string;
            instructions: string[];
        }) => assessmentService.updateInstructions(assessmentId, instructions),

        onSuccess: (data, variables) => {
            // Update the specific assessment in cache
            queryClient.setQueryData(['assessment', variables.assessmentId], data);
            // Invalidate assessments list to refetch
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            console.log('✅ Assessment instructions updated successfully');
        },

        onError: (error) => {
            console.error('❌ Update assessment instructions failed:', error);
        },
    });
};

