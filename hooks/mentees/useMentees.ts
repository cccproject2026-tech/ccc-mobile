import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { menteesService } from '@/services/mentees.service';
import { Mentee } from '@/types/mentee.types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { mapWithConcurrency, withRetry } from '@/utils/apiConcurrency';

export type UseMenteesOptions = {
    /** Fetch GET /progress/:id per mentee. Disable on list screens that load progress on selection. */
    includeProgress?: boolean;
    /** Fetch GET /users/:id per mentee for profile enrichment. */
    includeProfile?: boolean;
};

// Query key - include mentorId and enrichment flags when filtering by assigned mentor
const getMenteesKey = (
    mentorId?: string | null,
    options?: UseMenteesOptions,
) => {
    const base = mentorId ? (['mentees', 'assigned', mentorId] as const) : (['mentees'] as const);
    const includeProgress = options?.includeProgress !== false;
    const includeProfile = options?.includeProfile !== false;
    return [...base, includeProgress ? 'progress' : 'no-progress', includeProfile ? 'profile' : 'no-profile'] as const;
};

/** Normalize backend user (may have _id) to have id for progress API */
const toMenteeWithId = (m: any): Mentee => ({ ...m, id: m.id ?? m._id });

const getWithRetry = <T = unknown>(url: string) =>
    withRetry(() => apiClient.get<T>(url));

const ROADMAP_STATUS_PRIORITY: Record<string, number> = {
    in_progress: 0,
    "in-progress": 0,
    not_started: 1,
    "not started": 1,
    completed: 2,
};

function getCurrentRoadmapPhase(roadmaps: any[] = []) {
    const roadmapWithPhase = roadmaps
        .filter((item) => item?.phase || item?.phaseNumber)
        .sort((a, b) => {
            const statusDiff =
                (ROADMAP_STATUS_PRIORITY[a?.status] ?? 99) -
                (ROADMAP_STATUS_PRIORITY[b?.status] ?? 99);

            if (statusDiff !== 0) return statusDiff;

            const aUpdated = Date.parse(a?.updatedAt ?? a?.endDate ?? a?.startDate ?? "") || 0;
            const bUpdated = Date.parse(b?.updatedAt ?? b?.endDate ?? b?.startDate ?? "") || 0;

            return bUpdated - aUpdated;
        });

    return roadmapWithPhase[0] ?? null;
}

