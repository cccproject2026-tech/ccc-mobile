import { User } from "./auth.types";

export interface Mentee extends User {
    roleId?: string;

    // Completion data from backend
    hasCompleted?: boolean;
    hasIssuedCertificate?: boolean;

    // Derived UI fields (from progress API)
    progress?: number;
    phase?: string;
    phaseNumber?: number;

    // UI state fields
    description?: string;
    completedOn?: string;

    // Optional UI features
    isFieldMentor?: boolean;
    scholarshipAmount?: number | string;
    dateOfApproval?: string;
    lastContacted?: string;
    totalMentors?: number;
    assignedRoadmapIds?: string[];
    assignedAssessmentIds?: string[];
    assignedId?: string[];
}


export interface GetMenteesApiResponse {
    success: boolean;
    message: string;
    data: {
        users: Mentee[];
        total: number;
    };
}

/** Response from GET /users/:mentorId/assigned - mentees assigned to this mentor */
export interface GetAssignedMenteesApiResponse {
    success: boolean;
    message: string;
    data: Mentee[] | { users: Mentee[]; total?: number };
}

export interface MenteeDetail {
    id: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    profilePicture?: string;
    phoneNumber?: string;
    title?: string;
    yearsInMinistry?: string;
    profileInfo: string;
    churchDetails: any[];
    conference: string;
    currentCommunityProjects?: string;
    interests?: string[];
    comments?: string;
}

export interface GetMenteeByEmailApiResponse {
    success: boolean;
    message: string;
    data: MenteeDetail;
}