import {
  getReviewCategory,
  mapSubmissionStatusToReview,
  type ReviewItem,
} from "@/lib/mentor/reviewCenter.types";
import { assessmentService } from "@/services/assessment.service";
import { roadmapService } from "@/services/roadmap.service";
import type { TaskSubmission } from "@/lib/roadmap/types";
import { mapWithConcurrency } from "@/utils/apiConcurrency";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SEEN_STORAGE_KEY = "mentor_review_center_seen";
export const REVIEW_CENTER_MAX_MENTEES = 20;
export const REVIEW_CENTER_MAX_ROADMAPS_PER_MENTEE = 6;
const LEGACY_EXTRAS_CONCURRENCY = 2;

const isMongoObjectIdLike = (id: string | undefined | null): id is string => {
  return (
    !!id &&
    typeof id === "string" &&
    id.trim().length === 24 &&
    /^[0-9a-fA-F]{24}$/.test(id.trim())
  );
};

function buildLatestLegacyRoadmapSubmission(
  extras: any,
): {
  status: "SUBMITTED" | "RESUBMITTED";
  category: "pending_review" | "resubmitted";
  resubmissionCount: number;
  submittedAt: string;
} | null {
  const allExtras: any[] = (extras?.extras ?? []).filter(
    (e: any) => e?.name && e?.type !== "JUMPSTART_COMPLETE",
  );

  if (allExtras.length === 0) return null;

  const byName = new Map<string, any[]>();
  for (const e of allExtras) {
    const key = String(e.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(e);
  }

  const maxVersions = Math.max(
    ...Array.from(byName.values()).map((arr) => arr.length),
  );

  if (!Number.isFinite(maxVersions) || maxVersions <= 0) return null;

  const status = maxVersions > 1 ? "RESUBMITTED" : "SUBMITTED";
  const category = maxVersions > 1 ? "resubmitted" : "pending_review";
  const resubmissionCount = Math.max(0, maxVersions - 1);

  const submittedAtDate = new Date(
    String(extras.updatedAt ?? extras.createdAt ?? ""),
  );
  const submittedAt = Number.isNaN(submittedAtDate.getTime())
    ? new Date(String(extras.createdAt ?? "")).toISOString()
    : submittedAtDate.toISOString();

  return { status, category, resubmissionCount, submittedAt };
}

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function uniqueNonEmpty(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.map((v) => String(v ?? "").trim()).filter(Boolean))];
}

export function isReviewCenterTooManyRequestsError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { statusCode?: number; message?: string };
  if (maybeError.statusCode === 429) return true;
  const message = String(maybeError.message ?? "");
  return message.includes("429") || message.includes("Too Many Requests");
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { statusCode?: number; message?: string };
  if (maybeError.statusCode === 404) return true;
  const message = String(maybeError.message ?? "");
  return message.includes("404") || message.includes("Cannot GET");
}

export type FetchMentorReviewCenterItemsParams = {
  mentees: any[];
  menteeNameById: Map<string, string>;
  roadmapNameById: Map<string, string>;
  roadmapTasksById: Map<string, { id: string; name: string }[]>;
  assessmentNameById: Map<string, string>;
};

