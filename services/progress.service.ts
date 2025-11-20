// services/progress.service.ts
import {
    AssignAssessmentApiResponse,
    AssignAssessmentRequest,
    AssignRoadmapApiResponse,
    AssignRoadmapRequest,
} from '@/types/progress.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const progressService = {
    /**
     * Assign roadmaps to users
     */
    async assignRoadmap(payload: AssignRoadmapRequest): Promise<AssignRoadmapApiResponse> {
        try {
            const response = await apiClient.post<AssignRoadmapApiResponse>(
                ENDPOINTS.PROGRESS.ASSIGN_ROADMAP,
                payload
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to assign roadmap');
            }
            return response.data;
        } catch (error) {
            console.error('Error assigning roadmap:', error);
            throw error;
        }
    },

    /**
     * Assign assessment to a user
     */
    async assignAssessment(payload: AssignAssessmentRequest): Promise<AssignAssessmentApiResponse> {
        try {
            const response = await apiClient.post<AssignAssessmentApiResponse>(
                ENDPOINTS.PROGRESS.ASSIGN_ASSESSMENT,
                payload
            );
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to assign assessment');
            }
            return response.data;
        } catch (error) {
            console.error('Error assigning assessment:', error);
            throw error;
        }
    },
};

