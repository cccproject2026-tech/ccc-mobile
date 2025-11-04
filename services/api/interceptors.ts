import { useAuthStore } from '@/stores/auth.store';
import { storage } from '@/utils/storage';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await storage.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (__DEV__) {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log(`📥 ${response.status} ${response.config.url}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Skip refresh for auth endpoints
            if (
                originalRequest.url === ENDPOINTS.AUTH.LOGIN ||
                originalRequest.url === ENDPOINTS.AUTH.REFRESH_TOKEN ||
                originalRequest.url === ENDPOINTS.AUTH.SEND_OTP ||
                originalRequest.url === ENDPOINTS.AUTH.VERIFY_OTP ||
                originalRequest.url === ENDPOINTS.AUTH.SET_PASSWORD
            ) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await storage.getRefreshToken();

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call your /refresh-token endpoint
                const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update stored tokens
                await storage.setTokens(accessToken, newRefreshToken);

                // Update Zustand store
                useAuthStore.getState().setTokens({
                    accessToken,
                    refreshToken: newRefreshToken
                });

                // Process queued requests
                processQueue(null, accessToken);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Logout user
                await useAuthStore.getState().logout();

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle network errors
        if (!error.response) {
            console.error('❌ Network Error:', error.message);
            return Promise.reject({
                message: 'Network error. Please check your connection.',
                statusCode: 0,
            });
        }

        // Handle other errors
        const apiError = {
            message: (error.response?.data as any)?.message || 'An error occurred',
            statusCode: error.response?.status || 500,
            errors: (error.response?.data as any)?.errors,
        };

        if (__DEV__) {
            console.error('❌ API Error:', apiError);
        }

        return Promise.reject(apiError);
    }
);
