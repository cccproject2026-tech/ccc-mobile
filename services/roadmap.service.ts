// services/roadmap.service.ts
import {
    AddCommentRequest,
    AddCommentResponse,
    CreateExtrasDto,
    ExtrasApiResponse,
    GetExtrasResponse,
    Roadmap,
    RoadmapResponse,
    SubmitQueryRequest,
    SubmitQueryResponse,
    UpdateExtrasDto
} from '@/lib/roadmap/types';
import { CreateRoadmapRequest, CreateRoadmapResponse } from '@/lib/roadmaps/types';
import { ENDPOINTS } from './api/endpoints';
import { apiClient } from './api/client';

export const roadmapService = {
    async getRoadmaps() {
        const response = await apiClient.get<RoadmapResponse>('/roadmaps');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch roadmaps');
        }
        return response.data.data;
    },

    async createRoadmap(payload: CreateRoadmapRequest) {
        const response = await apiClient.post<CreateRoadmapResponse>('/roadmaps', payload);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create roadmap');
        }
        return response.data;
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
     * Fixed: Properly send query params and prevent undefined values
     */
    async getRoadmapExtras(roadMapId: string, nestedRoadMapItemId?: string, userId?: string) {
        // Validate inputs first - ensure we never pass undefined
        const validNestedId = nestedRoadMapItemId && 
            typeof nestedRoadMapItemId === 'string' && 
            nestedRoadMapItemId !== 'undefined' && 
            nestedRoadMapItemId.trim() !== '' && 
            nestedRoadMapItemId.length === 24 &&
            /^[0-9a-fA-F]{24}$/.test(nestedRoadMapItemId)
            ? nestedRoadMapItemId 
            : null;
        
        const validUserId = userId && 
            typeof userId === 'string' && 
            userId !== 'undefined' && 
            userId.trim() !== '' && 
            userId.length === 24 &&
            /^[0-9a-fA-F]{24}$/.test(userId)
            ? userId 
            : null;

        // Build params object - only add if we have valid values (not null, not undefined)
        const params: Record<string, string> = {};
        
        if (validUserId) {
            params.userId = validUserId;
        }
        
        if (validNestedId) {
            params.nestedRoadMapItemId = validNestedId;
        }

        // Build URL with query string manually if we have params, otherwise use base URL
        let url = `/roadmaps/${roadMapId}/extras`;
        if (Object.keys(params).length > 0) {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            url = `${url}?${queryString}`;
            console.log('📤 getRoadmapExtras URL:', url);
        } else {
            console.log('📤 getRoadmapExtras: No params, using base URL');
        }

        // Call without params config to avoid axios serialization issues
        const response = await apiClient.get<GetExtrasResponse>(url);

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
        // Validate inputs first - ensure we never pass undefined
        const validNestedId = nestedRoadMapItemId && 
            typeof nestedRoadMapItemId === 'string' && 
            nestedRoadMapItemId !== 'undefined' && 
            nestedRoadMapItemId.trim() !== '' && 
            nestedRoadMapItemId.length === 24 &&
            /^[0-9a-fA-F]{24}$/.test(nestedRoadMapItemId)
            ? nestedRoadMapItemId 
            : null;
        
        const validUserId = userId && 
            typeof userId === 'string' && 
            userId !== 'undefined' && 
            userId.trim() !== '' && 
            userId.length === 24 &&
            /^[0-9a-fA-F]{24}$/.test(userId)
            ? userId 
            : null;

        // Build URL with query string manually if we have params
        let url = `/roadmaps/${roadMapId}/extras`;
        const queryParams: string[] = [];
        
        if (validUserId) {
            queryParams.push(`userId=${encodeURIComponent(validUserId)}`);
        }
        
        if (validNestedId) {
            queryParams.push(`nestedRoadMapItemId=${encodeURIComponent(validNestedId)}`);
        }
        
        if (queryParams.length > 0) {
            url = `${url}?${queryParams.join('&')}`;
            console.log('📤 updateRoadmapExtras URL:', url);
        } else {
            console.log('📤 updateRoadmapExtras: No params, using base URL');
        }

        // Call without params config to avoid axios serialization issues
        const response = await apiClient.patch<ExtrasApiResponse>(
            url,
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

    async addRoadmapComment(roadmapId: string, payload: AddCommentRequest) {
        const response = await apiClient.post<AddCommentResponse>(
            ENDPOINTS.ROADMAPS.ADD_COMMENT(roadmapId),
            payload
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to add comment');
        }
        return response.data;
    },

    async submitRoadmapQuery(roadmapId: string, payload: SubmitQueryRequest) {
        console.log('📤 Submitting roadmap query:', { roadmapId, payload });
        const response = await apiClient.post<SubmitQueryResponse>(
            ENDPOINTS.ROADMAPS.SUBMIT_QUERY(roadmapId),
            payload
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to submit query');
        }
        console.log('📥 Query submitted successfully:', response.data);
        return response.data;
    },
};
