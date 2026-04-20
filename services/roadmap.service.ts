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
import { menteesService } from './mentees.service';
import { MentorshipSession, MentorshipSessionsApiResponse } from "@/types/session.types";
import {
    parseAiSummaryFromApi,
    parseMentorshipInsightsFromApi,
    parseTranscriptFromApi,
} from "@/utils/mentorshipSessionExtras";

/** Backend may return a raw array or { success, data } from GET /roadmaps/sessions/:userId */
function normalizeRoadmapSessionsPayload(responseData: unknown): any[] {
    if (Array.isArray(responseData)) return responseData;
    if (responseData && typeof responseData === 'object') {
        const wrap = responseData as { success?: boolean; data?: unknown; message?: string };
        if (wrap.success === false && wrap.message) {
            throw new Error(wrap.message);
        }
        if (Array.isArray(wrap.data)) return wrap.data;
    }
    return [];
}

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
    async triggerJumpstartComplete(
        roadmapId: string,
        userId: string,
        nestedRoadMapItemId?: string,
    ): Promise<{ success: boolean; message: string; alreadyExists?: boolean }> {
        if (!roadmapId) {
            throw new Error("roadmapId is required to trigger jumpstart completion");
        }
        if (!userId) {
            throw new Error("userId is required to trigger jumpstart completion");
        }

        // Same ObjectId rules as updateRoadmapExtras / getRoadmapExtras so POST targets the same extras row as PATCH/GET.
        const validNestedId =
            nestedRoadMapItemId &&
            typeof nestedRoadMapItemId === "string" &&
            nestedRoadMapItemId.trim() !== "" &&
            nestedRoadMapItemId.length === 24 &&
            /^[0-9a-fA-F]{24}$/.test(nestedRoadMapItemId)
                ? nestedRoadMapItemId
                : undefined;

        const body: {
            userId: string;
            extras: { type: string }[];
            nestedRoadMapItemId?: string;
        } = {
            userId,
            extras: [{ type: "JUMPSTART_COMPLETE" }],
        };
        if (validNestedId) {
            body.nestedRoadMapItemId = validNestedId;
        }

        try {
            const response = await apiClient.post<{ success: boolean; message: string }>(
                `/roadmaps/${roadmapId}/extras`,
                body,
            );

            if (!response.data?.success) {
                throw new Error(response.data?.message || "Failed to trigger jumpstart completion");
            }

            return { success: true, message: response.data.message || "Jumpstart completion triggered." };
        } catch (error: unknown) {
            const err = error as {
                response?: { status?: number; data?: { message?: string } };
                message?: string;
            };
            const status = err?.response?.status;
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to trigger jumpstart completion";

            // Backend may return conflict/bad request if the extra already exists.
            if (
                status === 409 ||
                (status === 400 && /already exists|duplicate|already/i.test(message))
            ) {
                return {
                    success: true,
                    message: "Jumpstart completion already recorded.",
                    alreadyExists: true,
                };
            }

            throw error;
        }
    },

    async completeSession(appointmentId: string): Promise<{ success: boolean; message: string }> {
        if (!appointmentId) {
            throw new Error("appointmentId is required to complete a session");
        }

        const response = await apiClient.post<{ success?: boolean; message?: string }>(
            ENDPOINTS.ROADMAPS.COMPLETE_SESSION,
            { appointmentId },
        );

        const status = response.status;
        const data = response.data;

        // Backend may return 201 with no `success` flag or minimal body — still a successful completion.
        if (status >= 200 && status < 300) {
            if (data && typeof data === "object" && data.success === false) {
                throw new Error(data.message || "Failed to complete session");
            }
            return {
                success: true,
                message:
                    (typeof data?.message === "string" && data.message.trim().length > 0
                        ? data.message
                        : undefined) ?? "Session completed successfully.",
            };
        }

        throw new Error(
            (data && typeof data.message === "string" && data.message) ||
                "Failed to complete session",
        );
    },

    async redoSession(appointmentId: string): Promise<{ success: boolean; message: string }> {
        if (!appointmentId) {
            throw new Error("appointmentId is required to redo a session");
        }

        const response = await apiClient.post<{ success?: boolean; message?: string }>(
            ENDPOINTS.ROADMAPS.REDO_SESSION,
            { appointmentId },
        );

        const status = response.status;
        const data = response.data;

        if (status >= 200 && status < 300) {
            if (data && typeof data === "object" && data.success === false) {
                throw new Error(data.message || "Failed to redo session");
            }
            return {
                success: true,
                message:
                    (typeof data?.message === "string" && data.message.trim().length > 0
                        ? data.message
                        : undefined) ?? "Session marked for redo.",
            };
        }

        throw new Error(
            (data && typeof data.message === "string" && data.message) ||
                "Failed to redo session",
        );
    },

    async getMentorshipSessions(userId: string): Promise<MentorshipSession[]> {
        if (!userId) {
            throw new Error("userId is required to fetch mentorship sessions");
        }

        const response = await apiClient.get<
            MentorshipSessionsApiResponse | MentorshipSession[] | unknown
        >(ENDPOINTS.ROADMAPS.GET_SESSIONS(userId));

        const raw = normalizeRoadmapSessionsPayload(response.data);

        return raw.map((item: any, index: number) => {
            const id = String(item?._id ?? item?.id ?? `session-${index + 1}`);
            const numberValue = Number(
                item?.sessionNumber ??
                item?.sessionNo ??
                item?.session ??
                item?.sequence ??
                index + 1,
            );
            const sessionNumber = Number.isFinite(numberValue) && numberValue > 0 ? numberValue : index + 1;

            const scheduledDate = String(
                item?.scheduledDate ??
                item?.meetingDate ??
                item?.date ??
                item?.createdAt ??
                "",
            );

            const statusRaw = String(item?.status ?? "SCHEDULED").toUpperCase();
            const status = statusRaw === "COMPLETED" ? "COMPLETED" : "SCHEDULED";
            const mentorNote = item?.mentorNote ? String(item.mentorNote) : undefined;
            const pastorNote = item?.pastorNote ? String(item.pastorNote) : undefined;
            const appointmentId = item?.appointmentId
                ? String(item.appointmentId)
                : item?.appointment?._id
                  ? String(item.appointment._id)
                  : undefined;

            const transcript = parseTranscriptFromApi(item?.transcript);
            const aiSummary = parseAiSummaryFromApi(item?.aiSummary);
            const mentorshipInsights = parseMentorshipInsightsFromApi(
                item?.mentorshipInsights,
            );

            return {
                id,
                sessionNumber,
                scheduledDate,
                status,
                mentorNote,
                pastorNote,
                appointmentId,
                ...(transcript ? { transcript } : {}),
                ...(aiSummary ? { aiSummary } : {}),
                ...(mentorshipInsights ? { mentorshipInsights } : {}),
            } as MentorshipSession;
        });
    },

    /**
     * Fetches mentorship sessions for all pastors assigned to this mentor.
     * Uses GET /users/:mentorId/assigned then GET /roadmaps/sessions/:pastorId per pastor.
     */
    async getMentorshipSessionsForMentor(mentorId: string): Promise<MentorshipSession[]> {
        if (!mentorId) {
            throw new Error("mentorId is required to fetch mentorship sessions");
        }

        const menteesData = await menteesService.getAssignedMentees(mentorId);
        const users = menteesData.users ?? [];
        const pastorIds = users.map((u: any) => String(u._id ?? u.id)).filter(Boolean);

        if (__DEV__) {
            console.log("Pastor IDs:", pastorIds);
        }

        if (pastorIds.length === 0) {
            if (__DEV__) {
                console.log("Fetched sessions:", []);
            }
            return [];
        }

        // Fetch sequentially to avoid backend throttling (429) when mentors have many pastors.
        // Also retry per pastor on transient 429/503 so one failure doesn't blank all pastors.
        const all: MentorshipSession[] = [];

        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

        for (const pastorId of pastorIds) {
            const pastor = users.find((u: any) => String(u._id ?? u.id) === pastorId);
            const pastorName =
                pastor
                    ? `${pastor.firstName ?? ""} ${pastor.lastName ?? ""}`.trim() || "Pastor"
                    : "Pastor";
            const rawPic = pastor?.profilePicture;
            const pastorProfilePicture =
                typeof rawPic === "string" && rawPic.trim().length > 0
                    ? rawPic.trim()
                    : undefined;

            let sessions: MentorshipSession[] = [];
            let success = false;

            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    sessions = await this.getMentorshipSessions(pastorId);
                    success = true;
                    break;
                } catch (e) {
                    const st = getHttpErrorStatus(e);
                    const shouldRetry = st === 429 || st === 503;
                    if (!shouldRetry) {
                        if (__DEV__) {
                            console.warn(
                                `[getMentorshipSessionsForMentor] Failed for pastor ${pastorId}`,
                                e,
                            );
                        }
                        break;
                    }
                    // Backoff before retrying to reduce pressure on the backend.
                    await sleep(500 * (attempt + 1));
                }
            }

            if (success) {
                all.push(
                    ...sessions.map((s, idx) => ({
                        ...s,
                        pastorId,
                        pastorName,
                        pastorProfilePicture,
                        id: `${pastorId}-${s.sessionNumber}-${s.appointmentId ?? idx}`,
                    })),
                );
            }

            // Small spacing between pastors to avoid bursts.
            await sleep(150);
        }

        if (__DEV__) {
            console.log("Fetched sessions:", all);
        }

        return all.sort((a, b) => {
            const ta = new Date(a.scheduledDate).getTime();
            const tb = new Date(b.scheduledDate).getTime();
            if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) {
                return ta - tb;
            }
            return a.sessionNumber - b.sessionNumber;
        });
    },

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
