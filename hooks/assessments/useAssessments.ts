import { ApiAssessment } from '@/lib/assessments/types';
import { assessmentService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export const useAssessments = () => {
    return useQuery<ApiAssessment[]>({
        queryKey: ['assessments'],
        queryFn: () => assessmentService.getAssessments(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};

