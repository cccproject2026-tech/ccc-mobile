/** Shared React Query keys for mentor Review Center. */

export const REVIEW_CENTER_STALE_MS = 5 * 60 * 1000;
export const REVIEW_CENTER_GC_MS = 10 * 60 * 1000;

export const mentorReviewCenterKeys = {
  all: ["mentor-review-center"] as const,
  scan: (mentorId: string, menteeIdsKey: string) =>
    ["mentor-review-center", "scan", mentorId, menteeIdsKey] as const,
  pendingCount: (mentorId: string) =>
    ["mentor-review-center", "pending-count", mentorId] as const,
};
