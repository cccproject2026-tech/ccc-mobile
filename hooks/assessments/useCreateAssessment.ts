import { CreateAssessmentRequest } from '@/lib/assessments/types';
import { assessmentService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAssessmentRequest) =>
            assessmentService.createAssessment(data),

        onSuccess: (data) => {
            // Invalidate assessments list to refetch with new assessment
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            // Invalidate progress to ensure new assessment shows up if relevant
            queryClient.invalidateQueries({ queryKey: ['progress'] });
            
            queryClient.setQueryData(['assessment', data._id], data);
            console.log('✅ Assessment created successfully');
        },

        onError: (error) => {
            console.error('❌ Create assessment failed:', error);
        },
    });
};

