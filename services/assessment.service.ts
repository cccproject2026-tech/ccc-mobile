import { ApiAssessment, CreateAssessmentRequest } from '@/lib/assessments/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const assessmentService = {
    // Get all assessments
    getAssessments: async (): Promise<ApiAssessment[]> => {
        console.log('📤 Fetching assessments');

        const response = await apiClient.get<ApiAssessment[]>(
            ENDPOINTS.ASSESSMENTS.GET_ASSESSMENTS
        );

        console.log('📥 Assessments fetched:', response.data);
        return response.data;
    },

    // Get assessment by ID
    getAssessmentById: async (assessmentId: string): Promise<ApiAssessment> => {
        console.log('📤 Fetching assessment:', assessmentId);

        const response = await apiClient.get<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.GET_ASSESSMENT_BY_ID(assessmentId)
        );

        console.log('📥 Assessment fetched:', response.data);
        return response.data;
    },

    // Assign assessment to users
    assignAssessment: async (
        assessmentId: string,
        userIds: string[]
    ): Promise<ApiAssessment> => {
        console.log('📤 Assigning assessment:', assessmentId, 'to users:', userIds);

        const response = await apiClient.post<{
            success: boolean;
            message: string;
            data: ApiAssessment;
        }>(
            ENDPOINTS.ASSESSMENTS.ASSIGN_ASSESSMENT(assessmentId),
            { userIds }
        );

        console.log('📥 Assessment assigned:', response.data);
        return response.data.data;
    },

    // Create new assessment
    createAssessment: async (
        data: CreateAssessmentRequest
    ): Promise<ApiAssessment> => {
        console.log('📤 Creating assessment:', data.name);

        const response = await apiClient.post<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.CREATE_ASSESSMENT,
            data
        );

        console.log('📥 Assessment created:', response.data);
        return response.data;
    },

    // Delete assessment
    deleteAssessment: async (assessmentId: string): Promise<{ message: string }> => {
        console.log('📤 Deleting assessment:', assessmentId);

        const response = await apiClient.delete<{ message: string }>(
            ENDPOINTS.ASSESSMENTS.DELETE_ASSESSMENT(assessmentId)
        );

        console.log('📥 Assessment deleted:', response.data);
        return response.data;
    },

    // Update assessment instructions
    updateInstructions: async (
        assessmentId: string,
        instructions: string[]
    ): Promise<ApiAssessment> => {
        console.log('📤 Updating assessment instructions:', assessmentId);

        const response = await apiClient.patch<ApiAssessment>(
            ENDPOINTS.ASSESSMENTS.UPDATE_INSTRUCTIONS(assessmentId),
            { instructions }
        );

        console.log('📥 Assessment instructions updated:', response.data);
        return response.data;
    },
};

