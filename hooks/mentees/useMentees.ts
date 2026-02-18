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

// Query key
const MENTEES_KEY = ['mentees'];

export const useMentees = (limit: number = 10) => {
    return useInfiniteQuery({
        queryKey: MENTEES_KEY,
        queryFn: async ({ pageParam = 1 }) => {
            // fetch backend with pagination
            const res = await menteesService.getMentees(pageParam, limit);

            // FIX: backend uses `users`, not `mentees`
            const backendMentees: Mentee[] = res.users ?? [];

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
                const firstRoadmap = progress?.roadmaps?.items?.[0] ?? null;
                const assignedRoadmapIds = progress?.roadmaps?.items?.map((item: any) => item.roadMapId) ?? [];

                return {
                    ...m,
                    description: "",
                    progress: progress?.overallRoadmapProgress ?? 0,
                    phase: firstRoadmap?.phase,
                    phaseNumber: firstRoadmap?.phaseNumber,
                    completedOn: m.hasCompleted ? m.updatedAt : undefined,
                    assignedRoadmapIds,
                };
            });

            return {
                mentees,
                total: res.total ?? mentees.length,
                nextPage: mentees.length === limit ? pageParam + 1 : undefined,
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 2000,
        retry: 1,
    });
};
