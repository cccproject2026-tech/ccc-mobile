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

export interface AssignedMentorItem {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
}

export interface MentorDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    profileInfo: string;
    churchDetails: any[];
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

export interface GetAssignedMentorsApiResponse {
    success: boolean;
    message: string;
    data: AssignedMentorItem[];
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
