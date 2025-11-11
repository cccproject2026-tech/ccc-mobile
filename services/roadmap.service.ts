// services/roadmap.service.ts
import {
    CreateExtrasDto,
    ExtrasApiResponse,
    GetExtrasResponse,
    Roadmap,
    RoadmapResponse,
    UpdateExtrasDto
} from '@/lib/roadmap/types';
import { apiClient } from './api/client';

export const roadmapService = {
    async getRoadmaps() {
        const response = await apiClient.get<RoadmapResponse>('/roadmaps');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmaps');
        }
        return response.data.data;
    },

    async getRoadmapById(roadmapId: string) {
        const response = await apiClient.get<{
            success: boolean;
            message: string;
            data: Roadmap;
        }>(`/roadmaps/${roadmapId}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmap');
        }
        return response.data.data;
    },

    /**
     * GET - Fetches saved extras for a roadmap
     * Fixed: Properly send query params
     */
    async getRoadmapExtras(roadMapId: string, nestedRoadMapItemId?: string, userId?: string) {
        const params: any = {};

        // Only add params if they exist and are valid
        if (userId) params.userId = userId;
        if (nestedRoadMapItemId) params.nestedRoadMapItemId = nestedRoadMapItemId;

        const response = await apiClient.get<GetExtrasResponse>(
            `/roadmaps/${roadMapId}/extras`,
            { params }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmap extras');
        }

        return response.data.data;
    },

    async createRoadmapExtras(payload: CreateExtrasDto) {
        console.log('Creating roadmap extras with payload:', payload);
        const response = await apiClient.post<ExtrasApiResponse>(
            `/roadmaps/${payload.roadMapId}/extras`,
            payload
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create roadmap extras');
        }
        return response.data;
    },

    async updateRoadmapExtras(roadMapId: string, payload: UpdateExtrasDto, userId: string | undefined, nestedRoadMapItemId?: string) {
        const response = await apiClient.patch<ExtrasApiResponse>(
            `/roadmaps/${roadMapId}/extras?userId=${userId || ''}&nestedRoadMapItemId=${nestedRoadMapItemId || ''}`,
            payload
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update roadmap extras');
        }
        return response.data;
    },

    async deleteRoadmapExtras(roadMapId: string) {
        const response = await apiClient.delete<{
            success: boolean;
            message: string;
        }>(`/roadmaps/${roadMapId}/extras`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete roadmap extras');
        }
        return response.data;
    },
};
