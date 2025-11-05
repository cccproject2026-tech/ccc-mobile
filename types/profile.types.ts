import { ChurchInfo, PastorProfile } from './auth.types';

// Profile update data (all fields optional for partial updates)
export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    churches?: ChurchInfo[];
    title?: string;
    yearsInMinistry?: string;
    conference?: string;
    currentCommunityServiceProjects?: string;
    interests?: string[];
    comments?: string;
    avatar?: string;
    bio?: string;
}

export interface ProfileResponse {
    profile: PastorProfile;
    message?: string;
}

// For adding/editing individual churches
export interface ChurchFormData extends Omit<ChurchInfo, 'id'> {
    id?: string; // Optional for new churches
}