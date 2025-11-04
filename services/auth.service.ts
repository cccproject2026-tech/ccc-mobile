import {
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginCredentials,
    LoginResponse,
    PastorProfile,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    SendOtpRequest,
    SendOtpResponse,
    SetPasswordRequest,
    SetPasswordResponse,
    User,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '@/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const authService = {
    // Login with email + password
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );
        return response.data;
    },

    // Step 1: Send OTP to email (for new users after interest approval)
    sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
        const response = await apiClient.post<SendOtpResponse>(
            ENDPOINTS.AUTH.SEND_OTP,
            data
        );
        return response.data;
    },

    // Step 2: Verify OTP code
    verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
        const response = await apiClient.post<VerifyOtpResponse>(
            ENDPOINTS.AUTH.VERIFY_OTP,
            data
        );
        return response.data;
    },

    // Step 3: Set password (after OTP verification)
    setPassword: async (data: SetPasswordRequest): Promise<SetPasswordResponse> => {
        const response = await apiClient.post<SetPasswordResponse>(
            ENDPOINTS.AUTH.SET_PASSWORD,
            data
        );
        return response.data;
    },

    // Forgot password - Send reset link/token
    forgotPassword: async (
        data: ForgotPasswordRequest
    ): Promise<ForgotPasswordResponse> => {
        const response = await apiClient.post<ForgotPasswordResponse>(
            ENDPOINTS.AUTH.FORGOT_PASSWORD,
            data
        );
        return response.data;
    },

    // Reset password with token
    resetPassword: async (
        data: ResetPasswordRequest
    ): Promise<ResetPasswordResponse> => {
        const response = await apiClient.post<ResetPasswordResponse>(
            ENDPOINTS.AUTH.RESET_PASSWORD,
            data
        );
        return response.data;
    },

    // Refresh access token
    refreshToken: async (
        data: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> => {
        const response = await apiClient.post<RefreshTokenResponse>(
            ENDPOINTS.AUTH.REFRESH_TOKEN,
            data
        );
        return response.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },

    // Get user by ID
    getUserById: async (userId: string): Promise<User | PastorProfile> => {
        const response = await apiClient.get<User | PastorProfile>(
            ENDPOINTS.USERS.GET_USER(userId)
        );
        return response.data;
    },
};
