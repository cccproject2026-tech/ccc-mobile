export type PhaseCode = 'JUMP_START' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3';
export type ItemKind = 'CHILD_ROADMAP' | 'TASK';
export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface Program { id: string; title: string; phases: string[]; }
export interface Phase { id: string; code: PhaseCode; title: string; subtitle?: string; estMonthsMin?: number; estMonthsMax?: number; coverImage?: string; items: string[]; }

export interface DescriptionItem {
    type: 'text' | 'ordered' | 'unordered';
    content: string | string[]; // string for text, array for lists
}

export interface BaseItem { id: string; phaseId: string; kind: ItemKind; title: string; description?: string; descriptionRich?: DescriptionItem; status: Status; dueDate?: string; sessionDate?: string; tags?: string[]; meta?: Record<string, any>; }

export interface ChildRoadmap extends BaseItem { kind: 'CHILD_ROADMAP'; steps: { id: string; title: string; notes?: string; done: boolean; }[]; }


export interface RevitalizationData { program: Program; phases: Record<string, Phase>; items: Record<string, ChildRoadmap | Task>; }


// lib/roadmap/types.ts (additions)
export type TaskType =
    | 'UPLOAD'       // document, image, video upload
    | 'FORM'         // survey, text input, date, dropdown, multi-select
    | 'SIGN'         // signature, checkbox agreement
    | 'CHECKLIST'    // multi-step checklist
    | 'LINK'         // submit external URL
    | 'MEETING'      // schedule/confirm meeting
    | 'TIMELINE';    // view timeline (view-only, special case)

export type FieldType =
    | 'text'
    | 'textarea'
    | 'date'
    | 'dropdown'
    | 'multi-select'
    | 'number'
    | 'email'
    | 'url';

export interface FormField {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[]; // for dropdown/multi-select
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}

export interface UploadSchema {
    accept: string[];        // ['application/pdf', 'image/*']
    maxSizeMB?: number;
    maxFiles?: number;
    label?: string;
    description?: string;
}

export interface FormSchema {
    fields: FormField[];
    submitLabel?: string;
}

export interface SignSchema {
    documentUrl?: string;
    agreementText: string;
    requireCheckbox: boolean;
    signatureLabel?: string;
}

export interface ChecklistSchema {
    items: { id: string; text: string; done: boolean }[];
}

export interface LinkSchema {
    placeholder: string;
    label: string;
    urlPattern?: string; // regex for validation
}

export interface MeetingSchema {
    durationMin: number;
    allowReschedule: boolean;
    description?: string;
}

// Update Task interface
export interface Task extends BaseItem {
    kind: 'TASK';
    taskType: TaskType;
    schema?: UploadSchema | FormSchema | SignSchema | ChecklistSchema | LinkSchema | MeetingSchema;
    // Store user progress
    formValues?: Record<string, any>;
    attachments?: { id: string; uri: string; name: string }[];
    checklist?: Record<string, boolean>;
    signedAt?: string;
    meetingScheduledAt?: string;
}
