import { ChurchInfo, UserStatus } from './auth.types';
export type InterestStatus = 'new' | 'pending' | 'accepted' | 'rejected';

// Interest form data
export interface InterestFormData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    churchDetails: ChurchInfo[];
    title: string;
    yearsInMinistry: string;
    conference: string;
    currentCommunityProjects: string;
    interests: string[];
    comments: string;
    submittedAt?: string;
    status?: InterestStatus;
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
    data: {
        status: UserStatus
    }
    applicationId: string;
    status: InterestStatus;
    approvedAt?: string;
    approvedBy?: string; // Director who approved
    rejectedAt?: string;
    rejectionReason?: string;
}
