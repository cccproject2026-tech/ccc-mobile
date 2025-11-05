import { InterestFormData, PastorProfile, UpdateProfileData } from '@/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const profileService = {
    // Get current user's details
    getMyProfile: async (userId: string): Promise<PastorProfile> => {
        console.log('📤 Fetching profile for user:', userId);

        const response = await apiClient.get<{ success: boolean; data: PastorProfile }>(
            ENDPOINTS.USERS.GET_USER(userId)
        );

        console.log('📥 Profile fetched:', response.data.data);
        return response.data.data;
    },

    // Get current user's profile
    getInterestDetails: async (email: string): Promise<InterestFormData> => {
        console.log('📤 Fetching profile for user:', email);

        const response = await apiClient.get<{ success: boolean; message?: string; data: InterestFormData }>(
            ENDPOINTS.USERS.GET_INTERESTS(email)
        );

        console.log('📥 Profile fetched:', response.data.data);
        return response.data.data;
    },

    // Update profile
    updateProfile: async (
        updates: UpdateProfileData
    ): Promise<PastorProfile> => {
        const response = await apiClient.patch<PastorProfile>(
            ENDPOINTS.PROFILE.UPDATE_PROFILE,
            updates
        );
        return response.data;
    },

    // Get user by ID (if needed)
    getUserById: async (userId: string): Promise<PastorProfile> => {
        const response = await apiClient.get<PastorProfile>(
            ENDPOINTS.USERS.GET_USER(userId)
        );
        return response.data;
    },

    // Upload avatar (if you implement file upload)
    uploadAvatar: async (file: any): Promise<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append('avatar', {
            uri: file.uri,
            type: file.type,
            name: file.fileName,
        } as any);

        const response = await apiClient.post<{ avatarUrl: string }>(
            ENDPOINTS.PROFILE.UPLOAD_AVATAR,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },
};
