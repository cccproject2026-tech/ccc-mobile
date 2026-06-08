import { grantService } from '@/services/grant.service';
import { GrantFormResponse, GrantSubmissionPayload, GrantSubmissionResponse, MicrograntApplicationDetail, MicrograntPickedFile } from '@/types/grant.type';
import { useCallback, useState } from 'react';

interface UseGrantState {
    form: GrantFormResponse | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    success: boolean;
}

const INITIAL_STATE: UseGrantState = {
    form: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    success: false,
};

export const useGrant = () => {
    const [state, setState] = useState<UseGrantState>(INITIAL_STATE);

    /**
     * Fetch grant form on component mount or when called
     */
    const fetchGrantForm = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const formData = await grantService.getGrantForm();
            setState((prev) => ({
                ...prev,
                form: formData,
                isLoading: false,
            }));
            return formData;
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || 'Failed to fetch grant form';
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                isLoading: false,
            }));
            throw error;
        }
    }, []);

    /**
     * Submit grant application
     */
    const submitApplication = useCallback(
        async (
            payload: GrantSubmissionPayload,
            supportingDocs?: MicrograntPickedFile[]
        ): Promise<GrantSubmissionResponse> => {
            setState((prev) => ({ ...prev, isSubmitting: true, error: null }));
            try {
                const response = await grantService.submitGrant(payload, supportingDocs);
                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    success: true,
                }));
                return response;
            } catch (error: any) {
                const errorMessage =
                    error?.response?.data?.message ||
                    'Failed to submit grant application';
                setState((prev) => ({
                    ...prev,
                    error: errorMessage,
                    isSubmitting: false,
                }));
                throw error;
            }
        },
        []
    );

    const fetchApplicationByUserId = useCallback(async (userId: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const detail = await grantService.getApplicationByUserId(userId);
            setState((prev) => ({ ...prev, isLoading: false }));
            return detail;
        } catch (error: any) {
            const status = error?.statusCode ?? error?.response?.status;
            if (status === 404) {
                setState((prev) => ({ ...prev, isLoading: false }));
                return null;
            }
            const errorMessage =
                error?.response?.data?.message ||
                'Failed to fetch application';
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                isLoading: false,
            }));
            throw error;
        }
    }, []);

    /**
     * Build and submit application in one call
     */
    const submitCompleteApplication = useCallback(
        async (
            userId: string,
            formId: string,
            formAnswers: Record<string, string>,
            supportingDocs?: MicrograntPickedFile[]
        ) => {
            const payload = grantService.buildSubmissionPayload(userId, formId, formAnswers);
            return submitApplication(payload, supportingDocs);
        },
        [submitApplication]
    );

    /**
     * Reset state
     */
    const resetState = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    return {
        
        form: state.form,
        isLoading: state.isLoading,
        isSubmitting: state.isSubmitting,
        error: state.error,
        success: state.success,

        
        fetchGrantForm,
        submitApplication,
        fetchApplicationByUserId,
        submitCompleteApplication,
        resetState,
    };
};
