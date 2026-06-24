import type { ProgressResponse } from '@/types/progress.types';

/**
 * Prefer API `overallProgress`; fall back to completed/total items or roadmap aggregate.
 * When all assigned roadmaps and assessments are completed, return 100%.
 */
export function deriveOverallProgressPercent(
    progress: Partial<ProgressResponse> | null | undefined,
): number {
    if (!progress) return 0;

    const totalRoadmaps = Number(progress.totalRoadmaps ?? 0);
    const completedRoadmaps = Number(progress.completedRoadmaps ?? 0);
    const totalAssessments = Number(progress.totalAssessments ?? 0);
    const completedAssessments = Number(progress.completedAssessments ?? 0);

    if (
        (totalRoadmaps > 0 || totalAssessments > 0) &&
        completedRoadmaps === totalRoadmaps &&
        completedAssessments === totalAssessments
    ) {
        return 100;
    }

    const raw = Number(progress.overallProgress ?? progress.overallRoadmapProgress);
    if (Number.isFinite(raw)) return Math.min(100, Math.max(0, raw));

    const total = Number(progress.totalItems);
    const done = Number(progress.completedItems);
    if (total > 0 && Number.isFinite(done)) {
        return Math.min(100, Math.round((done / total) * 1000) / 10);
    }

    const rp = Number(progress.overallRoadmapProgress);
    if (Number.isFinite(rp)) return Math.min(100, Math.max(0, rp));

    return 0;
}

export function mentorHasFinalComments(
    finalCommentCount?: number,
    finalComments?: unknown[] | null,
): boolean {
    if (typeof finalCommentCount === 'number' && finalCommentCount > 0) return true;
    return Array.isArray(finalComments) && finalComments.length > 0;
}

export function canMentorMarkProgramComplete(params: {
    overallProgress: number;
    hasFinalComment: boolean;
    hasCompleted?: boolean;
}): boolean {
    return (
        params.overallProgress >= 100 &&
        params.hasFinalComment &&
        !params.hasCompleted
    );
}

export const MENTOR_FINAL_COMMENT_REQUIRED_MESSAGE =
    'Please add final comments before marking the programme as completed.';
