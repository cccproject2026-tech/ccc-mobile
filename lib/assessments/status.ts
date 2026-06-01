import {
    deriveAssessmentTaskStatusFromAnswers,
    type AssessmentAnswerSectionSlice,
} from '@/lib/roadmap/helpers';
import type { Assessment } from '@/types/assessment.types';
import type { SubmittedAnswersResponse } from '@/types/assessment.types';

export function mapProgressStatusToFrontend(
    progressStatus?: string,
): Assessment['status'] | null {
    switch (progressStatus?.toLowerCase()) {
        case 'completed':
            return 'Completed';
        case 'submitted':
            return 'Submitted';
        case 'in_progress':
            return null;
        case 'not_started':
        default:
            return 'Not Started';
    }
}

/**
 * Pastor list status: answers (CDP / full submit) override progress when progress lags.
 */
export function resolveAssessmentDisplayStatus(params: {
    progressStatus?: string;
    answerSections?: AssessmentAnswerSectionSlice[] | null;
    expectedSectionCount?: number;
    completedSections?: number;
    totalSections?: number;
}): {
    status: Assessment['status'];
    isInProgress: boolean;
} {
    const derived = deriveAssessmentTaskStatusFromAnswers(
        params.answerSections,
        params.expectedSectionCount,
    );
    if (derived === 'completed') {
        return { status: 'Completed', isInProgress: false };
    }
    if (derived === 'submitted') {
        return { status: 'Submitted', isInProgress: false };
    }

    const fromProgress = mapProgressStatusToFrontend(params.progressStatus);
    if (fromProgress === 'Completed' || fromProgress === 'Submitted') {
        return { status: fromProgress, isInProgress: false };
    }

    const completed = params.completedSections ?? 0;
    const total = params.totalSections ?? 0;
    const partialFromProgress =
        params.progressStatus?.toLowerCase() === 'in_progress' ||
        (total > 0 && completed > 0 && completed < total);

    if (partialFromProgress) {
        return { status: 'Not Started', isInProgress: true };
    }

    return { status: fromProgress ?? 'Not Started', isInProgress: false };
}

export function completionDatesFromAnswers(
    answerDoc?: SubmittedAnswersResponse | null,
): { completedOn?: string; completionDate?: string } {
    if (!answerDoc?.sections?.length) return {};
    const date = answerDoc.updatedAt ?? answerDoc.preSurveySubmittedAt;
    if (!date) return {};
    return { completedOn: date, completionDate: date };
}
