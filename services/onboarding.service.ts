// src/services/onboarding.service.ts
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
        console.log('📤 Submitting interest form:', data.churchDetails);
        console.log('📤 Raw Submitting interest form:', data);

        const testData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
        }
        const response = await apiClient.post<SubmitInterestResponse>(
            ENDPOINTS.ONBOARDING.SUBMIT_INTEREST,
            data
        );

        console.log('✅ Interest submitted:', response.data);
        return response.data;
    },

    // ✅ UPDATED: Check user status using userId
    checkUserStatus: async (
        userId: string
    ): Promise<ApprovalStatusResponse> => {
        console.log('📤 Checking user status:', userId);

        const response = await apiClient.get<ApprovalStatusResponse>(
            ENDPOINTS.USERS.CHECK_STATUS(userId)
        );

        console.log('✅ User status:', response.data.data.status);
        return response.data;
    },
};
