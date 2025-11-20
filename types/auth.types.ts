// types/auth.types.ts
export type UserRole = 'pastor' | 'mentor' | 'director' | 'pending';
export type UserStatus = 'new' | 'pending' | 'accepted' | 'rejected';

// Single, unified User type
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
    username?: string;
    interestId?: string;
    status: UserStatus;
    isEmailVerified?: boolean;
    profilePicture?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Auth tokens - minimal, secure
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Login/Auth responses
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: User;
    };
}

// OTP flow
export interface SendOtpRequest {
    email: string;
}

export interface SendOtpResponse {
    success: boolean;
    data: {
        message: string;
        expiresIn: number;
    };
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    data: {
        isValid: boolean;
        token: string;
        message: string;
    };
}

// Password
export interface SetPasswordRequest {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface SetPasswordResponse {
    success: boolean;
    message: string;
    data: User;
}

// Token refresh
export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

// Forgot password
export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}


// Reset password
export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}