import { normalizeMongoId } from '@/lib/roadmap/helpers';
import type {
    ApiAssessment,
    ApiAssessmentLayer,
    Assessment,
    AssessmentResponse,
    SubmitAnswersPayload,
    SubmitPreSurveyPayload,
    SubmittedAnswersResponse,
} from '@/types/assessment.types';

export function sectionAnswersHasData(
    answers?: Record<number, Record<string, unknown>> | null,
): boolean {
    if (!answers) return false;
    return Object.values(answers).some(
        (section) => section != null && Object.keys(section).length > 0,
    );
}

/**
 * Map stored answer values to radio option values ("1"–"4") used by AnswerQuestionSection.
 * Handles legacy submissions that saved Mongo choice ids instead of level indices.
 */
function resolveQuestionChoiceValue(
    apiLayer: ApiAssessmentLayer,
    selectedChoice: unknown,
): string | undefined {
    if (selectedChoice == null || selectedChoice === '') return undefined;

    if (typeof selectedChoice === 'object') {
        const choiceId = normalizeMongoId(
            (selectedChoice as { _id?: unknown; id?: unknown })._id ??
                (selectedChoice as { id?: unknown }).id,
        );
        if (choiceId) return resolveQuestionChoiceValue(apiLayer, choiceId);
        return undefined;
    }

    const raw = String(selectedChoice).trim();
    if (/^[1-4]$/.test(raw)) return raw;
    if (/^[0-3]$/.test(raw)) return String(Number(raw) + 1);

    const normalizedChoiceId = normalizeMongoId(raw);
    const byId = apiLayer.choices.findIndex(
        (c) => normalizeMongoId(c._id) === normalizedChoiceId,
    );
    if (byId >= 0) return String(byId + 1);

    const lowered = raw.toLowerCase();
    const byText = apiLayer.choices.findIndex(
        (c) => String(c.text).trim().toLowerCase() === lowered,
    );
    if (byText >= 0) return String(byText + 1);

    return raw;
}

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

    submittedAnswers.sections.forEach((submittedSection, submittedIndex) => {
        const submittedSectionId = normalizeMongoId(submittedSection.sectionId);
        let sectionIndex = apiAssessment.sections.findIndex(
            (section) => normalizeMongoId(section._id) === submittedSectionId,
        );

        if (sectionIndex === -1 && submittedIndex < apiAssessment.sections.length) {
            sectionIndex = submittedIndex;
        }

        if (sectionIndex === -1) return;

        const apiSection = apiAssessment.sections[sectionIndex];
        sectionAnswers[sectionIndex] = {};

        submittedSection.layers.forEach((layer, layerIndex) => {
            const submittedLayerId = normalizeMongoId(layer.layerId);
            const apiLayer =
                apiSection.layers.find(
                    (l) => normalizeMongoId(l._id) === submittedLayerId,
                ) ?? apiSection.layers[layerIndex];

            if (!apiLayer) return;

            const choiceValue = resolveQuestionChoiceValue(apiLayer, layer.selectedChoice);
            if (!choiceValue) return;

            sectionAnswers[sectionIndex][normalizeMongoId(apiLayer._id)] = choiceValue;
        });
    });

    return { preSurveyAnswers, sectionAnswers };
}