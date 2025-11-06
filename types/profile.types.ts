import { PastorProfile, User } from './auth.types';
import { InterestFormData } from './onboarding.types';

// Profile update data (all fields optional for partial updates)
export interface ChurchInfo {
    id?: string;
    churchName: string;  // Changed from 'name'
    churchPhone?: string;
    churchAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    churchWebsite?: string;
    zipCode?: string;
    // Note: removed 'website' and 'zip' if you don't need them
}


export interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    title: string;
    yearsInMinistry: string;
    conference: string;
    communityServiceProjects: string;
    interests: string;
    comments: string;
    profileInfo: string;
    churches: ChurchInfo[];
}
export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    churches?: ChurchInfo[]; // Maps to churchDetails on API
    title?: string;
    yearsInMinistry?: string;
    conference?: string;
    currentCommunityServiceProjects?: string;
    interests?: string[];
    comments?: string;
    bio?: string;
    avatar?: string;
}

export interface CombinedProfile {
    user: User | null;
    interest: InterestFormData | null;
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
}



export interface ProfileResponse {
    profile: PastorProfile;
    message?: string;
}

// For adding/editing individual churches
export interface ChurchFormData extends Omit<ChurchInfo, 'id'> {
    id?: string; // Optional for new churches
}


