import { GrantFormResponse, GrantSubmissionPayload, GrantSubmissionResponse, MicrograntApplication, MicrograntApplicationDetail, MicrograntApplicationDetailApiResponse, MicrograntApplicationsApiResponse } from '@/types/grant.type';
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
        payload: GrantSubmissionPayload
    ): Promise<GrantSubmissionResponse> => {
        try {
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

    /**
     * Get grant application status
     */
    getGrantStatus: async (applicationId: string): Promise<any> => {
        try {
            const response = await apiClient.get(
                `${ENDPOINTS.GRANT.APPLY_GRANT}/${applicationId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching grant status:', error);
            throw error;
        }
    },

    /**
     * Fetch all microgrant applications with optional status filter
     */
    getApplications: async (status?: string): Promise<MicrograntApplication[]> => {
        try {
            const response = await apiClient.get<MicrograntApplicationsApiResponse>(
                ENDPOINTS.GRANT.GET_APPLICATIONS(status)
            );
            return response.data.data;
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
            return response.data.data;
        } catch (error) {
            console.error('Error fetching microgrant application:', error);
            throw error;
        }
    },

    /**
     * Helper method to build submission payload
     */
    buildSubmissionPayload: (
        userId: string,
        formAnswers: Record<string, string>,
        supportingDocUrl: string = 'https://example.com/uploads/proof.pdf'
    ): GrantSubmissionPayload => {
        return {
            userId,
            answers: formAnswers,
            supportingDoc: supportingDocUrl,
        };
    },
};
