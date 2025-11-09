import { ApiAssessment } from '@/lib/assessments/types';
import { assessmentService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export const useAssessment = (assessmentId: string | undefined) => {
    return useQuery<ApiAssessment>({
        queryKey: ['assessment', assessmentId],
        queryFn: () => assessmentService.getAssessmentById(assessmentId!),
        enabled: !!assessmentId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};

