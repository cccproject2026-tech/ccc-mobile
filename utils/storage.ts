import { PastorProfile, User } from '@/types';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
} as const;

export const storage = {
    // ✅ Token management (Secure) - Ensure values are strings
    setTokens: async (accessToken: string, refreshToken: string) => {
        try {
            // ✅ Ensure they are strings before storing
            const accessTokenStr = String(accessToken);
            const refreshTokenStr = String(refreshToken);

            await Promise.all([
                SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessTokenStr),
                SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshTokenStr),
            ]);

            console.log('✅ Tokens stored in SecureStore');
        } catch (error) {
            console.error('❌ Error storing tokens:', error);
            throw error;
        }
    },

    getAccessToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
        } catch (error) {
            console.error('❌ Error getting access token:', error);
            return null;
        }
    },

    getRefreshToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
        } catch (error) {
            console.error('❌ Error getting refresh token:', error);
            return null;
        }
    },

    clearTokens: async () => {
        try {
            await Promise.all([
                SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
                SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
            ]);
            console.log('✅ Tokens cleared from SecureStore');
        } catch (error) {
            console.error('❌ Error clearing tokens:', error);
        }
    },

    // ✅ User data (Secure) - Properly serialize to string
    setUserData: async (user: User | PastorProfile) => {
        try {
            // ✅ Stringify the user object
            const userString = JSON.stringify(user);
            await SecureStore.setItemAsync(KEYS.USER_DATA, userString);
            console.log('✅ User data stored in SecureStore');
        } catch (error) {
            console.error('❌ Error storing user data:', error);
            throw error;
        }
    },

    getUserData: async (): Promise<User | PastorProfile | null> => {
        try {
            const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ Error getting user data:', error);
            return null;
        }
    },

    clearUserData: async () => {
        try {
            await SecureStore.deleteItemAsync(KEYS.USER_DATA);
            console.log('✅ User data cleared from SecureStore');
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
            console.error('❌ Error clearing all storage:', error);
            throw error;
        }
    },
};
