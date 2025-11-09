export interface GrantField {
    label: string;
    type: 'text' | 'textarea' | 'file' | 'checkbox' | 'select' | 'radio';
    required: boolean;
    options: string[];
    _id: string;
}

export interface GrantFormResponse {
    data: {
        _id: string;
        title: string;
        description: string;
        fields: GrantField[];
        createdAt: string;
        updatedAt: string;
        __v: number;
    }
}

export interface GrantApplicationData {
    [key: string]: string | string[] | null;
}

export interface GrantSubmissionPayload {
    userId: string;
    answers: GrantApplicationData;
    supportingDoc: string;
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
