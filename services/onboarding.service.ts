// services/onboarding.service.ts
import {
    ApprovalStatusResponse,
    InterestFormData,
    SubmitInterestResponse,
} from '@/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const onboardingService = {
    // Submit interest form
    submitInterest: async (
        data: InterestFormData
    ): Promise<SubmitInterestResponse> => {
        console.log('📤 Submitting interest form');
        const response = await apiClient.post<SubmitInterestResponse>(
            ENDPOINTS.ONBOARDING.SUBMIT_INTEREST,
            data
        );
        console.log('✅ Interest submitted:', response.data);
        return response.data;
    },

    // Check approval status
    checkApprovalStatus: async (
        applicationId: string
    ): Promise<ApprovalStatusResponse> => {
        console.log('📤 Checking approval status for:', applicationId);
        const response = await apiClient.get<ApprovalStatusResponse>(
            ENDPOINTS.USERS.CHECK_STATUS(applicationId), {
            params: { t: Date.now() } // Prevent caching
        }
        );
        return response.data;
    },
};
