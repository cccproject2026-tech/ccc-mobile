import { assessmentService } from '@/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteAssessment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (assessmentId: string) =>
            assessmentService.deleteAssessment(assessmentId),

        onSuccess: (data, assessmentId) => {
            
            queryClient.removeQueries({
                queryKey: ['assessment', assessmentId],
            });
            
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            console.log('✅ Assessment deleted successfully');
        },

        onError: (error) => {
            console.error('❌ Delete assessment failed:', error);
        },
    });
};

