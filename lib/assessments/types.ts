export interface Assessment {
    id: string;
    type: 'CMA' | 'PMP';
    title: string;
    description: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    dueDate?: string;
    completionDate?: string;
    meetingDate?: string;
    guidelines: string[];
    preSurvey?: PreSurveyQuestion[];
    sections: AssessmentSection[];
    completedOn?: string;
}

export interface PreSurveyQuestion {
    id: string;
    text: string;
    type: 'number' | 'text';
    placeholder?: string;
    required?: boolean;
}

export interface AssessmentSection {
    title: string;
    subtitle?: string; // Optional subtitle for section
    questionGroups: QuestionGroup[]; // Changed from questions to questionGroups
}

export interface QuestionGroup {
    id: string;
    questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
    id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text' | 'number';
    options?: { label: string; value: string }[];
    required?: boolean;
}
