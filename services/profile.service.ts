import { Document, InterestFormData, Notification, NotificationsResponse, User } from '@/types';
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

    getAllUsers: async (role?: string): Promise<User[]> => {
        const response = await apiClient.get<{ success: boolean; data: User[] }>(
            ENDPOINTS.USERS.GET_ALL_USERS(role as any)
        );
        return response.data.data;
    },
    // Upload avatar
    uploadProfilePicture: async (userId: string, file: any): Promise<User> => {
        console.log('📤 Uploading profile picture for user:', userId);

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || 'profile-picture.jpg',
        } as any);

        const response = await apiClient.patch<{ success: boolean; data: User }>(
            ENDPOINTS.USERS.UPDATE_PROFILE_PICTURE(userId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        console.log('✅ Profile picture uploaded successfully:', response.data.data);
        return response.data.data;
    },
    getDocuments: async (userId: string): Promise<Document[]> => {
        console.log('📤 Fetching documents for user:', userId);

        const response = await apiClient.get<{ success: boolean; data: Document[] }>(
            ENDPOINTS.USERS.GET_DOCUMENTS(userId)
        );

        console.log('📥 Documents fetched:', response.data.data);
        return response.data.data;
    },

    // Upload document
    uploadDocument: async (userId: string, file: any): Promise<Document> => {
        console.log('📤 Uploading document for user:', userId);

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType || file.type || 'application/octet-stream',
            name: file.name || file.fileName || `document-${Date.now()}`,
        } as any);

        const response = await apiClient.post<{ success: boolean; data: Document }>(
            ENDPOINTS.USERS.UPLOAD_DOCUMENT(userId),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        console.log('✅ Document uploaded successfully:', response.data.data);
        return response.data.data;
    },

    // Delete document
    deleteDocument: async (userId: string, documentUrl: string): Promise<void> => {
        console.log('📤 Deleting document for user:', userId, documentUrl);

        await apiClient.delete(
            ENDPOINTS.USERS.DELETE_DOCUMENT(userId),
            {
                data: { documentUrl },
            }
        );

        console.log('✅ Document deleted successfully');
    },

    getNotifications: async (userId: string): Promise<Notification[]> => {
        console.log("📤 Fetching notifications for user:", userId);

        const response = await apiClient.get<NotificationsResponse>(
            ENDPOINTS.USERS.GET_NOTIFICATIONS(userId)
        );

        const notifications = response.data.data?.notifications || [];

        console.log("📥 Notifications fetched:", notifications);

        return notifications;
    },
};
