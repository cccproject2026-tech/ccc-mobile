export type UserRole = 'pastor' | 'mentor' | 'director';

export interface ChurchInfo {
    id: string;
    churchName: string;
    churchPhone: string;
    churchWebsite: string;
    churchAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface User {
    id: string;
    email: string;
    role: UserRole;
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface PastorProfile extends User {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    churches: ChurchInfo[];
    title: string;
    yearsInMinistry: string;
    conference: string;
    currentCommunityServiceProjects: string;
    interests: string[];
    comments: string;
    avatar?: string;
    bio?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Login flow types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User | PastorProfile;
    accessToken: string;
    refreshToken: string;
}

// OTP flow types
export interface SendOtpRequest {
    email: string;
}

export interface SendOtpResponse {
    message: string;
    expiresIn: number; // seconds
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponse {
    isValid: boolean;
    message: string;
    token?: string; // Temporary token for setting password
}

// Password flow types
export interface SetPasswordRequest {
    token: string; // From OTP verification
    password: string;
}

export interface SetPasswordResponse {
    user: PastorProfile;
    accessToken: string;
    refreshToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordRequest {
    token: string; // From email link
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}
