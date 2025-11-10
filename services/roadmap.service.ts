// services/roadmap.service.ts
import {
    CreateExtrasDto,
    ExtrasApiResponse,
    GetExtrasResponse,
    Roadmap,
    RoadmapResponse,
    UpdateExtrasDto
} from '@/lib/roadmap/types';
import { CreateRoadmapRequest, CreateRoadmapResponse } from '@/lib/roadmaps/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const roadmapService = {
    /**
     * Fetches all roadmaps
     */
    async getRoadmaps() {
        const response = await apiClient.get<RoadmapResponse>('/roadmaps');

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmaps');
        }

        return response.data.data;
    },

    /**
     * Fetches a single roadmap by ID
     */
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
     * Note: Backend uses roadMapId in URL, but might filter by nestedRoadMapItemId on backend
     */
    async getRoadmapExtras(roadMapId: string, nestedRoadMapItemId?: string) {
        const url = `/roadmaps/${roadMapId}/extras`;
        const params = nestedRoadMapItemId ? { nestedRoadMapItemId } : undefined;

        const response = await apiClient.get<GetExtrasResponse>(url, { params });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmap extras');
        }

        return response.data.data;
    },

    /**
     * POST - Creates new extras/form data
     */
    async createRoadmapExtras(payload: CreateExtrasDto) {
        const response = await apiClient.post<ExtrasApiResponse>(
            `/roadmaps/${payload.roadMapId}/extras`,
            payload
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create roadmap extras');
        }

        return response.data;
    },

    /**
     * PATCH - Updates existing extras/form data
     */
    async updateRoadmapExtras(roadMapId: string, payload: UpdateExtrasDto) {
        const response = await apiClient.patch<ExtrasApiResponse>(
            `/roadmaps/${roadMapId}/extras`,
            payload
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update roadmap extras');
        }

        return response.data;
    },

    /**
     * DELETE - Deletes extras/form data
     */
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

    /**
     * POST - Creates a new roadmap (phase or single)
     */
    async createRoadmap(data: CreateRoadmapRequest): Promise<CreateRoadmapResponse> {
        console.log('📤 Creating roadmap:', data.name);
        
        const response = await apiClient.post<CreateRoadmapResponse>(
            ENDPOINTS.ROADMAPS.CREATE,
            data
        );

        console.log('📥 Roadmap created:', response.data);
        return response.data;
    },
};
