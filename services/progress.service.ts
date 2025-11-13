// services/progress.service.ts
import {
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
};

