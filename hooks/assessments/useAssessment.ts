import { assessmentService } from '@/services';
import { ApiAssessment } from '@/types/assessment.types';
import { useQuery } from '@tanstack/react-query';

export const useAssessment = (assessmentId: string | undefined) => {
    return useQuery<ApiAssessment>({
        queryKey: ['assessment', assessmentId],
        queryFn: () => assessmentService.getAssessmentById(assessmentId!),
        enabled: !!assessmentId,
        staleTime: 2000,
        retry: 2,
    });
};

