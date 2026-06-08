// ==================== Frontend Types ====================
export interface Assessment {
    id: string;
    type: 'CMA' | 'PMP';
    title: string;
    description: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    /** When this user was assigned the assessment (from API assignments). */
    assignedAt?: string;
    updatedAt?: string;
    dueDate?: string;
    completionDate?: string;
    meetingDate?: string;
    guidelines: string[];
    preSurvey?: PreSurveyQuestion[];
    sections: AssessmentSection[];
    completedOn?: string;
    /** Pastor started but has not submitted all sections yet. */
    isInProgress?: boolean;
    progressPercentage?: number;
    completedSections?: number;
    totalSections?: number;
}

export interface PreSurveyQuestion {
    id: string;
    _id?: string;
    text: string;
    type: 'number' | 'text';
    placeholder?: string;
    required?: boolean;
}

export interface AssessmentSection {
    title: string;
    subtitle?: string;
    questionGroups: QuestionGroup[];
    
    recommendations?: CreateAssessmentSectionRecommendation[];
}

export interface QuestionGroup {
    id: string;
    groupTitle?: string;
    questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
    id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text' | 'number';
    options?: { label: string; value: string }[];
    required?: boolean;
}

// ==================== API Response Types ====================
export interface ApiAssessmentChoice {
    text: string;
    _id: string;
}

export interface ApiAssessmentLayer {
    title: string;
    choices: ApiAssessmentChoice[];
    _id: string;
}

export interface ApiAssessmentSection {
    title: string;
    description: string;
    layers: ApiAssessmentLayer[];
    _id: string;
    // Optional per-section CDP recommendations from backend
    recommendations?: CreateAssessmentSectionRecommendation[];
}

export interface ApiAssessmentAssignment {
    userId: string;
    assignedAt: string;
    status: string;
    _id: string;
}

export interface ApiAssessment {
    _id: string;
    name: string;
    description: string;
    type?: 'CMA' | 'PMP'; // Optional since backend doesn't always return it
    instructions: string[];
    sections: ApiAssessmentSection[];
    preSurvey?: PreSurveyQuestion[];
    assignments: ApiAssessmentAssignment[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// ==================== API Request Types ====================
export interface CreateAssessmentChoice {
    text: string;
}

export interface CreateAssessmentLayer {
    title: string;
    choices: CreateAssessmentChoice[];
}

/** Per-section CDP: level 1–4 recommendations */
export interface CreateAssessmentSectionRecommendation {
    level: 1 | 2 | 3 | 4;
    items: string[];
}

export interface CreateAssessmentSection {
    title: string;
    description: string;
    layers: CreateAssessmentLayer[];
    recommendations: CreateAssessmentSectionRecommendation[];
}

export interface CreateAssessmentRequest {
    name: string;
    description: string;
    type: 'CMA' | 'PMP';
    instructions: string[];
    sections: CreateAssessmentSection[];
    preSurvey?: PreSurveyQuestion[];
}

export interface AssignAssessmentToUsersRequest {
    userIds: string[];
}

// ==================== Assessment Response ====================
export interface AssessmentResponse {
    assessmentId: string;
    assessmentType: 'CMA' | 'PMP';
    assessmentTitle: string;
    preSurveyAnswers?: Record<string, string>;
    sectionAnswers: Record<string, any>;
    completedAt?: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    currentSectionIndex: number;
    meetingDate?: string;
}

export interface SubmitPreSurveyPayload {
    userId: string;
    preSurveyAnswers: Array<{
        questionText: string;
        answer: string | number;
    }>;
}

export interface SubmitAnswersPayload {
    userId: string;
    answers: Array<{
        sectionId: string;
        layers: Array<{
            layerId: string;
            selectedChoice: string;
        }>;
    }>;
}

// ==================== Assessment Response ====================
export interface AssessmentResponse {
    assessmentId: string;
    assessmentType: 'CMA' | 'PMP';
    assessmentTitle: string;
    preSurveyAnswers?: Record<string, string>;
    sectionAnswers: Record<string, any>;
    completedAt?: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    currentSectionIndex: number;
    meetingDate?: string;
}

export interface SubmitPreSurveyPayload {
    userId: string;
    preSurveyAnswers: Array<{
        questionText: string;
        answer: string | number;
    }>;
}

export interface SubmitAnswersPayload {
    userId: string;
    answers: Array<{
        sectionId: string;
        layers: Array<{
            layerId: string;
            selectedChoice: string;
        }>;
    }>;
}

// ==================== Submitted Answers Response ====================
export interface SubmittedAnswersResponse {
    _id: string;
    assessmentId: string;
    userId: string;
    /** True only after mentor has sent CDP via POST send-recommendation; pastor sees CDP only when this is true. */
    recommendationsSentByMentor?: boolean;
    preSurveyAnswers?: Array<{
        questionText: string;
        answer: string;
        _id: string;
    }>;
    preSurveySubmittedAt?: string;
    sections: Array<{
        sectionId: string;
        /** Score 1–4 for this section; used to show only the matching CDP recommendation level. */
        sectionScore?: number;
        /** Recommended CDP items for this section, as plain text lines. */
        recommendations?: string[];
        layers: Array<{
            layerId: string;
            selectedChoice: string;
            answeredAt: string;
            _id: string;
        }>;
        _id: string;
    }>;
    createdAt: string;
    updatedAt?: string;
}
