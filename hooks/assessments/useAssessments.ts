import { ApiAssessment } from '@/lib/assessments/types';
import { assessmentService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export const useAssessments = () => {
    return useQuery<ApiAssessment[]>({
        queryKey: ['assessments'],
        queryFn: () => assessmentService.getAssessments(),
        staleTime: 2000, // 2 seconds
        retry: 2,
    });
};

