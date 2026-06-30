

export interface NestedRoadmapProgress {
    nestedRoadmapId: string;
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
}

export interface RoadmapProgress {
    roadMapId: string;
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
    nestedRoadmaps?: NestedRoadmapProgress[];
}

export interface AssessmentProgress {
    assessmentId: string;
    completedSections: number;
    totalSections: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'submitted' | 'completed';
}

export interface ProgressData {
    overallProgress: number;
    roadmaps: {
        total: number;
        completed: number;
        percentage: number;
        items: RoadmapProgress[];
    };
    assessments: {
        total: number;
        completed: number;
        percentage: number;
        items: AssessmentProgress[];
    };
    finalComments?: FinalComment[];
}

export interface AssignRoadmapRequest {
    userIds: string[];
    roadMapIds: string[];
}

export interface AssignRoadmapResponse {
    _id: string;
    userId: string;
    roadmaps: RoadmapProgress[];
    totalRoadmaps: number;
    completedRoadmaps: number;
    overallRoadmapProgress: number;
    assessments: AssessmentProgress[];
    totalAssessments: number;
    completedAssessments: number;
    overallAssessmentProgress: number;
}

export interface AssignRoadmapApiResponse {
    success: boolean;
    message: string;
    data: AssignRoadmapResponse[];
}

export interface AssignAssessmentRequest {
    userId: string;
    assessmentId: string;
}

/** Bulk assign assessments to users (used by mentor/director; same as Director-Mobile progress API) */
export interface AssignAssessmentsBulkRequest {
    userIds: string[];
    assessmentIds: string[];
}

export interface AssignAssessmentResponse {
    _id: string;
    userId: string;
    roadmaps: RoadmapProgress[];
    totalRoadmaps: number;
    completedRoadmaps: number;
    overallRoadmapProgress: number;
    assessments: AssessmentProgress[];
    totalAssessments: number;
    completedAssessments: number;
    overallAssessmentProgress: number;
}

export interface AssignAssessmentApiResponse {
    success: boolean;
    message: string;
    data: AssignAssessmentResponse;
}

/** Response for bulk assign (progress/assign-assessment with userIds + assessmentIds) */
export interface AssignAssessmentsBulkApiResponse {
    success: boolean;
    message?: string;
    data?: unknown;
}

export interface FinalComment {
    _id: string;
    commentorId: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddFinalCommentRequest {
    userId: string;
    commentorId: string;
    comment: string;
}

export interface AddFinalCommentResponse {
    _id: string;
    userId: string;
    roadmaps: RoadmapProgress[];
    totalRoadmaps: number;
    completedRoadmaps: number;
    overallRoadmapProgress: number;
    assessments: AssessmentProgress[];
    totalAssessments: number;
    completedAssessments: number;
    overallAssessmentProgress: number;
    totalItems: number;
    completedItems: number;
    overallProgress: number;
    overallCompleted: boolean;
    finalComments: FinalComment[];
}

export interface AddFinalCommentApiResponse {
    success: boolean;
    message: string;
    data: AddFinalCommentResponse;
}

export interface GetFinalCommentsApiResponse {
    success: boolean;
    message: string;
    data: FinalComment[];
}

export interface UpdateFinalCommentRequest {
    userId: string;
    commentId: string;
    comment: string;
}

export interface UpdateFinalCommentApiResponse {
    success: boolean;
    message: string;
    data: AddFinalCommentResponse;
}

export interface DeleteFinalCommentRequest {
    userId: string;
    commentId: string;
}

export interface DeleteFinalCommentApiResponse {
    success: boolean;
    message: string;
    data: AddFinalCommentResponse;
}

export interface GetProgressResponse {
    _id: string;
    userId: string;
    overallProgress: number;
    roadmaps: RoadmapProgress[];
    totalRoadmaps: number;
    completedRoadmaps: number;
    overallRoadmapProgress: number;
    assessments: AssessmentProgress[];
    totalAssessments: number;
    completedAssessments: number;
    overallAssessmentProgress: number;
    totalItems?: number;
    completedItems?: number;
    finalComments?: FinalComment[];
}

export interface GetProgressApiResponse {
    success: boolean;
    message: string;
    data: GetProgressResponse;
}