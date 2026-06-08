import {
    LoginCredentials,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResetPasswordRequest,
    SendOtpRequest,
    SendOtpResponse,
    SetPasswordRequest,
    SetPasswordResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '@/types/auth.types';
import {
    CheckOnboardingStatusRequest,
    CheckOnboardingStatusResponse,
} from '@/types/onboarding.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const authService = {
    
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

    
    sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
        // Simulate API delay
        

        

        
        
        
        
        
        
        

        

        const response = await apiClient.post<SendOtpResponse>(
            ENDPOINTS.AUTH.SEND_OTP,
            data
        );
        return response.data;

    },

    
    verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
        console.log('📤 Verifying OTP (MOCK):', data.otp, 'for email:', data.email);

        // Simulate API delay
        

        
        
        

        
        
        
        
        
        
        
        
        
        
        
        

        

        const response = await apiClient.post<VerifyOtpResponse>(
            ENDPOINTS.AUTH.VERIFY_OTP,
            data
        );
        return response.data;

    },

    
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

    
    logout: async (): Promise<void> => {
        console.log('📤 Logging out');
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },

    
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        console.log('📤 Forgot password for:', email);
        const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            email,
        });
        return response.data;
    },

    
    resetPassword: async (
        data: ResetPasswordRequest
    ): Promise<{ message: string }> => {
        console.log('📤 Resetting password');
        const response = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
        return response.data;
    },

    checkOnboardingStatus: async (
        data: CheckOnboardingStatusRequest
    ): Promise<CheckOnboardingStatusResponse> => {
        console.log('📤 Checking onboarding status for:', data.email);
        const response = await apiClient.post<CheckOnboardingStatusResponse>(
            ENDPOINTS.AUTH.CHECK_ONBOARDING_STATUS,
            data
        );
        return response.data;
    },
};
