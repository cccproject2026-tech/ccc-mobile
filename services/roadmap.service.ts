// services/roadmap.service.ts
import {
    AddCommentRequest,
    AddCommentResponse,
    CreateExtrasDto,
    ExtrasApiResponse,
    GetExtrasResponse,
    GetQueriesResponse,
    ReplyQueryRequest,
    ReplyQueryResponse,
    Roadmap,
    RoadmapComment,
    RoadmapCommentsThread,
    RoadmapResponse,
    SubmitQueryRequest,
    SubmitQueryResponse,
    UpdateExtrasDto
} from '@/lib/roadmap/types';
import { CreateNestedRoadmapRequest, CreateNestedRoadmapResponse, CreateRoadmapRequest, CreateRoadmapResponse, UpdateRoadmapRequest, UpdateRoadmapResponse } from '@/lib/roadmaps/types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

/** Axios uses `response.status`; apiClient response interceptor rejects with `{ statusCode }`. */
const getHttpErrorStatus = (error: unknown): number | undefined => {
    const e = error as { response?: { status?: number }; statusCode?: number };
    return e?.response?.status ?? e?.statusCode;
};

// Helper to append data to FormData with support for nested objects/arrays
const buildFormData = (formData: FormData, data: any, parentKey?: string) => {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File) && !(data instanceof Blob)) {
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value === undefined || value === null) return; // Skip undefined/null

            const formKey = parentKey ? `${parentKey}[${key}]` : key;

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const arrayKey = `${formKey}[${index}]`;
                    if (typeof item === 'object') {
                        buildFormData(formData, item, arrayKey);
                    } else {
                        formData.append(arrayKey, String(item));
                    }
                });
            } else if (typeof value === 'object') {
                buildFormData(formData, value, formKey);
            } else {
                formData.append(formKey, String(value));
            }
        });
    } else if (data !== undefined && data !== null) {
        formData.append(parentKey || '', String(data));
    }
};

