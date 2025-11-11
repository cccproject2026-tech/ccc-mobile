import type { Assessment, AssessmentResponse, SubmitAnswersPayload, SubmitPreSurveyPayload } from '@/types/assessment.types';

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Merge assessment with response data for display
 */
export function mergeAssessmentWithResponse(
    assessment: Assessment,
    response: AssessmentResponse | null
): Assessment {
    if (!response) return assessment;

    return {
        ...assessment,
        status: response.status,
        completionDate: response.completedAt
            ? formatDate(response.completedAt)
            : undefined,
        meetingDate: response.meetingDate,
    };
}


export function transformAnswersToPayload(
    sectionAnswers: Record<number, Record<string, any>>,
    sections: Array<{ _id: string; layers: Array<{ _id: string }> }>
): SubmitAnswersPayload['answers'] {
    const answers: SubmitAnswersPayload['answers'] = [];

    Object.entries(sectionAnswers).forEach(([sectionIndex, layerAnswers]) => {
        const section = sections[parseInt(sectionIndex)];
        if (!section) return;

        const layers: Array<{ layerId: string; selectedChoice: string }> = [];

        Object.entries(layerAnswers).forEach(([layerId, selectedChoices]) => {
            // If multiple choices are selected (checkboxes), we need to handle it
            // For now, assuming single choice per layer
            if (selectedChoices) {
                layers.push({
                    layerId,
                    selectedChoice: selectedChoices as string
                });
            }
        });

        if (layers.length > 0) {
            answers.push({
                sectionId: section._id,
                layers
            });
        }
    });

    return answers;
}

/**
 * Transform pre-survey answers to API payload format
 */
export function transformPreSurveyToPayload(
    preSurveyAnswers: Record<string, string>,
    preSurveyQuestions: Array<{ text: string; id: string }>
): SubmitPreSurveyPayload['preSurveyAnswers'] {
    return preSurveyQuestions.map(question => ({
        questionText: question.text,
        answer: preSurveyAnswers[question.id] || ''
    }));
}