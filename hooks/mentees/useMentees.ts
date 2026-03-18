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

            // fetch progress in parallel for the current page only
            const progressResponses = await Promise.all(
                backendMentees.map(async (m) => {
                    try {
                        const r = await apiClient.get(
                            ENDPOINTS.USERS.GET_PROGRESS(m.id)
                        );
                        return r.data?.data ?? null;
                    } catch {
                        return null;
                    }
                })
            );

            // merge
            const mentees = backendMentees.map((m, idx) => {
                const progress = progressResponses[idx];
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

                return {
                    ...m,
                    // Keep a meaningful line under the mentee name for list cards
                    // (roadmap landing shows this; backend often doesn't provide `description`)
                    description: m.description || m.profileInfo || m.email || "",
                    progress: progress?.overallRoadmapProgress ?? 0,
                    phase: firstRoadmap?.phase,
                    phaseNumber: firstRoadmap?.phaseNumber,
                    completedOn: m.hasCompleted ? m.updatedAt : undefined,
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
