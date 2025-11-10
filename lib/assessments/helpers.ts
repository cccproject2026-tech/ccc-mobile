import type { Assessment, AssessmentResponse } from '@/types/assessment.types';

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
