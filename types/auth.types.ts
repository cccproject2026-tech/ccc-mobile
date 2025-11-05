export type UserRole = 'pastor' | 'mentor' | 'director' | 'pending'

export type UserStatus = 'new' | 'pending' | 'accepted' | 'rejected';


export interface ChurchInfo {
    id?: string;
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
    churchDetails: ChurchInfo[];
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

export interface LoginUser {
    id: string;
    email: string;
    status: UserStatus;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean
}
export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        user: LoginUser;
    };
}
export interface AuthTokens {
    accessToken: string; // ✅ Must be string
    refreshToken: string; // ✅ Must be string
}


// OTP flow types
export interface SendOtpRequest {
    email: string;
}

export interface SendOtpResponse {
    success: boolean;
    data: {
        message: string;
        expiresIn: number; // seconds
    };
}

// ✅ Verify OTP Types
export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    data: {
        isValid: boolean;
        token: string; // Temporary token for password setting
        message: string;
    };
}
// Password flow types
export interface SetPasswordRequest {
    email: string;
    password: string;
    confirmPassword: string;
}

export interface SetPasswordResponse {
    status: boolean;
    message: string;
    data: any
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
