import { Notification } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { getNotificationId } from '@/utils/notifications';

const getReadStorageKey = (userId: string) => `notifications-read:${userId}`;

export const notificationsService = {
    registerDeviceToken: async (userId: string, token: string) => {
        return apiClient.post(ENDPOINTS.HOME.REGISTER_DEVICE_TOKEN, {
            userId,
            token,
        });
    },

    getReadNotificationIds: async (userId: string): Promise<string[]> => {
        const stored = await AsyncStorage.getItem(getReadStorageKey(userId));

        if (!stored) {
            return [];
        }

        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    },

    markNotificationAsRead: async (userId: string, notification: Partial<Notification>) => {
        const notificationId = getNotificationId(notification);
        if (!notificationId) {
            return;
        }

        const existingIds = await notificationsService.getReadNotificationIds(userId);
        if (existingIds.includes(notificationId)) {
            return;
        }

        await AsyncStorage.setItem(
            getReadStorageKey(userId),
            JSON.stringify([...existingIds, notificationId])
        );
    },
};
