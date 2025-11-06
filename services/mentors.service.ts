import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export interface MentorListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
}

export interface MentorDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    profileInfo: string;
    churchDetails: any[]; // You can create a more specific type if needed
    conference: string;
}

export interface GetMentorsApiResponse {
    success: boolean;
    message: string;
    data: {
        mentors: MentorListItem[];
        total: number;
    };
}

export interface GetMentorByEmailApiResponse {
    success: boolean;
    message: string;
    data: MentorDetail;
}

export const mentorsService = {
    getMentors: async (): Promise<GetMentorsApiResponse['data']> => {
        const response = await apiClient.get<GetMentorsApiResponse>(ENDPOINTS.HOME.MENTORS);
        return response.data.data;
    },
    getMentorByEmail: async (email: string): Promise<MentorDetail> => {
        const response = await apiClient.get<GetMentorByEmailApiResponse>(
            ENDPOINTS.HOME.GET_MENTOR_BY_EMAIL(email)
        );
        return response.data.data;
    },
};


