import { assessmentService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export const useFetchAnswers = (
    assessmentId: string | undefined,
    userId: string | undefined,
    enabled: boolean = true // ADD THIS PARAMETER
) => {
    return useQuery({
        queryKey: ['answers', assessmentId, userId],
        queryFn: () => assessmentService.fetchAnswers(assessmentId!, userId!),
        enabled: enabled && !!assessmentId && !!userId, // USE IT HERE
        staleTime: 1000 * 60 * 2,
        retry: 2,
    });
};
