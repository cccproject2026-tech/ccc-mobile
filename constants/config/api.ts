export const API_CONFIG = {
    BASE_URL: `${process.env.EXPO_PUBLIC_API_URL}` || 'http://13.221.25.133',
    AUTH_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/',
    TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000,
} as const;
