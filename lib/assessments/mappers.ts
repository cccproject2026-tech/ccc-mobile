import type {
    ApiAssessment,
    ApiAssessmentSection,
    Assessment,
    AssessmentSection,
    PreSurveyQuestion,
} from '@/types/assessment.types'; // Use your actual path

/**
 * Map API assessment to frontend Assessment format
 */
export function mapApiToFrontend(apiAssessment: ApiAssessment): Assessment {
    return {
        id: apiAssessment._id,
        type: apiAssessment.type || 'CMA', // Default to CMA if missing
        title: apiAssessment.name,
        description: apiAssessment.description,
        status: determineStatus(apiAssessment),
        guidelines: apiAssessment.instructions,
        preSurvey: apiAssessment.preSurvey?.map(mapPreSurveyQuestion),
        sections: apiAssessment.sections.map(mapApiSection),
        completedOn: apiAssessment.updatedAt,
    };
}

/**
 * Map API section to frontend section
 */
function mapApiSection(apiSection: ApiAssessmentSection): AssessmentSection {
    return {
        title: apiSection.title,
        subtitle: apiSection.description,
        questionGroups: apiSection.layers.map(layer => ({
            id: layer._id,
            questions: [{
                id: layer._id,
                text: layer.title,
                type: 'radio' as const,
                options: layer.choices.map(choice => ({
                    label: choice.text,
                    value: choice._id,
                })),
                required: false,
            }],
        })),
    };
}

/**
 * Map pre-survey question
 */
function mapPreSurveyQuestion(q: PreSurveyQuestion): PreSurveyQuestion {
    return {
        id: q._id || q.id,
        _id: q._id,
        text: q.text,
        type: q.type,
        placeholder: q.placeholder,
        required: q.required,
    };
}

/**
 * Determine assessment status from assignments
 */
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
