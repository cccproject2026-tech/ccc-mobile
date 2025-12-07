const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const resolvedBaseUrl = apiUrl
    ? `${apiUrl}/api/v1`
    : 'http://13.221.25.133/api/v1';

export const API_CONFIG = {
    BASE_URL: resolvedBaseUrl,
    TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000,
} as const;
