import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export interface MenteeListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
}

export interface MenteeDetail {
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

export interface GetMenteesApiResponse {
    success: boolean;
    message: string;
    data: {
        mentees: MenteeListItem[];
        total: number;
    };
}

export interface GetMenteeByEmailApiResponse {
    success: boolean;
    message: string;
    data: MenteeDetail;
}

export const menteesService = {
    getMentees: async (): Promise<GetMenteesApiResponse['data']> => {
        const response = await apiClient.get<GetMenteesApiResponse>(ENDPOINTS.HOME.MENTEES);
        return response.data.data;
    },
    getMenteeByEmail: async (email: string): Promise<MenteeDetail> => {
        const response = await apiClient.get<GetMenteeByEmailApiResponse>(
            ENDPOINTS.HOME.GET_MENTEE_BY_EMAIL(email)
        );
        return response.data.data;
    },
};


