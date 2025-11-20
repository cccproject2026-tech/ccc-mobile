import { ChurchInfo } from './profile.types';
export type InterestStatus = 'new' | 'pending' | 'accepted' | 'rejected';

// Interest form data
export interface InterestFormData {
    id?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
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
    status?: "pending" | "accepted" | "rejected";
    userId?: string;
}
// API Response for interest submission
export interface SubmitInterestResponse {
    data: {
        id: string;
        userId: string;
    }
}

// API Response for approval status check
export interface ApprovalStatusResponse {
    success: boolean;
    message: string;
    data: InterestFormData
}
