import { GetMenteesApiResponse, GetAssignedMenteesApiResponse, GetMenteeByEmailApiResponse, MenteeDetail } from '@/types/mentee.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

/** Normalize assigned mentees response to same shape as getMentees (users + total) */
function normalizeAssignedResponse(data: GetAssignedMenteesApiResponse['data']): GetMenteesApiResponse['data'] {
    if (Array.isArray(data)) {
        return { users: data, total: data.length };
    }
    return { users: data.users ?? [], total: data.total ?? data.users?.length ?? 0 };
}

export const menteesService = {
    getMentees: async (page: number = 1, limit: number = 10): Promise<GetMenteesApiResponse['data']> => {
        const response = await apiClient.get<GetMenteesApiResponse>(
            `${ENDPOINTS.MENTEES.GET_ALL_MENTEES}${ENDPOINTS.MENTEES.GET_ALL_MENTEES.includes('?') ? '&' : '?'}page=${page}&limit=${limit}`
        );
        return response.data.data;
    },

    /** Fetches only mentees assigned to the given mentor (for mentor app "My Mentees"). */
    getAssignedMentees: async (mentorId: string): Promise<GetMenteesApiResponse['data']> => {
        const response = await apiClient.get<GetAssignedMenteesApiResponse>(
            ENDPOINTS.MENTEES.GET_ASSIGNED_MENTEES(mentorId)
        );
        return normalizeAssignedResponse(response.data.data);
    },
    getMenteeByEmail: async (email: string): Promise<MenteeDetail> => {
        const response = await apiClient.get<GetMenteeByEmailApiResponse>(
            ENDPOINTS.HOME.GET_MENTEE_BY_EMAIL(email)
        );
        return response.data.data;
    },
};

