// import { Mentee } from '@/components/director/MenteeCard';
// import { menteesService } from '@/services/mentees.service';
// import { useQuery } from '@tanstack/react-query';

// const transformMentee = (mentee: any): Mentee => {
//     return {
//         id: mentee.id,
//         name: `${mentee.firstName} ${mentee.lastName}`.trim(),
//         role: mentee.role || undefined,
//         profilePicture: mentee.profilePicture || undefined,
//         description: mentee.description || mentee.profileInfo || undefined,

//         // Status mapping
//         status: mentee.status as 'new' | 'pending' | 'approved' | 'rejected',

//         // Completed + certificate fields
//         isCompleted: mentee.hasCompleted ?? false,
//         hasCertificate: mentee.hasIssuedCertificate ?? false,

//         // Backend does NOT return a completion date
//         completedOn: mentee.hasCompleted ? mentee.updatedAt : undefined,

//         // Not provided by backend
//         lastContacted: undefined,
//         totalMentors: undefined,
//         phase: undefined,
//         phaseNumber: undefined,
//         progress: undefined,
//         isFieldMentor: undefined,
//         scholarshipAmount: undefined,
//         dateOfApproval: undefined,
//     };
// };

// export const useMentees = () => {
//     const query = useQuery({
//         queryKey: ['mentees'],
//         queryFn: () => menteesService.getMentees(),
//         staleTime: 2000,
//         retry: 2,
//     });

//     const transformedData = query.data
//         ? {
//             mentees: query.data.mentees.map(transformMentee),
//             total: query.data.total,
//         }
//         : undefined;

//     return {
//         ...query,
//         data: transformedData,
//         mentees: transformedData?.mentees ?? [],
//         total: transformedData?.total ?? 0,
//     };
// };


// hooks/mentees/useMentees.ts
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { menteesService } from '@/services/mentees.service';
import { Mentee } from '@/types/mentee.types';
import { useInfiniteQuery } from '@tanstack/react-query';

// Query key - include mentorId when filtering by assigned mentor
const getMenteesKey = (mentorId?: string | null) => (mentorId ? ['mentees', 'assigned', mentorId] as const : ['mentees'] as const);

/** Normalize backend user (may have _id) to have id for progress API */
const toMenteeWithId = (m: any): Mentee => ({ ...m, id: m.id ?? m._id });

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

export const useMentees = (limit: number = 10, mentorId?: string | null) => {
    const isAssignedOnly = Boolean(mentorId);

    return useInfiniteQuery({
        queryKey: getMenteesKey(mentorId),
        queryFn: async ({ pageParam = 1 }) => {
            // Mentor context: only assigned mentees. Otherwise: all pastors (e.g. director).
            const res = isAssignedOnly
                ? await menteesService.getAssignedMentees(mentorId!)
                : await menteesService.getMentees(pageParam, limit);

            const backendMentees: Mentee[] = (res.users ?? []).map(toMenteeWithId);

            // Fetch profile + progress in parallel so cards have complete user info.
            const menteeDetails = await Promise.all(
                backendMentees.map(async (m) => {
                    const [profileResult, progressResult] = await Promise.allSettled([
                        apiClient.get(ENDPOINTS.USERS.GET_USER(m.id)),
                        apiClient.get(ENDPOINTS.USERS.GET_PROGRESS(m.id)),
                    ]);

                    return {
                        profile:
                            profileResult.status === "fulfilled"
                                ? profileResult.value.data?.data ?? null
                                : null,
                        progress:
                            progressResult.status === "fulfilled"
                                ? progressResult.value.data?.data ?? null
                                : null,
                    };
                })
            );

            // merge
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
                        if (typeof item === 'string') return item;
                        return item.roadMapId || item.roadmapId || item._id || item.id;
                    })
                    .filter(Boolean) as string[];

                const firstRoadmap = roadmaps[0] ?? null;

                // Handle different assessment structures
                const assessments = Array.isArray(progress?.assessments)
                    ? progress.assessments
                    : (progress?.assessments?.items ?? []);

                // Extract assigned assessment IDs
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
                const completedOn = m.hasCompleted
                    ? (progress?.updatedAt ?? progress?.completedAt ?? m.updatedAt)
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
                    progress: progress?.overallRoadmapProgress ?? 0,
                    phase: phaseSource?.phase,
                    phaseNumber: phaseSource?.phaseNumber,
                    completedOn,
                    assignedRoadmapIds,
                    assignedAssessmentIds,
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
        staleTime: 2000,
        retry: 1,
        enabled: !isAssignedOnly || Boolean(mentorId),
    });
};
