import { CheckApplicationResponse, GrantFormResponse, GrantSubmissionPayload, GrantSubmissionResponse, MicrograntApplication, MicrograntApplicationDetail, MicrograntApplicationDetailApiResponse, MicrograntPickedFile } from '@/types/grant.type';
import { unwrapMicrograntApplicationsList, unwrapMicrograntWithUser } from '@/utils/microgrant';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';


export const grantService = {
    /**
     * Fetch the grant application form structure
     */
    getGrantForm: async (): Promise<GrantFormResponse> => {
        try {
            const response = await apiClient.get<GrantFormResponse>(
                ENDPOINTS.GRANT.GET_FORM
            );
            return response.data
        } catch (error) {
            console.error('Error fetching grant form:', error);
            throw error;
        }
    },

    /**
     * Submit grant application with form data
     */
    submitGrant: async (
        payload: GrantSubmissionPayload,
        supportingDocs?: MicrograntPickedFile[]
    ): Promise<GrantSubmissionResponse> => {
        try {
            if (supportingDocs && supportingDocs.length > 0) {
                const formData = new FormData();
                formData.append('userId', payload.userId);
                formData.append('formId', payload.formId);
                formData.append('answers', JSON.stringify(payload.answers));
                supportingDocs.forEach((file) => {
                    formData.append('files', {
                        uri: file.uri,
                        type: file.mimeType || 'application/octet-stream',
                        name: file.name,
                    } as any);
                });
                const response = await apiClient.post<GrantSubmissionResponse>(
                    ENDPOINTS.GRANT.APPLY_GRANT,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }
                );
                return response.data;
            }

            const response = await apiClient.post<GrantSubmissionResponse>(
                ENDPOINTS.GRANT.APPLY_GRANT,
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error submitting grant application:', error);
            throw error;
        }
    },

    getApplicationByUserId: async (userId: string): Promise<MicrograntApplicationDetail | null> => {
        try {
            const response = await apiClient.get<MicrograntApplicationDetailApiResponse>(
                ENDPOINTS.GRANT.GET_APPLICATION(userId)
            );
            return unwrapMicrograntWithUser(response);
        } catch (error: any) {
            const status = error?.statusCode ?? error?.response?.status;
            if (status === 404) {
                return null;
            }
            console.error('Error fetching microgrant application by user:', error);
            throw error;
        }
    },

    /**
     * Get grant application status
     */
    getGrantStatus: async (userId: string): Promise<any> => {
        try {
            const response = await apiClient.get(
                `${ENDPOINTS.GRANT.APPLY_GRANT}/${userId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching grant status:', error);
            throw error;
        }
    },

    /**
     * Check if user has already applied for microgrant
     */
    checkApplication: async (userId: string): Promise<CheckApplicationResponse> => {
        try {
            const response = await apiClient.get<CheckApplicationResponse>(
                ENDPOINTS.GRANT.CHECK_APPLICATION(userId)
            );
            return response.data;
        } catch (error) {
            console.error('Error checking application:', error);
            throw error;
        }
    },

    /**
     * Fetch all microgrant applications with optional status filter
     */
    getApplications: async (status?: string): Promise<MicrograntApplication[]> => {
        try {
            const response = await apiClient.get(ENDPOINTS.GRANT.GET_APPLICATIONS(status));
            return unwrapMicrograntApplicationsList(response);
        } catch (error) {
            console.error('Error fetching microgrant applications:', error);
            throw error;
        }
    },

    /**
     * Fetch a single microgrant application by ID
     */
    getApplication: async (applicationId: string): Promise<MicrograntApplicationDetail> => {
        try {
            const response = await apiClient.get<MicrograntApplicationDetailApiResponse>(
                ENDPOINTS.GRANT.GET_APPLICATION(applicationId)
            );
            const detail = unwrapMicrograntWithUser(response);
            if (!detail) {
                throw new Error('Could not read application data from the server.');
            }
            return detail;
        } catch (error) {
            console.error('Error fetching microgrant application:', error);
            throw error;
        }
    },

    buildSubmissionPayload: (
        userId: string,
        formId: string,
        formAnswers: Record<string, string>
    ): GrantSubmissionPayload => ({
        userId,
        formId,
        answers: formAnswers,
    }),
};
