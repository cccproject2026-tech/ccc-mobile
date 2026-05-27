export type ReviewStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "REVIEWED"
  | "RESUBMITTED"
  | "APPROVED";

export type ReviewItemType = "roadmap" | "assessment";

export type ReviewFilterTab = "all" | "roadmaps" | "assessments";

export type ReviewCategory =
  | "pending_review"
  | "reviewed"
  | "resubmitted"
  | "not_started";

/** Dashboard buckets for Review Center summary cards (filtered list navigation). */
export type ReviewDashboardBucket =
  | "new_roadmap_submissions"
  | "resubmitted_tasks"
  | "new_assessments"
  | "not_started";

export interface ReviewDashboardCounts {
  new_roadmap_submissions: number;
  resubmitted_tasks: number;
  new_assessments: number;
  not_started: number;
}

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  pastorId: string;
  pastorName: string;
  title: string;
  status: ReviewStatus;
  category: ReviewCategory;
  submittedAt: string | null;
  resubmissionCount: number;
  isSeen: boolean;
  roadmapId?: string;
  nestedRoadMapItemId?: string;
  assessmentId?: string;
  taskName?: string;
}

export interface ReviewCategoryCounts {
  pending_review: number;
  reviewed: number;
  resubmitted: number;
  not_started: number;
}

export interface ReviewBadgeCounts {
  roadmaps: number;
  assessments: number;
}

export const REVIEW_PRIORITY: Record<ReviewCategory, number> = {
  resubmitted: 0,
  pending_review: 1,
  not_started: 2,
  reviewed: 3,
};

export function mapSubmissionStatusToReview(status: string | undefined | null): ReviewStatus {
  if (!status) return "NOT_STARTED";
  const s = status.toLowerCase().replace(/[\s_-]/g, "");
  switch (s) {
    case "submitted":
      return "SUBMITTED";
    case "reviewed":
      return "REVIEWED";
    case "approved":
      return "APPROVED";
    case "needsrevision":
      return "SUBMITTED";
    case "resubmitted":
      return "RESUBMITTED";
    case "inprogress":
      return "IN_PROGRESS";
    default:
      return "NOT_STARTED";
  }
}

export function getReviewCategory(status: ReviewStatus): ReviewCategory {
  switch (status) {
    case "SUBMITTED":
      return "pending_review";
    case "REVIEWED":
    case "APPROVED":
      return "reviewed";
    case "RESUBMITTED":
      return "resubmitted";
    case "NOT_STARTED":
    case "IN_PROGRESS":
    default:
      return "not_started";
  }
}

export function getDashboardBucket(item: ReviewItem): ReviewDashboardBucket | null {
  if (item.category === "not_started") return "not_started";
  if (item.type === "roadmap" && item.category === "resubmitted") return "resubmitted_tasks";
  if (item.type === "roadmap" && item.category === "pending_review") {
    return "new_roadmap_submissions";
  }
  if (item.type === "assessment" && item.category === "pending_review") {
    return "new_assessments";
  }
  return null;
}

export function filterItemsByBucket(
  items: ReviewItem[],
  bucket: ReviewDashboardBucket,
): ReviewItem[] {
  return items.filter((item) => getDashboardBucket(item) === bucket);
}

export function computeDashboardCounts(items: ReviewItem[]): ReviewDashboardCounts {
  const counts: ReviewDashboardCounts = {
    new_roadmap_submissions: 0,
    resubmitted_tasks: 0,
    new_assessments: 0,
    not_started: 0,
  };
  for (const item of items) {
    const bucket = getDashboardBucket(item);
    if (bucket) counts[bucket]++;
  }
  return counts;
}

/** Actionable items for Quick Link badge (excludes reviewed + not started). */
export function computePendingActionCount(counts: ReviewDashboardCounts): number {
  return (
    counts.new_roadmap_submissions + counts.resubmitted_tasks + counts.new_assessments
  );
}

export const DASHBOARD_BUCKET_PRIORITY: Record<ReviewDashboardBucket, number> = {
  resubmitted_tasks: 0,
  new_roadmap_submissions: 1,
  new_assessments: 2,
  not_started: 3,
};
