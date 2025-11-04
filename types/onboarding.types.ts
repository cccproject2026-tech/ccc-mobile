import { ChurchInfo } from './auth.types';
export type InterestStatus = 'none' | 'pending' | 'approved' | 'rejected';

// Interest form data
export interface InterestFormData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    churches: ChurchInfo[];
    title: string;
    yearsInMinistry: string;
    conference: string;
    currentCommunityServiceProjects: string;
    interests: string[];
    comments: string;
    submittedAt?: string;
    status?: InterestStatus;
}

// API Response for interest submission
export interface SubmitInterestResponse {
    applicationId: string;
    message: string;
    status: InterestStatus;
}

// API Response for approval status check
export interface ApprovalStatusResponse {
    applicationId: string;
    status: InterestStatus;
    approvedAt?: string;
    approvedBy?: string; // Director who approved
    rejectedAt?: string;
    rejectionReason?: string;
}
