import {
    LoginCredentials,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    SendOtpRequest,
    SendOtpResponse,
    SetPasswordRequest,
    SetPasswordResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '@/types/auth.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const authService = {
    // Login with credentials
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        console.log('📤 Login request:', { email: credentials.email });
        const response = await apiClient.post<LoginResponse>(
            ENDPOINTS.AUTH.LOGIN,
            credentials
        );
        console.log('📥 Login response:', {
            userEmail: response.data.data.user.email,
            userRole: response.data.data.user.role,
            hasTokens: !!response.data.data.accessToken,
        });
        return response.data;
    },

    // Send OTP to email
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

    // Set password
    setPassword: async (data: SetPasswordRequest): Promise<SetPasswordResponse> => {
        console.log('📤 Setting password for:', data.email);
        const response = await apiClient.post<SetPasswordResponse>(
            ENDPOINTS.AUTH.SET_PASSWORD,
            data
        );
        return response.data;
    },

    // Refresh token
    refreshToken: async (
        data: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> => {
        console.log('📤 Refreshing token');
        const response = await apiClient.post<RefreshTokenResponse>(
            ENDPOINTS.AUTH.REFRESH_TOKEN,
            data
        );
        return response.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        console.log('📤 Logging out');
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        console.log('📤 Forgot password for:', email);
        const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            email,
        });
        return response.data;
    },

    // Reset password
    resetPassword: async (
        token: string,
        newPassword: string
    ): Promise<{ message: string }> => {
        console.log('📤 Resetting password');
        const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
            token,
            newPassword,
        });
        return response.data;
    },
};
