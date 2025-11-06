// utils/storage.ts
import { User } from '@/types/auth.types';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
} as const;

export const storage = {
    // ✅ Token management (Secure)
    setTokens: async (accessToken: string, refreshToken: string) => {
        try {
            if (!accessToken || !refreshToken) {
                throw new Error('Tokens cannot be empty');
            }

            await Promise.all([
                SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
                SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
            ]);

            console.log('✅ Tokens stored securely');
        } catch (error) {
            console.error('❌ Error storing tokens:', error);
            throw error;
        }
    },

    getAccessToken: async (): Promise<string | null> => {
        try {
            const token = await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
            return token || null;
        } catch (error) {
            console.error('❌ Error getting access token:', error);
            return null;
        }
    },

    getRefreshToken: async (): Promise<string | null> => {
        try {
            const token = await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
            return token || null;
        } catch (error) {
            console.error('❌ Error getting refresh token:', error);
            return null;
        }
    },

    getTokens: async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
        try {
            const [accessToken, refreshToken] = await Promise.all([
                SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),
                SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),
            ]);

            if (accessToken && refreshToken) {
                return { accessToken, refreshToken };
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting tokens:', error);
            return null;
        }
    },

    clearTokens: async () => {
        try {
            await Promise.all([
                SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
                SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
            ]);
            console.log('✅ Tokens cleared');
        } catch (error) {
            console.error('❌ Error clearing tokens:', error);
        }
    },

    // ✅ User data (Secure)
    setUserData: async (user: User) => {
        try {
            const userString = JSON.stringify(user);
            await SecureStore.setItemAsync(KEYS.USER_DATA, userString);
            console.log('✅ User data stored');
        } catch (error) {
            console.error('❌ Error storing user data:', error);
            throw error;
        }
    },

    getUserData: async (): Promise<User | null> => {
        try {
            const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
            if (!data) return null;
            return JSON.parse(data) as User;
        } catch (error) {
            console.error('❌ Error getting user data:', error);
            return null;
        }
    },

    clearUserData: async () => {
        try {
            await SecureStore.deleteItemAsync(KEYS.USER_DATA);
            console.log('✅ User data cleared');
        } catch (error) {
            console.error('❌ Error clearing user data:', error);
        }
    },

    // Clear all storage
    clearAll: async () => {
        try {
            await Promise.all([
                storage.clearTokens(),
                storage.clearUserData(),
            ]);
            console.log('✅ All storage cleared');
        } catch (error) {
            console.error('❌ Error clearing storage:', error);
        }
    },
};
