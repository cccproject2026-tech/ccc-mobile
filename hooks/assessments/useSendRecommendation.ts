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
    }) => assessmentService.sendRecommendation(assessmentId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assessment", variables.assessmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["answers", variables.assessmentId],
      });
    },
  });
};
