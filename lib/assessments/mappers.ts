import type {
    ApiAssessment,
    ApiAssessmentSection,
    Assessment,
    AssessmentSection,
    PreSurveyQuestion,
} from '@/types/assessment.types';

export function mapApiToFrontend(apiAssessment: ApiAssessment): Assessment {
    let assessmentType: 'CMA' | 'PMP' = 'PMP';

    if (apiAssessment.type) {
        assessmentType = apiAssessment.type;
    } else if (apiAssessment.preSurvey && apiAssessment.preSurvey.length > 0) {
        assessmentType = 'CMA';
    }

    return {
        id: apiAssessment._id,
        type: assessmentType,
        title: apiAssessment.name,
        description: apiAssessment.description,
        status: determineStatus(apiAssessment),
        guidelines: apiAssessment.instructions || [],
        preSurvey: apiAssessment.preSurvey?.map(mapPreSurveyQuestion),
        sections: apiAssessment.sections?.map(mapApiSection) || [],
        completedOn: apiAssessment.updatedAt,
    };
}

/**
 * Map API section to frontend section.
 * Each layer = one question (radio) with choices as options.
 * Backend expects selectedChoice as numeric level ("1"|"2"|"3"|"4"); we use choice index + 1.
 */
function mapApiSection(apiSection: ApiAssessmentSection): AssessmentSection {
    return {
        title: apiSection.title,
        subtitle: apiSection.description,
        questionGroups: apiSection.layers.map(layer => ({
            id: layer._id,
            groupTitle: layer.title,
            questions: [
                {
                    id: layer._id,
                    text: layer.title,
                    type: 'radio' as const,
                    options: layer.choices.map((choice, index) => ({
                        label: choice.text,
                        value: String(index + 1),
                    })),
                    required: false,
                },
            ],
        })),
        recommendations: apiSection.recommendations,
    };
}

function mapPreSurveyQuestion(q: PreSurveyQuestion): PreSurveyQuestion {
    return {
        id: q._id || q.id || '',
        _id: q._id,
        text: q.text,
        type: q.type,
        placeholder: q.placeholder,
        required: q.required,
    };
}

function determineStatus(apiAssessment: ApiAssessment): Assessment['status'] {
    if (!apiAssessment.assignments || apiAssessment.assignments.length === 0) {
        return 'Not Started';
    }

    const latestAssignment = apiAssessment.assignments[0];
    const status = latestAssignment.status.toLowerCase();

    switch (status) {
        case 'completed':
            return 'Completed';
        case 'submitted':
            return 'Submitted';
        case 'due':
            return 'Due';
        default:
            return 'Not Started';
    }
}
