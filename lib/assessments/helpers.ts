import type { Assessment, AssessmentResponse, SubmitAnswersPayload, SubmitPreSurveyPayload, SubmittedAnswersResponse } from '@/types/assessment.types';
import { ApiAssessment } from './types';

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

        Object.entries(layerAnswers).forEach(([layerId, choiceId]) => {
            if (choiceId) {
                layers.push({
                    layerId,
                    selectedChoice: String(choiceId)
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



export function transformSubmittedAnswersToStore(
    submittedAnswers: SubmittedAnswersResponse | null | undefined,
    assessment: Assessment,
    apiAssessment: ApiAssessment
): {
    preSurveyAnswers: Record<string, string>;
    sectionAnswers: Record<number, Record<string, string>>;
} {
    if (!submittedAnswers?.sections) {
        return { preSurveyAnswers: {}, sectionAnswers: {} };
    }

    // Transform pre-survey answers
    const preSurveyAnswers: Record<string, string> = {};
    if (submittedAnswers.preSurveyAnswers && assessment.preSurvey) {
        submittedAnswers.preSurveyAnswers.forEach((answer) => {
            const question = assessment.preSurvey?.find(q => q.text === answer.questionText);
            if (question) {
                preSurveyAnswers[question.id] = answer.answer;
            }
        });
    }

    // Transform section answers: one selectedChoice (choiceId) per layer
    const sectionAnswers: Record<number, Record<string, string>> = {};

    submittedAnswers.sections.forEach((submittedSection) => {
        const sectionIndex = apiAssessment.sections.findIndex(
            section => section._id === submittedSection.sectionId
        );

        if (sectionIndex !== -1) {
            sectionAnswers[sectionIndex] = {};
            submittedSection.layers.forEach((layer) => {
                sectionAnswers[sectionIndex][layer.layerId] = layer.selectedChoice;
            });
        }
    });

    return { preSurveyAnswers, sectionAnswers };
}