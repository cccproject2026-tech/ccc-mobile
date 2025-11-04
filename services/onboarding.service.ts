import {
    ApprovalStatusResponse,
    InterestFormData,
    SubmitInterestResponse,
} from '@/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const onboardingService = {
    // Submit interest form (unauthenticated)
    submitInterest: async (
        data: InterestFormData
    ): Promise<SubmitInterestResponse> => {
        const response = await apiClient.post<SubmitInterestResponse>(
            ENDPOINTS.ONBOARDING.SUBMIT_INTEREST,
            data
        );
        return response.data;
    },

    // Check approval status (unauthenticated - uses applicationId)
    checkApprovalStatus: async (
        applicationId: string
    ): Promise<ApprovalStatusResponse> => {
        const response = await apiClient.get<ApprovalStatusResponse>(
            ENDPOINTS.ONBOARDING.CHECK_STATUS(applicationId)
        );
        return response.data;
    },
};
