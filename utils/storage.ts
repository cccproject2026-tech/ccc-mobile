import { PastorProfile, User } from '@/types';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
} as const;

export const storage = {
    // Token management (Secure)
    setTokens: async (accessToken: string, refreshToken: string) => {
        await Promise.all([
            SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
            SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
        ]);
    },

    getAccessToken: async (): Promise<string | null> => {
        return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
    },

    getRefreshToken: async (): Promise<string | null> => {
        return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
    },

    clearTokens: async () => {
        await Promise.all([
            SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
            SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
        ]);
    },

    // User data (Secure) - can be minimal User or full PastorProfile
    setUserData: async (user: User | PastorProfile) => {
        await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user));
    },

    getUserData: async (): Promise<User | PastorProfile | null> => {
        const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    },

    clearUserData: async () => {
        await SecureStore.deleteItemAsync(KEYS.USER_DATA);
    },

    // Clear all storage
    clearAll: async () => {
        await Promise.all([
            storage.clearTokens(),
            storage.clearUserData(),
        ]);
    },
};
