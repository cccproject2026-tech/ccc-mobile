// import { ExternalPathString, RelativePathString, Route } from "expo-router";
// import { ImageSourcePropType } from "react-native";

import { ExternalPathString, RelativePathString, Route } from "expo-router";
import { ImageSourcePropType } from "react-native";

export type PhaseCode = 'JUMP_START' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3';
export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
// export type CommentStatus = 'UNREAD' | 'READ' | 'ARCHIVED';
export type QueryStatus = 'PENDING' | 'ANSWERED';




// export type RoadmapCardStatus = 'initial' | 'in-progress' | 'completed' | 'due';

// export interface RoadmapCardData {
//     image?: string | number;
//     title: string;
//     description?: string;
//     completionTime?: string;
//     status?: RoadmapCardStatus;
//     completedDate?: string;
//     taskProgress?: {
//         completed: number;
//         total: number;
//     };
//     showArrow?: boolean;
//     showCheckmark?: boolean;
// }
// export interface Division {
//     id: string;
//     phaseId: string;
//     name: string;
//     description?: string;
//     tasks: string[];
//     order?: number;
//     meta?: {
//         icon?: string;
//         color?: string;
//         [key: string]: any;
//     };
// }


export interface QueryAuthor {
    id: string;
    name: string;
    avatar?: ImageSourcePropType;
}

export interface QueryResponse {
    id: string;
    queryId: string;
    content: string;
    timestamp: string;
    author: {
        id: string;
        name: string;
        role?: string; // e.g., "Mentor", "Admin"
        avatar?: ImageSourcePropType;
    };
}

export interface Query {
    id: string;
    author: QueryAuthor;
    question: string;
    timestamp: string;
    status: QueryStatus;
    responses?: string[]; // Array of response IDs
    hasResponse: boolean;
}

// types/roadmap-comments.types.ts



export interface Phase {
    id: string;
    code: PhaseCode;
    title: string;
    subtitle?: string;
    estMonthsMin?: number;
    estMonthsMax?: number;
    coverImage?: string;
    tasks?: string[];
    divisions?: string[];
    isSingleRoadmap?: boolean;
}

export type DynamicFieldType =
    | 'TEXT_FIELD'
    | 'TEXT_AREA'
    | 'UPLOAD'
    | 'DATE_PICKER'
    | 'CHECKBOX'
    | 'CHECKLIST'
    | 'TEXT_DISPLAY'
    | 'SECTION_BOX'
    | 'ASSESSMENT'
    | 'SIGNATURE'
    | 'DROPDOWN'
    | 'MULTI_SELECT'
    | 'BUTTON'
    | 'SURVEY_BUTTON'
    | 'TEXT'

export interface ChecklistItem {
    id: string;
    label: string;
    checked?: boolean;
}

export interface DynamicField {
    id: string;
    type: DynamicFieldType;
    label?: string;
    placeholder?: string;
    required?: boolean;
    accept?: string[];
    maxSizeMB?: number;
    maxFiles?: number;
    options?: string[];
    items?: ChecklistItem[];
    assessmentId?: string;
    assessmentTitle?: string;
    agreementText?: string;
    documentUrl?: string;
    isHeader?: boolean;
    linkUrl?: string;
    checkedByDefault?: boolean;
    editable?: boolean;
    defaultValue?: any;
    fields?: DynamicField[];
    survey?: 'CMA' | 'PMP' | 'CUSTOM';
    onPress?: 'SUBMIT' | 'NAVIGATE' | 'CUSTOM'
    navigateTo?: RelativePathString | ExternalPathString | Route
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        minLength?: number;
        maxLength?: number;
    };
    showIf?: {
        fieldId: string;
        equals?: any;
    };
    dependsOn?: string[];
}

export interface DynamicFormSchema {
    fields: DynamicField[];
    submitLabel?: string;
}

export interface Task {
    id: string;
    phaseId: string;
    title: string;
    description?: string;
    status: Status;
    dueDate?: string;
    tags?: string[];
    schema: DynamicFormSchema;
    comments?: string[];
    divisionId?: string;
    queries?: string[];
    extras?: Extra[]; // ✅ Added for compatibility with new DynamicFormTask
    meta?: {
        coverImage?: string;
        completionTimeMonths?: string;
        roadmapText?: string;
        hasOverviewTab?: boolean;
        unreadCommentCount?: number;
        newQueryCount?: number;
        [key: string]: any;
    };
}

// export interface RevitalizationData {
//     program: Program;
//     phases: Record<string, Phase>;
//     tasks: Record<string, Task>;
//     divisions?: Record<string, Division>;
//     comments?: Record<string, Comment>;
//     queries?: Record<string, Query>;
//     queryResponses?: Record<string, QueryResponse>;
// }


