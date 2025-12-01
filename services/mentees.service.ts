import { GetMenteesApiResponse, GetMenteeByEmailApiResponse, MenteeDetail } from '@/types/mentee.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const menteesService = {
    getMentees: async (): Promise<GetMenteesApiResponse['data']> => {
        const response = await apiClient.get<GetMenteesApiResponse>(ENDPOINTS.MENTEES.GET_ALL_MENTEES);
        return response.data.data;
    },
    getMenteeByEmail: async (email: string): Promise<MenteeDetail> => {
        const response = await apiClient.get<GetMenteeByEmailApiResponse>(
            ENDPOINTS.HOME.GET_MENTEE_BY_EMAIL(email)
        );
        return response.data.data;
    },
};


