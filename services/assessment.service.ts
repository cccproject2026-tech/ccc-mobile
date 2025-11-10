import { ApiAssessment, CreateAssessmentRequest } from '@/types/assessment.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const assessmentService = {
    // Get all assessments - FIXED: Returns ApiAssessment[], not Assessment[]
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

    // Submit assessment answers
    submitAssessment: async (
        assessmentId: string,
        data: any
    ): Promise<any> => {
        console.log('📤 Submitting assessment:', assessmentId);

        const response = await apiClient.post(
            ENDPOINTS.ASSESSMENTS.SUBMIT_ASSESSMENT(assessmentId),
            data
        );

        console.log('📥 Assessment submitted:', response.data);
        return response.data;
    },

    // Fetch assessment answers
    fetchAnswers: async (
        assessmentId: string,
        userId: string
    ): Promise<any> => {
        console.log('📤 Fetching answers for assessment:', assessmentId, 'user:', userId);

        const response = await apiClient.get(
            ENDPOINTS.ASSESSMENTS.FETCH_ANSWERS(assessmentId, userId)
        );

        console.log('📥 Answers fetched:', response.data);
        return response.data;
    },
};
