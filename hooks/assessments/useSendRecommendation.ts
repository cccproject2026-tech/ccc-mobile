import { assessmentService } from "@/services/assessment.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSendRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
      payload,
    }: {
      assessmentId: string;
      payload: {
        userId: string;
        sectionId: string;
        recommendations: string[];
      };
    }) => {
      console.log("[useSendRecommendation] mutationFn called", {
        assessmentId,
        payload,
      });
      return assessmentService.sendRecommendation(assessmentId, payload);
    },

    onSuccess: (data, variables) => {
      console.log("[useSendRecommendation] onSuccess", {
        assessmentId: variables.assessmentId,
        sectionId: variables.payload.sectionId,
        response: data,
      });
      queryClient.invalidateQueries({
        queryKey: ["assessment", variables.assessmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["answers", variables.assessmentId],
      });
    },

    onError: (error, variables) => {
      console.error("[useSendRecommendation] onError", {
        assessmentId: variables.assessmentId,
        sectionId: variables.payload.sectionId,
        error,
      });
    },
  });
};
