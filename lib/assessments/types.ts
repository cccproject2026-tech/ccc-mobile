export interface Assessment {
  id: string;
  type: "CMA" | "PMP";
  title: string;
  description: string;
  status: "Due" | "Not Started" | "Submitted" | "Completed";
  dueDate?: string;
  completionDate?: string;
  meetingDate?: string;
  guidelines: string[];
  preSurvey?: PreSurveyQuestion[];
  sections: AssessmentSection[];
  completedOn?: string;
  createdAt?: string;
  isInProgress?: boolean;
  progressPercentage?: number;
  completedSections?: number;
  totalSections?: number;
}

export interface PreSurveyQuestion {
  id: string;
  text: string;
  type: "number" | "text";
  placeholder?: string;
  required?: boolean;
}

export interface AssessmentSection {
  title: string;
  subtitle?: string; // Optional subtitle for section
  questionGroups: QuestionGroup[]; // Changed from questions to questionGroups
  // Optional per-section CDP recommendations (levels 1–4)
  recommendations?: CreateAssessmentSectionRecommendation[];
}

export interface QuestionGroup {
  id: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: "radio" | "checkbox" | "text" | "number";
  options?: { label: string; value: string }[];
  required?: boolean;
}

// API Response Types
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
  instructions: string[];
  sections: ApiAssessmentSection[];
  assignments: ApiAssessmentAssignment[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// API Request Types for Creating Assessment
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
  type?: "PMP" | "CMA";
  instructions: string[];
  preSurvey?: {
    text: string;
    type: string;
    placeholder: string;
    required: boolean;
  }[];
  sections: CreateAssessmentSection[];
}

// ==================== Assessment Response (Pastor's Answers) ====================
export interface AssessmentResponse {
  assessmentId: string;
  assessmentType: "CMA" | "PMP";
  assessmentTitle: string;
  preSurveyAnswers?: Record<string, string>;
  sectionAnswers: Record<string, any>;
  completedAt?: string;
  status: "Due" | "Not Started" | "Submitted" | "Completed";
  currentSectionIndex: number;
  meetingDate?: string;
  createdAt?: string;
}