export const roadmapService = {
    async getRoadmaps() {
        const response = await apiClient.get<RoadmapResponse>('/roadmaps');
        if (!response.data.success) {
            // console.log('Failed to fetch roadmaps:', response.data);
            throw new Error(response.data.message || 'Failed to fetch roadmaps');
        }
        console.log('Fetched roadmaps:----->>>>>>>>>>>>>>', response.data.data);
        return response.data.data;
    },

    async createRoadmap(payload: CreateRoadmapRequest) {
        const formData = new FormData();

        // Handle Banner Image
        if (payload.imageUrl && !payload.imageUrl.startsWith('http')) {
            const uri = payload.imageUrl;
            const filename = uri.split('/').pop() || 'banner.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);
        }

        // Clone payload and remove imageUrl to avoid duplication or sending it as text if it was a local URI
        // If it was a http URL, we might want to keep it? The requirement says "field named image will be included for the banner image".
        // Usually, if we upload a file, we don't send the URL field. 
        // We'll append the rest of the payload.
        const { imageUrl, ...restPayload } = payload;

        // Append all other fields
        buildFormData(formData, restPayload);

        // If there was an existing http imageUrl (not a file upload), we might want to include it?
        // But the requirement implies this is for creating, so usually it's an upload or nothing.
        // If imageUrl is remote, we should probably send it as 'imageUrl' field if the backend supports reusing an image.
        if (payload.imageUrl && payload.imageUrl.startsWith('http')) {
            formData.append('imageUrl', payload.imageUrl);
        }

        const response = await apiClient.post<CreateRoadmapResponse>('/roadmaps', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create roadmap');
        }
        return response.data;
    },


    async updateRoadmap(roadmapId: string, payload: UpdateRoadmapRequest) {
        console.log('-----------------------------------------------------------');
        console.log('-----------------------------------------------------------');
        console.log('payload', payload);
        console.log('-----------------------------------------------------------');
        console.log('-----------------------------------------------------------');
        console.log('📤 Updating roadmap:', { roadmapId, payload });
        const response = await apiClient.patch<UpdateRoadmapResponse>(
            ENDPOINTS.ROADMAPS.UPDATE(roadmapId),
            payload
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to update roadmap');
        }
        console.log('📥 Roadmap updated successfully:', response.data);
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
        console.log('Fetched roadmap by id:----->>>>>>>>>>>>>>', response.data.data);
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

    async uploadDocument(
        roadMapId: string,
        userId: string,
        nestedRoadMapItemId: string,
        extraName: string, // this becomes ?name=<fieldName>
        file: any
    ) {
        const formData = new FormData();

        // Field name must be "files" because of FilesInterceptor('files')
        formData.append("files", {
            uri: file.uri,
            name: file.name,
            type: file.type,
        } as any);

        const url =
            `/roadmaps/${roadMapId}/extras/documents` +
            `?userId=${userId}` +
            `&nestedRoadMapItemId=${nestedRoadMapItemId}` +
            `&name=${encodeURIComponent(extraName)}`;

        const response = await apiClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        if (!response.data.success) {
            throw new Error(response.data.message || "File upload failed");
        }

        return response.data;
    },


    async getRoadmapDocuments(roadMapId: string, userId: string, nestedId: string) {
        const url =
            `/roadmaps/${roadMapId}/extras/documents?userId=${userId}&nestedRoadMapItemId=${nestedId}`;


        const response = await apiClient.get(url);
        console.log("Fetched roadmap documents:----->>>>>>>>>>>>>>", response.data);
        return response.data; // { success: true, documents: [...] }
    },

    async deleteRoadmapDocument(
        roadMapId: string,
        userId: string,
        nestedId: string,
        fileUrl: string,
        uploadBatchId: string
    ) {
        const url =
            `/roadmaps/${roadMapId}/extras/documents/file` +
            `?userId=${userId}` +
            `&fileUrl=${encodeURIComponent(fileUrl)}` +
            `&nestedRoadMapItemId=${nestedId}` +
            `&uploadBatchId=${uploadBatchId}`;

        console.log("🗑️ Deleting roadmap document:", url);

        const response = await apiClient.delete(url);
        return response.data;
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

    async getRoadmapQueries(roadmapId: string, userId: string) {
        try {
            const response = await apiClient.get<GetQueriesResponse>(
                ENDPOINTS.ROADMAPS.GET_QUERIES(roadmapId, userId)
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to fetch queries");
            }

            return response.data.data;
        } catch (error: unknown) {
            if (getHttpErrorStatus(error) === 404) {
                return [];
            }
            throw error;
        }
    },

    async replyRoadmapQuery(roadmapId: string, queryId: string, payload: ReplyQueryRequest) {
        console.log('📤 Replying to roadmap query:', { roadmapId, queryId, payload });
        const response = await apiClient.patch<ReplyQueryResponse>(
            ENDPOINTS.ROADMAPS.REPLY_QUERY(roadmapId, queryId),
            payload
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to reply to query');
        }
        console.log('📥 Query reply submitted successfully:', response.data);
        return response.data;
    },

    async createNestedRoadmap(roadmapId: string, payload: CreateNestedRoadmapRequest) {
        console.log('📤 Creating nested roadmap:', { roadmapId, payload });
        const response = await apiClient.post<CreateNestedRoadmapResponse>(
            ENDPOINTS.ROADMAPS.CREATE_NESTED(roadmapId),
            payload
        );
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create nested roadmap');
        }
        console.log('📥 Nested roadmap created successfully:', response.data);
        return response.data;
    },

    async getRoadmapComments(roadMapId: string, userId: string) {
        try {
            const response = await apiClient.get<{
                success: boolean;
                message: string;
                data: RoadmapCommentsThread;
            }>(ENDPOINTS.ROADMAPS.GET_COMMENTS(roadMapId, userId));

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch roadmap comments');
            }

            const raw = response.data.data as RoadmapCommentsThread & {
                Comments?: RoadmapComment[];
            };
            if (!raw || typeof raw !== "object") {
                return {
                    _id: "",
                    userId,
                    roadMapId,
                    comments: [],
                };
            }
            const list =
                Array.isArray(raw.comments)
                    ? raw.comments
                    : Array.isArray(raw.Comments)
                      ? raw.Comments
                      : [];
            return { ...raw, comments: list };
        } catch (error: unknown) {
            if (getHttpErrorStatus(error) === 404) {
                return {
                    _id: '',
                    userId,
                    roadMapId,
                    comments: []
                };
            }
            throw error;
        }
    }

};
