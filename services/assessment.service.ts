import {
    ApiAssessment,
    AssignAssessmentToUsersRequest,
    CreateAssessmentRequest,
    SubmitAnswersPayload,
    SubmitPreSurveyPayload,
    SubmittedAnswersResponse,
} from "@/types/assessment.types";
import { withRetry } from "@/utils/apiConcurrency";
import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const assessmentService = {
  
  getAssessments: async (): Promise<ApiAssessment[]> => {
    console.log("📤 Fetching assessments");
    const response = await apiClient.get<ApiAssessment[]>(
      ENDPOINTS.ASSESSMENTS.GET_ASSESSMENTS,
    );
    console.log(
      "📥 Assessments fetched count:",
      Array.isArray(response.data) ? response.data.length : undefined,
    );
    return response.data;
  },

  
  getAssessmentById: async (assessmentId: string): Promise<ApiAssessment> => {
    console.log("📤 Fetching assessment:", assessmentId);
    const response = await apiClient.get<ApiAssessment>(
      ENDPOINTS.ASSESSMENTS.GET_ASSESSMENT_BY_ID(assessmentId),
    );
    console.log("📥 Assessment fetched:", response.data);
    return response.data;
  },

  
  createAssessment: async (
    data: CreateAssessmentRequest,
  ): Promise<ApiAssessment> => {
    console.log("📤 Creating assessment:", data.name);
    const response = await apiClient.post<ApiAssessment>(
      ENDPOINTS.ASSESSMENTS.CREATE_ASSESSMENT,
      data,
    );
    console.log("📥 Assessment created:", response.data);
    return response.data;
  },

  
  deleteAssessment: async (
    assessmentId: string,
  ): Promise<{ message: string }> => {
    console.log("📤 Deleting assessment:", assessmentId);
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.ASSESSMENTS.DELETE_ASSESSMENT,
      { data: { ids: [assessmentId] } },
    );
    console.log("📥 Assessment deleted:", response.data);
    return response.data;
  },

  
  updateInstructions: async (
    assessmentId: string,
    instructions: string[],
  ): Promise<ApiAssessment> => {
    console.log("📤 Updating assessment instructions:", assessmentId);
    const response = await apiClient.patch<ApiAssessment>(
      ENDPOINTS.ASSESSMENTS.UPDATE_INSTRUCTIONS(assessmentId),
      { instructions },
    );
    console.log("📥 Assessment instructions updated:", response.data);
    return response.data;
  },

  
  assignAssessment: async (
    assessmentId: string,
    payload: AssignAssessmentToUsersRequest,
  ): Promise<any> => {
    console.log(
      "📤 Assigning assessment:",
      assessmentId,
      "to users:",
      payload.userIds,
    );
    const response = await apiClient.post(
      ENDPOINTS.ASSESSMENTS.ASSIGN_ASSESSMENT(assessmentId),
      payload,
    );
    console.log("📥 Assessment assigned:", response.data);
    return response.data;
  },

  
  submitPreSurvey: async (
    assessmentId: string,
    payload: SubmitPreSurveyPayload,
  ): Promise<any> => {
    console.log("📤 Submitting pre-survey for assessment:", assessmentId);
    const response = await apiClient.post(
      ENDPOINTS.ASSESSMENTS.SUBMIT_ASSESSMENT_PRESURVEY(assessmentId),
      payload,
    );
    console.log("📥 Pre-survey submitted:", response.data);
    return response.data;
  },

  
  submitAssessmentAnswers: async (
    assessmentId: string,
    payload: SubmitAnswersPayload,
  ): Promise<any> => {
    console.log("📤 Submitting assessment answers:", assessmentId);
    console.log("Payload:", payload);
    const response = await apiClient.post(
      ENDPOINTS.ASSESSMENTS.SUBMIT_ASSESSMENT_ANSWERS(assessmentId),
      payload,
    );
    console.log("📥 Assessment answers submitted:", response.data);
    return response.data;
  },

  
  fetchAnswers: async (
    assessmentId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: SubmittedAnswersResponse;
  }> => {
    console.log(
      "📤 Fetching answers for assessment:",
      assessmentId,
      "user:",
      userId,
    );

    const response = await withRetry(() =>
      apiClient.get<{
        success: boolean;
        message: string;
        data: SubmittedAnswersResponse;
      }>(ENDPOINTS.ASSESSMENTS.FETCH_ANSWERS(assessmentId, userId)),
    );

    console.log("📥 Answers fetched:", response.data);
    return response.data;
  },

  
  sendRecommendation: async (
    assessmentId: string,
    payload: {
      userId: string;
      sectionId: string;
      recommendations: string[];
    },
  ): Promise<any> => {
    const url = ENDPOINTS.ASSESSMENTS.SEND_RECOMMENDATION(assessmentId);
    console.log("[assessment.service] sendRecommendation", {
      url,
      assessmentId,
      payload,
    });
    const response = await apiClient.post(url, payload);
    console.log("[assessment.service] sendRecommendation response", {
      status: response.status,
      data: response.data,
    });
    return response.data;
  },
};
