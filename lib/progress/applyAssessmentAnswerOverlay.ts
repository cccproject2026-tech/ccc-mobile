import {
    deriveAssessmentTaskStatusFromAnswers,
    type AssessmentAnswerSectionSlice,
} from '@/lib/roadmap/helpers';
import type { AssessmentProgress, GetProgressResponse } from '@/types/progress.types';

export function overlayAssessmentProgressItem(
    item: AssessmentProgress,
    answerSections?: AssessmentAnswerSectionSlice[] | null,
): AssessmentProgress {
    if (!answerSections?.length) {
        return item;
    }

    const derived = deriveAssessmentTaskStatusFromAnswers(
        answerSections,
        item.totalSections > 0 ? item.totalSections : undefined,
    );

    if (derived === 'completed') {
        return {
            ...item,
            status: 'completed',
            progressPercentage: 100,
            completedSections: Math.max(item.completedSections, item.totalSections),
        };
    }

    if (derived === 'submitted') {
        return {
            ...item,
            status: 'submitted',
            progressPercentage: 0,
        };
    }

    return item;
}

export function applyAssessmentAnswerOverlayToProgress(
    progress: GetProgressResponse,
    answersByAssessmentId: Map<string, AssessmentAnswerSectionSlice[] | undefined>,
): GetProgressResponse {
    const assessments = (progress.assessments || []).map((item) =>
        overlayAssessmentProgressItem(
            item,
            answersByAssessmentId.get(item.assessmentId),
        ),
    );

    return { ...progress, assessments };
}
