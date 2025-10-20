
import { ExternalPathString, RelativePathString, Route } from "expo-router";


export type PhaseCode = 'JUMP_START' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3';
export type Status = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface Program {
    id: string;
    title: string;
    phases: string[];
}

export interface Phase {
    id: string;
    code: PhaseCode;
    title: string;
    subtitle?: string;
    estMonthsMin?: number;
    estMonthsMax?: number;
    coverImage?: string;
    tasks: string[];
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
    | 'SURVEY_BUTTON';

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
    description?: string; // ✅ PLAIN TEXT - can have line breaks!
    status: Status;
    dueDate?: string;
    tags?: string[];
    schema: DynamicFormSchema;
    meta?: {
        coverImage?: string;
        completionTimeMonths?: string;
        roadmapText?: string;
        hasOverviewTab?: boolean;
        [key: string]: any;
    };
}

export interface RevitalizationData {
    program: Program;
    phases: Record<string, Phase>;
    tasks: Record<string, Task>;
}
