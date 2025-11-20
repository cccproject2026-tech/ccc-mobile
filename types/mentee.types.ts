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
}


export interface GetMenteesApiResponse {
    success: boolean;
    message: string;
    data: {
        users: Mentee[];
        total: number;
    };
}
