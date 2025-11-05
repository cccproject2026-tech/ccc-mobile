// src/services/auth.service.ts
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
    // Login with email + password (✅ REAL API)
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        console.log('📤 Login request:', { email: credentials.email });

        const response = await apiClient.post<LoginResponse>(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );

        console.log('Response Raw', response.data)
        console.log('📥 Login response:', {
            success: response.data.success,
            message: response.data.message,
            userEmail: response.data.data.user.email,
            userRole: response.data.data.user.role,
            // userStatus: response.data.data.user.status,
            // isEmailVerified: response.data.data.user.isEmailVerified,
            hasAccessToken: !!response.data.data.accessToken,
            hasRefreshToken: !!response.data.data.refreshToken,
        });

        return response.data;
    },
    // ✅ MOCK: Send OTP to email
    sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
        console.log('📤 Sending OTP (MOCK) to:', data.email);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('✅ OTP sent successfully (MOCK)');

        return {
            success: true,
            data: {
                message: 'OTP sent successfully',
                expiresIn: 300,
            },
        };

        // ✅ REAL API (uncomment when backend is ready)
        /*
        const response = await apiClient.post<SendOtpResponse>(
          ENDPOINTS.AUTH.SEND_OTP,
          data
        );
        return response.data;
        */
    },

    // ✅ MOCK: Verify OTP code
    verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
        console.log('📤 Verifying OTP (MOCK):', data.otp, 'for email:', data.email);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Accept "1234" as valid OTP for testing
        if (data.otp === '1234') {
            console.log('✅ OTP verified successfully (MOCK)');

            return {
                success: true,
                data: {
                    isValid: true,
                    token: `mock_otp_token_${Date.now()}`,
                    message: 'Email verified successfully',
                },
            };
        } else {
            console.log('❌ Invalid OTP (MOCK)');
            throw new Error('Invalid OTP. Use 1234 for testing.');
        }

        // ✅ REAL API (uncomment when backend is ready)
        /*
        const response = await apiClient.post<VerifyOtpResponse>(
          ENDPOINTS.AUTH.VERIFY_OTP,
          data
        );
        return response.data;
        */
    },

    // Set password (✅ REAL API)
    setPassword: async (data: SetPasswordRequest): Promise<SetPasswordResponse> => {
        const response = await apiClient.post<SetPasswordResponse>(
            ENDPOINTS.AUTH.SET_PASSWORD,
            data
        );
        return response.data;
    },

    // Forgot password (✅ REAL API)
    forgotPassword: async (
        data: ForgotPasswordRequest
    ): Promise<ForgotPasswordResponse> => {
        const response = await apiClient.post<ForgotPasswordResponse>(
            ENDPOINTS.AUTH.FORGOT_PASSWORD,
            data
        );
        return response.data;
    },

    // Reset password (✅ REAL API)
    resetPassword: async (
        data: ResetPasswordRequest
    ): Promise<ResetPasswordResponse> => {
        const response = await apiClient.post<ResetPasswordResponse>(
            ENDPOINTS.AUTH.RESET_PASSWORD,
            data
        );
        return response.data;
    },

    // Refresh token (✅ REAL API)
    refreshToken: async (
        data: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> => {
        const response = await apiClient.post<RefreshTokenResponse>(
            ENDPOINTS.AUTH.REFRESH_TOKEN,
            data
        );
        return response.data;
    },

    // Logout (✅ REAL API)
    logout: async (): Promise<void> => {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },

    // Get user by ID (✅ REAL API)
    getUserById: async (userId: string): Promise<User | PastorProfile> => {
        const response = await apiClient.get<User | PastorProfile>(
            ENDPOINTS.USERS.GET_USER(userId)
        );
        return response.data;
    },
};
