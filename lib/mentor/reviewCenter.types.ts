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
  roadmapName?: string;
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

export interface ReviewRoadmapSection {
  roadmapId: string;
  roadmapName: string;
  items: ReviewItem[];
  latestSubmittedAt: string | null;
}

export function shouldGroupRoadmapList(bucket: ReviewDashboardBucket): boolean {
  return (
    bucket === "new_roadmap_submissions" ||
    bucket === "resubmitted_tasks" ||
    bucket === "not_started"
  );
}

export function groupReviewItemsByRoadmap(items: ReviewItem[]): {
  sections: ReviewRoadmapSection[];
  standaloneItems: ReviewItem[];
} {
  const standaloneItems: ReviewItem[] = [];
  const map = new Map<string, ReviewRoadmapSection>();

  for (const item of items) {
    if (item.type !== "roadmap" || !item.roadmapId) {
      standaloneItems.push(item);
      continue;
    }

    const roadmapId = String(item.roadmapId);
    let section = map.get(roadmapId);
    if (!section) {
      section = {
        roadmapId,
        roadmapName: item.roadmapName?.trim() || "Roadmap",
        items: [],
        latestSubmittedAt: null,
      };
      map.set(roadmapId, section);
    }

    section.items.push(item);
    const submittedAt = item.submittedAt;
    if (
      submittedAt &&
      (!section.latestSubmittedAt || submittedAt > section.latestSubmittedAt)
    ) {
      section.latestSubmittedAt = submittedAt;
    }
  }

  const sections = [...map.values()]
    .map((section) => ({
      ...section,
      items: [...section.items].sort((a, b) => {
        const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bTime - aTime;
      }),
    }))
    .sort((a, b) => {
      const aTime = a.latestSubmittedAt
        ? new Date(a.latestSubmittedAt).getTime()
        : 0;
      const bTime = b.latestSubmittedAt
        ? new Date(b.latestSubmittedAt).getTime()
        : 0;
      return bTime - aTime;
    });

  return { sections, standaloneItems };
}

/** One mentee (pastor) row in Review Center home. */
export interface ReviewPastorGroup {
  pastorId: string;
  pastorName: string;
  profilePicture?: string | null;
  profileImage?: string | null;
  counts: ReviewDashboardCounts;
  pendingActionCount: number;
  totalItems: number;
}

export function filterItemsByPastor(
  items: ReviewItem[],
  pastorId: string,
): ReviewItem[] {
  const id = String(pastorId ?? "").trim();
  if (!id) return items;
  return items.filter((item) => String(item.pastorId) === id);
}

export function buildPastorGroups(items: ReviewItem[]): ReviewPastorGroup[] {
  const map = new Map<string, ReviewPastorGroup>();

  for (const item of items) {
    const pastorId = String(item.pastorId ?? "").trim();
    if (!pastorId) continue;

    let group = map.get(pastorId);
    if (!group) {
      group = {
        pastorId,
        pastorName: item.pastorName || "Pastor",
        counts: {
          new_roadmap_submissions: 0,
          resubmitted_tasks: 0,
          new_assessments: 0,
          not_started: 0,
        },
        pendingActionCount: 0,
        totalItems: 0,
      };
      map.set(pastorId, group);
    }

    group.totalItems++;
    const bucket = getDashboardBucket(item);
    if (bucket) group.counts[bucket]++;
  }

  return [...map.values()]
    .map((g) => ({
      ...g,
      pendingActionCount: computePendingActionCount(g.counts),
    }))
    .sort((a, b) => {
      if (a.pendingActionCount !== b.pendingActionCount) {
        return b.pendingActionCount - a.pendingActionCount;
      }
      return a.pastorName.localeCompare(b.pastorName);
    });
}
