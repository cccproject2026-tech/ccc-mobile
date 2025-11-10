// hooks/assessments/useSubmitAssessment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '@/services';
import { useAssessmentStore } from '@/stores/assessment.store';

export const useSubmitAssessment = () => {
    const queryClient = useQueryClient();
    const clearDraft = useAssessmentStore((state) => state.clearDraft);

    return useMutation({
        mutationFn: ({ assessmentId, data }: { assessmentId: string; data: any }) =>
            assessmentService.submitAssessment(assessmentId, data),

        onSuccess: (_, variables) => {
            // Clear draft from local storage
            clearDraft(variables.assessmentId);

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ['assessment', variables.assessmentId]
            });
            queryClient.invalidateQueries({
                queryKey: ['assessments']
            });
            queryClient.invalidateQueries({
                queryKey: ['answers', variables.assessmentId]
            });
        },
    });
};
