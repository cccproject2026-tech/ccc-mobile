import { AssignedMentorItem, GetAssignedMentorsApiResponse, GetMentorByEmailApiResponse, GetMentorsApiResponse, MentorDetail } from '@/types/mentors.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const mentorsService = {
    getMentors: async (): Promise<GetMentorsApiResponse['data']> => {
        const response = await apiClient.get<GetMentorsApiResponse>(ENDPOINTS.HOME.MENTORS);
        return response.data.data;
    },

    getAssignedMentors: async (menteeId: string): Promise<AssignedMentorItem[]> => {
        const response = await apiClient.get<GetAssignedMentorsApiResponse>(
            ENDPOINTS.MENTORS.GET_ASSIGNED_MENTORS(menteeId)
        );
        return response.data.data;
    },

    getMentorByEmail: async (email: string): Promise<MentorDetail> => {
        const response = await apiClient.get<GetMentorByEmailApiResponse>(
            ENDPOINTS.HOME.GET_MENTOR_BY_EMAIL(email)
        );
        return response.data.data;
    },

};
