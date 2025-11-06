// services/profile.service.ts
import { InterestFormData, User } from '@/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const profileService = {
    // Get current user's details
    getMyProfile: async (userId: string): Promise<User> => {
        console.log('📤 Fetching profile for user:', userId);

        const response = await apiClient.get<{ success: boolean; data: User }>(
            ENDPOINTS.USERS.GET_USER(userId)
        );

        console.log('📥 Profile fetched:', response.data.data);
        return response.data.data;
    },

    // Get current user's interest details
    getInterestDetails: async (email: string): Promise<InterestFormData> => {
        console.log('📤 Fetching interest details for user:', email);

        const response = await apiClient.get<{ success: boolean; message?: string; data: InterestFormData }>(
            ENDPOINTS.USERS.GET_INTERESTS(email)
        );

        console.log('📥 Interest details fetched:', response.data.data);
        return response.data.data;
    },

    // Update user profile (basic info like firstName, lastName, phoneNumber)
    updateUserProfile: async (
        userId: string,
        updates: Partial<User>
    ): Promise<User> => {
        console.log('📤 Updating user profile for:', userId, updates);

        const response = await apiClient.patch<{ success: boolean; data: User }>(
            ENDPOINTS.USERS.UPDATE_USER(userId),
            updates
        );

        console.log('📥 User profile updated:', response.data.data);
        return response.data.data;
    },

    // Update user interest details (profileInfo, church details, etc.)
    updateInterestDetails: async (
        email: string,
        updates: Partial<InterestFormData>
    ): Promise<InterestFormData> => {
        console.log('📤 Updating interest details for:', email, updates);

        const response = await apiClient.patch<{ success: boolean; data: InterestFormData }>(
            ENDPOINTS.USERS.UPDATE_INTERESTS(email),
            updates
        );

        console.log('📥 Interest details updated:', response.data.data);
        return response.data.data;
    },

    // Get user by ID (if needed)
    getUserById: async (userId: string): Promise<User> => {
        const response = await apiClient.get<{ success: boolean; data: User }>(
            ENDPOINTS.USERS.GET_USER(userId)
        );
        return response.data.data;
    },

    // Upload avatar
    uploadAvatar: async (file: any): Promise<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append('avatar', {
            uri: file.uri,
            type: file.type,
            name: file.fileName,
        } as any);

        const response = await apiClient.post<{ success: boolean; data: { avatarUrl: string } }>(
            ENDPOINTS.PROFILE.UPLOAD_AVATAR,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data.data;
    },
};
