import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { UserRole, User } from '@/types/auth.types';

export interface GetUsersApiResponse {
    success: boolean;
    message: string;
    data: {
        users: User[];
        page: number;
        totalPages: number;
        total: number;
    };
}

export interface IssueCertificateRequest {
    issuedBy: string;
}

export const usersService = {
    getUsersByRole: async (role: UserRole, page: number = 1, limit: number = 10): Promise<GetUsersApiResponse['data']> => {
        const response = await apiClient.get<GetUsersApiResponse>(
            `${ENDPOINTS.USERS.GET_ALL_USERS(role)}${ENDPOINTS.USERS.GET_ALL_USERS(role).includes('?') ? '&' : '?'}page=${page}&limit=${limit}&roleMatch=mixed&t=${Date.now()}`
        );
        return response.data.data;
    },
    markUserCompleted: async (userId: string): Promise<User> => {
        const response = await apiClient.patch<{ success: boolean; message: string; data: User }>(
            ENDPOINTS.USERS.MARK_COMPLETE(userId)
        );
        return response.data.data;
    },
    issueCertificate: async (userId: string, payload: IssueCertificateRequest): Promise<User> => {
        const response = await apiClient.post<{ success: boolean; message: string; data: User }>(
            ENDPOINTS.USERS.ISSUE_CERTIFICATE(userId),
            payload
        );
        return response.data.data;
    },
};
