export type MicrograntStatus = 'new' | 'pending' | 'accepted' | 'rejected';

export interface GrantField {
    label: string;
    type: 'text' | 'textarea' | 'file' | 'checkbox' | 'select' | 'radio';
    required: boolean;
    options: string[];
    _id: string;
}

export interface GrantFormData {
    _id: string;
    title: string;
    description?: string;
    fields?: GrantField[];
    sections?: Array<{
        _id?: string;
        title: string;
        fields: GrantField[];
    }>;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export interface GrantFormResponse {
    success: boolean;
    message: string;
    data: GrantFormData;
}

export interface GrantApplicationData {
    [key: string]: string | string[] | null;
}

export interface MicrograntPickedFile {
    uri: string;
    name: string;
    mimeType?: string;
}

export interface GrantSubmissionPayload {
    userId: string;
    formId: string;
    answers: GrantApplicationData;
}

export interface GrantSubmissionResponse {
    success: boolean;
    message: string;
    data?: {
        _id: string;
        userId: string;
        answers: GrantApplicationData;
        supportingDoc: string;
        status: 'pending' | 'approved' | 'rejected' | 'under_review';
        createdAt: string;
        updatedAt: string;
    };
}

export interface UseGrantState {
    form: GrantFormResponse | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
}

export interface MicrograntApplication {
    _id: string;
    userId?: {
        _id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
    } | string | null;
    formId?: {
        _id: string;
        title: string;
        description?: string;
    } | string | null;
    answers?: GrantApplicationData;
    supportingDocs?: unknown[];
    supportingDoc?: string;
    status: MicrograntStatus | 'approved' | 'under_review';
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface MicrograntApplicationsApiResponse {
    success: boolean;
    message: string;
    data: MicrograntApplication[];
}

export interface MicrograntApplicationDetail {
    user: {
        _id: string;
        email: string;
        role: string;
    };
    application: MicrograntApplication;
}

export interface MicrograntApplicationDetailApiResponse {
    success: boolean;
    message: string;
    data: MicrograntApplicationDetail;
}

export interface GrantStatusResponse {
    success: boolean;
    message: string;
    data: {
        applicationId: string;
        status: 'new' | 'pending' | 'approved' | 'rejected' | 'under_review';
        submittedAt: string;
        lastUpdated: string;
    };
}

export interface CheckApplicationResponse {
    success: boolean;
    message: string;
    data: {
        applied: boolean;
        status: 'pending' | 'approved' | 'rejected' | 'under_review';
        applicationId: string;
    };
}