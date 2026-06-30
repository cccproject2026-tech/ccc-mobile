import { apiClient } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import type { ReviewItem } from "@/lib/mentor/reviewCenter.types";

/** Lightweight pastor metadata returned alongside review items (avatars without a per-mentee fetch). */
export interface ReviewPastorMeta {
  pastorId: string;
  pastorName: string;
  profilePicture?: string | null;
}

export interface MentorReviewCenterResponse {
  items: ReviewItem[];
  pastors: ReviewPastorMeta[];
  generatedInMs: number;
  cached: boolean;
}

interface MentorReviewCenterApiResponse {
  success: boolean;
  message: string;
  data: MentorReviewCenterResponse;
}

export const mentorService = {
  /**
   * Aggregated Review Center payload — replaces the legacy client-side scan.
   * One request returns all review items (with stable IDs) plus pastor metadata.
   */
  getReviewCenter: async (
    mentorId: string,
  ): Promise<MentorReviewCenterResponse> => {
    const response = await apiClient.get<MentorReviewCenterApiResponse>(
      ENDPOINTS.MENTOR.REVIEW_CENTER(mentorId),
    );
    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to fetch mentor review center",
      );
    }
    const data = response.data.data;
    return {
      items: data?.items ?? [],
      pastors: data?.pastors ?? [],
      generatedInMs: data?.generatedInMs ?? 0,
      cached: data?.cached ?? false,
    };
  },
};