export const useMentees = (
    limit: number = 10,
    mentorId?: string | null,
    options?: UseMenteesOptions,
) => {
    const isAssignedOnly = Boolean(mentorId);
    const includeProgress = options?.includeProgress !== false;
    const includeProfile = options?.includeProfile !== false;

    return useInfiniteQuery({
        queryKey: getMenteesKey(mentorId, options),
        queryFn: async ({ pageParam = 1 }) => {
            // Mentor context: only assigned mentees. Otherwise: all pastors (e.g. director).
            const res = isAssignedOnly
                ? await menteesService.getAssignedMentees(mentorId!)
                : await menteesService.getMentees(pageParam, limit);

            const backendMentees: Mentee[] = (res.users ?? []).map(toMenteeWithId);

            if (!includeProfile && !includeProgress) {
                return {
                    mentees: backendMentees,
                    total: res.total ?? backendMentees.length,
                    nextPage: isAssignedOnly ? undefined : (backendMentees.length === limit ? pageParam + 1 : undefined),
                };
            }

            // Avoid bursting the backend (429/503). Fetch in a small pool with retry/backoff.
            const menteeDetails = await mapWithConcurrency(
                backendMentees,
                2,
                async (m) => {
                    const [profileResult, progressResult] = await Promise.allSettled([
                        includeProfile
                            ? getWithRetry(ENDPOINTS.USERS.GET_USER(m.id))
                            : Promise.resolve(null),
                        includeProgress
                            ? getWithRetry(ENDPOINTS.USERS.GET_PROGRESS(m.id))
                            : Promise.resolve(null),
                    ]);

                    return {
                        profile:
                            includeProfile && profileResult.status === "fulfilled"
                                ? (profileResult.value as any).data?.data ?? null
                                : null,
                        progress:
                            includeProgress && progressResult.status === "fulfilled"
                                ? (progressResult.value as any).data?.data ?? null
                                : null,
                    };
                },
            );

            
            const mentees = backendMentees.map((m, idx) => {
                const { profile, progress } = menteeDetails[idx] ?? {};
                // Handle different roadmap structures (array or paginated object)
                const roadmapsRaw = Array.isArray(progress?.roadmaps)
                    ? progress.roadmaps
                    : (progress?.roadmaps?.items ?? progress?.roadmaps ?? []);

                const roadmaps = Array.isArray(roadmapsRaw) ? roadmapsRaw : [];

                // Some APIs return roadmap assignments as strings (ids) or objects with varying keys.
                const assignedRoadmapIds = roadmaps
                    .map((item: any) => {
                        if (!item) return undefined;
                        if (typeof item === "string") return item;

                        
                        
                        
                        
                        
                        const candidate =
                            item.roadMapId ??
                            item.roadmapId ??
                            item.roadmap ??
                            item._id ??
                            item.id;

                        if (typeof candidate === "string") return candidate;
                        if (candidate && typeof candidate === "object") {
                            const obj = candidate as any;
                            const nested = obj._id ?? obj.id ?? obj.roadMapId ?? obj.roadmapId;
                            if (typeof nested === "string") return nested;
                        }

                        return undefined;
                    })
                    .filter((x): x is string => typeof x === "string" && x.trim().length > 0);

                const firstRoadmap = roadmaps[0] ?? null;

                
                const assessments = Array.isArray(progress?.assessments)
                    ? progress.assessments
                    : (progress?.assessments?.items ?? []);

                
                const assignedAssessmentIds = assessments.map((item: any) => item.assessmentId || item._id);

                const interest = profile?.interest;
                const mAny = m as Mentee & { profileInfo?: string };
                // Prefer interest profile text; fall back to list-card fields (main) when API omits it
                const description =
                    interest?.profileInfo ||
                    m.description ||
                    mAny.profileInfo ||
                    m.email ||
                    "";
                const phaseSource = getCurrentRoadmapPhase(roadmaps) ?? firstRoadmap;
                const completedOn =
                    m.hasCompleted && includeProgress
                        ? (progress?.updatedAt ?? progress?.completedAt ?? m.updatedAt)
                        : m.hasCompleted
                          ? m.completedOn ?? m.updatedAt
                          : undefined;

                return {
                    ...m,
                    ...profile,
                    id: profile?.id ?? m.id,
                    profilePicture: profile?.profilePicture ?? interest?.profilePicture ?? m.profilePicture,
                    firstName: profile?.firstName ?? interest?.firstName ?? m.firstName,
                    lastName: profile?.lastName ?? interest?.lastName ?? m.lastName,
                    phoneNumber: profile?.phoneNumber ?? interest?.phoneNumber ?? m.phoneNumber,
                    description,
                    progress: includeProgress
                        ? (progress?.overallRoadmapProgress ?? 0)
                        : m.progress,
                    phase: includeProgress ? phaseSource?.phase : m.phase,
                    phaseNumber: includeProgress ? phaseSource?.phaseNumber : m.phaseNumber,
                    completedOn,
                    assignedRoadmapIds: includeProgress ? assignedRoadmapIds : m.assignedRoadmapIds,
                    assignedAssessmentIds: includeProgress ? assignedAssessmentIds : m.assignedAssessmentIds,
                };
            });

            return {
                mentees,
                total: res.total ?? mentees.length,
                nextPage: isAssignedOnly ? undefined : (mentees.length === limit ? pageParam + 1 : undefined),
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 60_000,
        retry: 1,
        enabled: !isAssignedOnly || Boolean(mentorId),
    });
};
