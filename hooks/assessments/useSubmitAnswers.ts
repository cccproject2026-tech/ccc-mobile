import { assessmentService } from '@/services/assessment.service';
import { useAssessmentStore } from '@/stores/assessment.store';
import { SubmitAnswersPayload, SubmitPreSurveyPayload } from '@/types/assessment.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useSubmitPreSurvey = () => {
    const queryClient = useQueryClient();
    const updatePreSurveyAnswers = useAssessmentStore((state) => state.updatePreSurveyAnswers);

    return useMutation({
        mutationFn: ({
            assessmentId,
            payload
        }: {
            assessmentId: string;
            payload: SubmitPreSurveyPayload
        }) => assessmentService.submitPreSurvey(assessmentId, payload),

        onSuccess: (data, variables) => {
            console.log('✅ Pre-survey submitted successfully');

            // Update draft with submitted pre-survey data
            updatePreSurveyAnswers(
                variables.assessmentId,
                variables.payload.preSurveyAnswers.reduce((acc, item) => ({
                    ...acc,
                    [item.questionText]: item.answer.toString()
                }), {})
            );

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ['assessment', variables.assessmentId]
            });
            queryClient.invalidateQueries({
                queryKey: ['progress']
            });
        },

        onError: (error) => {
            console.error('❌ Failed to submit pre-survey:', error);
        }
    });
};

export const useSubmitAssessmentAnswers = () => {
    const queryClient = useQueryClient();
    const clearDraft = useAssessmentStore((state) => state.clearDraft);

    return useMutation({
        mutationFn: ({
            assessmentId,
            payload
        }: {
            assessmentId: string;
            payload: SubmitAnswersPayload
        }) => assessmentService.submitAssessmentAnswers(assessmentId, payload),

        onSuccess: (data, variables) => {
            console.log('✅ Assessment answers submitted successfully');

            // Clear draft from local storage after successful submission
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
            queryClient.invalidateQueries({
                queryKey: ['progress']
            });
        },

        onError: (error) => {
            console.error('❌ Failed to submit assessment answers:', error);
        }
    });
};
