import { User } from "./mock";

export type UserRole = 'pastor' | 'mentor' | 'director';

export interface MockUserWithPassword extends User {
    password: string;
}

export const STORAGE_KEYS = {
    AUTH_USER: '@ccc_auth_user',
    AUTH_TOKEN: '@ccc_auth_token',
    INTEREST_STATUS: '@ccc_interest_status',
    INTEREST_DATA: '@ccc_interest_data',
    PASSWORD_SET: '@ccc_password_set',
} as const;

export type InterestStatus = 'none' | 'pending' | 'approved' | 'rejected';

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

export interface InterestState {
    status: InterestStatus;
    data: InterestFormData | null;
    submittedAt: string | null;
}