/** Full Review Center scan — submissions probes, legacy extras fallback, assessments. */
export async function fetchMentorReviewCenterItems({
  mentees,
  menteeNameById,
  roadmapNameById,
  roadmapTasksById,
  assessmentNameById,
}: FetchMentorReviewCenterItemsParams): Promise<ReviewItem[]> {
  const seenIds = await loadSeenIds();
  const items: ReviewItem[] = [];
  const extrasRequestCache = new Map<string, Promise<any>>();
  const blockedExtrasByRoadmapUser = new Set<string>();

  const getCachedExtras = (
    roadmapId: string,
    nestedRoadMapItemId: string,
    userId: string,
  ): Promise<any> => {
    const key = `${roadmapId}:${nestedRoadMapItemId}:${userId}`;
    const existing = extrasRequestCache.get(key);
    if (existing) return existing;
    const req = roadmapService.getRoadmapExtras(
      roadmapId,
      nestedRoadMapItemId,
      userId,
    );
    extrasRequestCache.set(key, req);
    return req;
  };

  await mapWithConcurrency(mentees, 2, async (mentee: any) => {
    const pastorId = String(mentee?.id ?? mentee?._id ?? "");
    if (!pastorId) return;
    const pastorName = menteeNameById.get(pastorId) ?? "Pastor";
    const pastorIdCandidates = uniqueNonEmpty([
      mentee?.id,
      mentee?._id,
      pastorId,
    ]);

    const roadmapIds: string[] = (mentee.assignedRoadmapIds ?? [])
      .map((x: any) => String(x))
      .filter(Boolean)
      .slice(0, REVIEW_CENTER_MAX_ROADMAPS_PER_MENTEE);

    for (const rid of roadmapIds) {
      try {
        const roadmapName = roadmapNameById.get(rid) ?? "Roadmap";
        const tasks = roadmapTasksById.get(rid) ?? [];
        let submissions: TaskSubmission[] = [];

        for (const candidateUserId of pastorIdCandidates) {
          try {
            const allSubs = await roadmapService.getAllSubmissionsForUser(
              rid,
              candidateUserId,
            );
            if (allSubs.length > 0) {
              submissions = allSubs;
              break;
            }
          } catch {
            // try next candidate
          }
        }

        if (submissions.length === 0) {
          for (const candidateUserId of pastorIdCandidates) {
            let taskSubmissionsEndpointMissing = false;
            await mapWithConcurrency(tasks, LEGACY_EXTRAS_CONCURRENCY, async (task) => {
              if (taskSubmissionsEndpointMissing) return;
              try {
                const subs = await roadmapService.getTaskSubmissions(
                  rid,
                  task.id,
                  candidateUserId,
                );
                submissions.push(...subs);
              } catch (error) {
                if (isNotFoundError(error)) {
                  taskSubmissionsEndpointMissing = true;
                }
              }
            });
            if (submissions.length > 0) break;
          }
        }

        if (submissions.length > 0) {
          const latestByTask = new Map<string, TaskSubmission>();
          for (const sub of submissions) {
            const taskId = String(sub.nestedRoadMapItemId ?? "unknown");
            const existing = latestByTask.get(taskId);
            if (
              !existing ||
              sub.submissionNumber > existing.submissionNumber
            ) {
              latestByTask.set(taskId, sub);
            }
          }

          for (const [taskId, sub] of latestByTask) {
            const taskMeta = tasks.find((t) => t.id === taskId);
            const reviewStatus = mapSubmissionStatusToReview(sub.status);
            const category = getReviewCategory(reviewStatus);
            const itemId = `roadmap-${rid}-${taskId}-${pastorId}`;

            items.push({
              id: itemId,
              type: "roadmap",
              pastorId,
              pastorName,
              title: taskMeta?.name ?? "Task",
              status: reviewStatus,
              category,
              submittedAt: sub.submittedAt ?? sub.createdAt,
              resubmissionCount: Math.max(0, sub.submissionNumber - 1),
              isSeen: seenIds.has(itemId),
              roadmapId: rid,
              roadmapName,
              nestedRoadMapItemId: taskId,
              taskName: taskMeta?.name,
            });
          }
        } else {
          const legacyUserIdCandidates = pastorIdCandidates.filter((u) =>
            isMongoObjectIdLike(u),
          );
          const legacyUserIdForItems =
            legacyUserIdCandidates[0] ?? pastorId;
          const canUseLegacy = isMongoObjectIdLike(legacyUserIdForItems);

          await mapWithConcurrency(tasks, LEGACY_EXTRAS_CONCURRENCY, async (task) => {
            const itemId = `roadmap-${rid}-${task.id}-${legacyUserIdForItems}`;
            const roadmapUserKey = `${rid}:${legacyUserIdForItems}`;

            if (!canUseLegacy) {
              items.push({
                id: itemId,
                type: "roadmap",
                pastorId: legacyUserIdForItems,
                pastorName,
                title: task.name,
                status: "NOT_STARTED",
                category: "not_started",
                submittedAt: null,
                resubmissionCount: 0,
                isSeen: seenIds.has(itemId),
                roadmapId: rid,
                roadmapName,
                nestedRoadMapItemId: task.id,
                taskName: task.name,
              });
              return;
            }

            if (blockedExtrasByRoadmapUser.has(roadmapUserKey)) {
              items.push({
                id: itemId,
                type: "roadmap",
                pastorId: legacyUserIdForItems,
                pastorName,
                title: task.name,
                status: "NOT_STARTED",
                category: "not_started",
                submittedAt: null,
                resubmissionCount: 0,
                isSeen: seenIds.has(itemId),
                roadmapId: rid,
                roadmapName,
                nestedRoadMapItemId: task.id,
                taskName: task.name,
              });
              return;
            }

            try {
              const extrasResp = await getCachedExtras(
                rid,
                task.id,
                legacyUserIdForItems,
              );

              const synthetic = buildLatestLegacyRoadmapSubmission(extrasResp);
              if (!synthetic) {
                items.push({
                  id: itemId,
                  type: "roadmap",
                  pastorId: legacyUserIdForItems,
                  pastorName,
                  title: task.name,
                  status: "NOT_STARTED",
                  category: "not_started",
                  submittedAt: null,
                  resubmissionCount: 0,
                  isSeen: seenIds.has(itemId),
                  roadmapId: rid,
                  roadmapName,
                  nestedRoadMapItemId: task.id,
                  taskName: task.name,
                });
                return;
              }

              items.push({
                id: itemId,
                type: "roadmap",
                pastorId: legacyUserIdForItems,
                pastorName,
                title: task.name,
                status: synthetic.status,
                category: synthetic.category,
                submittedAt: synthetic.submittedAt,
                resubmissionCount: synthetic.resubmissionCount,
                isSeen: seenIds.has(itemId),
                roadmapId: rid,
                roadmapName,
                nestedRoadMapItemId: task.id,
                taskName: task.name,
              });
            } catch (error) {
              if (isReviewCenterTooManyRequestsError(error)) {
                blockedExtrasByRoadmapUser.add(roadmapUserKey);
              }
              items.push({
                id: itemId,
                type: "roadmap",
                pastorId: legacyUserIdForItems,
                pastorName,
                title: task.name,
                status: "NOT_STARTED",
                category: "not_started",
                submittedAt: null,
                resubmissionCount: 0,
                isSeen: seenIds.has(itemId),
                roadmapId: rid,
                roadmapName,
                nestedRoadMapItemId: task.id,
                taskName: task.name,
              });
            }
          });
        }
      } catch {
        continue;
      }
    }

    const assessmentIds: string[] = (mentee.assignedAssessmentIds ?? [])
      .map((x: any) => String(x))
      .filter(Boolean)
      .slice(0, 5);

    for (const aid of assessmentIds) {
      const itemId = `assessment-${aid}-${pastorId}`;
      try {
        const res = await assessmentService.fetchAnswers(aid, pastorId);
        if (!res?.success || !res?.data) {
          items.push({
            id: itemId,
            type: "assessment",
            pastorId,
            pastorName,
            title: assessmentNameById.get(aid) ?? "Assessment",
            status: "NOT_STARTED",
            category: "not_started",
            submittedAt: null,
            resubmissionCount: 0,
            isSeen: seenIds.has(itemId),
            assessmentId: aid,
          });
          continue;
        }

        const answers = res.data;
        const hasSections =
          Array.isArray(answers.sections) && answers.sections.length > 0;
        const hasPreSurvey = !!answers.preSurveySubmittedAt;

        if (!hasSections && !hasPreSurvey) {
          items.push({
            id: itemId,
            type: "assessment",
            pastorId,
            pastorName,
            title: assessmentNameById.get(aid) ?? "Assessment",
            status: "NOT_STARTED",
            category: "not_started",
            submittedAt: null,
            resubmissionCount: 0,
            isSeen: seenIds.has(itemId),
            assessmentId: aid,
          });
          continue;
        }

        const submittedAt =
          answers.preSurveySubmittedAt ?? answers.createdAt;
        const isReviewed = answers.recommendationsSentByMentor === true;
        const reviewStatus = isReviewed ? "REVIEWED" : "SUBMITTED";
        const category = getReviewCategory(reviewStatus);

        items.push({
          id: itemId,
          type: "assessment",
          pastorId,
          pastorName,
          title: assessmentNameById.get(aid) ?? "Assessment",
          status: reviewStatus,
          category,
          submittedAt,
          resubmissionCount: 0,
          isSeen: seenIds.has(itemId),
          assessmentId: aid,
        });
      } catch {
        items.push({
          id: itemId,
          type: "assessment",
          pastorId,
          pastorName,
          title: assessmentNameById.get(aid) ?? "Assessment",
          status: "NOT_STARTED",
          category: "not_started",
          submittedAt: null,
          resubmissionCount: 0,
          isSeen: seenIds.has(itemId),
          assessmentId: aid,
        });
      }
    }
  });

  return items;
}
