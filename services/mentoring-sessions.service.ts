import type { MentorshipRescheduleResponse } from "@/types/mentoringSessions.types";
import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

type MentorshipRescheduleApiResponse = {
  success: boolean;
  message?: string;
  data?: MentorshipRescheduleResponse;
};

export const mentoringSessionsService = {
  /**
   * Mentor reschedules a mentorship session (appointment id = sessionId).
   * Applies roadmap extras updates and future-session cascade on the backend.
   */
  rescheduleSession: async (
    sessionId: string,
    payload: { mentorId: string; newMeetingDate: string },
  ): Promise<MentorshipRescheduleResponse> => {
    const response = await apiClient.patch<MentorshipRescheduleApiResponse>(
      ENDPOINTS.MENTORING_SESSIONS.RESCHEDULE(sessionId),
      payload,
    );
    if (response.data?.success === false) {
      throw new Error(response.data.message || "Failed to reschedule session");
    }
    return response.data?.data ?? {};
  },
};