// lib/roadmap/types.ts

// ============= BACKEND TYPES =============

export interface RoadmapResponse {
    success: boolean;
    message: string;
    data: Roadmap[];
}

export interface Roadmap {
    _id: string;
    type: string;
    name: string;
    roadMapDetails: string;
    description: string;
    status: 'not started' | 'in-progress' | 'completed' | 'blocked';
    duration: string;
    startDate: string;
    endDate: string;
    completedOn: string;
    imageUrl: string;
    meetings: any[];
    divisions: string[];
    haveNextedRoadMaps: boolean;
    phase: string;
    totalSteps: number;
    extras: Extra[];
    roadmaps: NestedRoadmap[];
    createdAt: string;
    updatedAt: string;
}

export interface NestedRoadmap {
    _id: string;
    name: string;
    roadMapDetails: string;
    description: string;
    status: 'not started' | 'in-progress' | 'completed' | 'blocked';
    duration: string;
    imageUrl: string;
    meetings: any[];
    startDate: string;
    endDate: string;
    completedOn: string;
    phase: string;
    totalSteps: number;
    extras: Extra[];
}

export interface Extra {
    type: 'TEXT_AREA' | 'TEXT_DISPLAY' | 'CHECKBOX' | 'TEXT_FIELD' | 'DATE_PICKER' | 'SECTION' | 'UPLOAD' | 'BUTTON' | 'ASSESSMENT';
    name: string;
    placeHolder?: string;
    buttonName?: string | null;
    haveButton?: boolean;
    date?: string;
    editable?: boolean;
    checkboxes?: ExtraCheckbox[];
    sections?: Extra[];
    assessmentId?: string;
}

export interface ExtraCheckbox {
    type: 'CHECKBOX';
    name: string;
    haveButton: boolean;
    buttonName: string | null;
}

// ============= UI TYPES =============

export type RoadmapCardStatus = 'initial' | 'in-progress' | 'completed' | 'due';

export interface RoadmapCardData {
    image?: string | number;
    title: string;
    description?: string;
    completionTime?: string;
    status?: RoadmapCardStatus;
    completedDate?: string;
    taskProgress?: {
        completed: number;
        total: number;
    };
    showArrow?: boolean;
    showCheckmark?: boolean;
    phaseNumber?: number;
}

// ============= EXTRAS TYPES =============

export interface CreateExtrasDto {
    userId: string;
    roadMapId: string;
    nestedRoadMapItemId?: string;
    extras?: any[];
}

export interface UpdateExtrasDto {
    extras?: any[];
}

export interface ExtrasResponseDto {
    id: string;
    userId: string;
    roadMapId: string;
    nestedRoadMapItemId?: string;
    extras: any[];
    uploadedDocuments?: any[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ExtrasApiResponse {
    success: boolean;
    message: string;
    data?: ExtrasResponseDto;
}

export interface GetExtrasResponse {
    success: boolean;
    message: string;
    data?: ExtrasResponseDto | null;
}

// ============= COMMENT TYPES =============

export interface RoadmapCommentAuthor {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string; // mentor | director | pastor
}



export interface RoadmapCommentsThread {
    _id: string;
    userId: string;
    roadMapId: string;
    comments: RoadmapComment[];
}

export interface AddCommentRequest {
    text: string;
    userId: string;
    mentorId: string;
}

export interface RoadmapComment {
    _id: string;
    text: string;
    addedDate: string;
    mentorId: RoadmapCommentAuthor;
}

export interface AddCommentResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        userId: string;
        roadMapId: string;
        comments: RoadmapComment[];
    };
}

export interface SubmitQueryRequest {
    actualQueryText: string;
    userId: string;
}

export interface MentorInfo {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    role: string;
}

export interface RoadmapQuery {
    _id: string;
    actualQueryText: string;
    createdDate: string;

    // Answer Fields
    repliedAnswer?: string;
    repliedDate?: string;
    repliedMentorId?: MentorInfo | string;

    status: "pending" | "answered";
}

export interface SubmitQueryResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        userId: string;
        roadMapId: string;
        queries: RoadmapQuery[];
    };
}


export interface RoadmapQueryThread {
    _id: string;
    userId: string;
    roadMapId: string;
    queries: RoadmapQuery[];
}

export interface GetQueriesResponse {
    success: boolean;
    message: string;
    data: RoadmapQueryThread[];
}

export interface ReplyQueryRequest {
    repliedAnswer: string;
    repliedMentorId: string;
}

export interface ReplyQueryResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        userId: string;
        roadMapId: string;
        queries: RoadmapQuery[];
    };
}