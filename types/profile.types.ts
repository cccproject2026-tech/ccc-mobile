
import { User } from './auth.types';
import { InterestFormData } from './onboarding.types';
import { ProgressData } from './progress.types';

// Profile update data (all fields optional for partial updates)
export interface ChurchInfo {
    id?: string;
    churchName: string;
    churchPhone?: string;
    churchAddress?: string;
    city?: string;
    state?: string;
    country?: string;
    churchWebsite?: string;
    zipCode?: string;
}

export interface ProfileData extends User {
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
    churches?: ChurchInfo[];
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
    progress: ProgressData;
}

export interface ProfileResponse {
    profile: InterestFormData;
    message?: string;
}

export interface ChurchFormData extends Omit<ChurchInfo, 'id'> {
    id?: string;
}


export interface Document {
    docId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
}