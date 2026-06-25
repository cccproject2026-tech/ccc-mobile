
export type UserRole =
  | 'pastor'
  | 'lay-leader'
  | 'seminarian'
  | 'mentor'
  | 'director'
  | 'pending'
  | 'field-mentor';
export type UserStatus = 'new' | 'pending' | 'accepted' | 'rejected';

export interface FieldMentorInvitation {
    _id?: string;
    invitedBy?: string | { _id?: string };
    invitedAt?: string;
    token?: string;
    expiresAt?: string;
}

export interface User {
    id: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName?: string;
    role: UserRole;
    username?: string;
    interestId?: string;
    status: UserStatus;
    isEmailVerified?: boolean;
    profilePicture?: string;
    hasCompleted?: boolean;
    hasIssuedCertificate?: boolean;
    fieldMentorInvitation?: FieldMentorInvitation;
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

export interface SendOtpRequest {
    email: string;
    purpose?: string;
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
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user?: User;
    };
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}