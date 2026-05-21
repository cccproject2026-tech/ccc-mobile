import { ChurchInfo } from './profile.types';
export type InterestStatus = 'new' | 'pending' | 'accepted' | 'rejected';

// Interest form data
export interface InterestFormData {
    id?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    profilePicture?: string;
    churchDetails?: ChurchInfo[]; // default to [] in code
    interests?: string[];         // default to [] in code
    // optional extras:
    profileInfo?: string;
    title?: string;
    yearsInMinistry?: string;
    conference?: string;
    currentCommunityProjects?: string;
    comments?: string;
    submittedAt?: string;
    status?: "pending" | "accepted" | "rejected" | "new";
    userId?: string;
}
// API Response for interest submission
export interface SubmitInterestResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        profileInfo?: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email: string;
        profilePicture?: string;
        churchDetails?: ChurchInfo[];
        title?: string;
        conference?: string;
        yearsInMinistry?: string;
        currentCommunityProjects?: string;
        interests?: string[];
        comments?: string;
        userId: string;
        status: string;
    }
}

// API Response for approval status check
export interface ApprovalStatusResponse {
    success: boolean;
    message: string;
    data: InterestFormData
}

export type OnboardingNextStep =
    | 'pending'
    | 'verify-email'
    | 'set-password'
    | 'login'
    | 'rejected';

export interface CheckOnboardingStatusRequest {
    email: string;
}

export interface CheckOnboardingStatusData {
    email: string;
    interestStatus: InterestStatus;
    isEmailVerified: boolean;
    isPasswordSet: boolean;
    nextStep: OnboardingNextStep;
}

export interface CheckOnboardingStatusResponse {
    success: boolean;
    data: CheckOnboardingStatusData;
}
