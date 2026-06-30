import type { AssessmentProgress, GetProgressResponse } from '@/types/progress.types';

type ProgressInput = Partial<
    GetProgressResponse & { totalItems?: number; completedItems?: number }
>;

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}

function clampPercent(value: number): number {
    return Math.min(100, Math.max(0, round1(value)));
}

function resolveAssignedCounts(progress: ProgressInput): {
    roadmapCount: number;
    assessmentCount: number;
} {
    const totalRoadmaps = Number(progress.totalRoadmaps ?? 0);
    const totalAssessments = Number(progress.totalAssessments ?? 0);
    const roadmapItems = Array.isArray(progress.roadmaps) ? progress.roadmaps.length : 0;
    const assessmentItems = Array.isArray(progress.assessments) ? progress.assessments.length : 0;

    return {
        roadmapCount: Math.max(totalRoadmaps, roadmapItems),
        assessmentCount: Math.max(totalAssessments, assessmentItems),
    };
}

/** Credit toward overall % for one assessment row. Submitted ≠ 100%. */
export function assessmentItemCreditPercent(item: AssessmentProgress): number {
    const status = item.status?.toLowerCase();

    if (status === 'completed') {
        return 100;
    }

    if (status === 'submitted') {
        return 0;
    }

    const total = Number(item.totalSections ?? 0);
    const completed = Number(item.completedSections ?? 0);
    if (total > 0 && completed >= total) {
        return 0;
    }

    return Math.max(0, Math.min(Number(item.progressPercentage ?? 0), 99));
}

export function deriveAssessmentBucketPercent(progress: ProgressInput): number {
    const items = progress.assessments;
    if (!Array.isArray(items) || items.length === 0) {
        return Math.max(0, Number(progress.overallAssessmentProgress ?? 0));
    }

    let sum = 0;
    for (const item of items) {
        sum += assessmentItemCreditPercent(item);
    }

    return sum / items.length;
}

/**
 * Derive overall programme progress from assigned roadmaps and assessments.
 * Pastor submit does not count as 100%; mentor CDP marks assessment completed.
 */
export function deriveOverallProgressPercent(
    progress: ProgressInput | null | undefined,
): number {
    if (!progress) return 0;

    const { roadmapCount, assessmentCount } = resolveAssignedCounts(progress);
    const totalWeight = roadmapCount + assessmentCount;

    if (totalWeight > 0) {
        const roadmapPct = Math.max(0, Number(progress.overallRoadmapProgress ?? 0));
        const assessmentPct = deriveAssessmentBucketPercent(progress);
        const weighted =
            (roadmapPct * roadmapCount + assessmentPct * assessmentCount) / totalWeight;
        return clampPercent(weighted);
    }

    const totalFromApi = Number(progress.totalItems);
    const doneFromApi = Number(progress.completedItems);
    if (totalFromApi > 0 && Number.isFinite(doneFromApi)) {
        return clampPercent((doneFromApi / totalFromApi) * 100);
    }

    const raw = Number(progress.overallProgress);
    if (Number.isFinite(raw)) return clampPercent(raw);

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
