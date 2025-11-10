import { assessmentService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export const useFetchAnswers = (
    assessmentId: string | undefined,
    userId: string | undefined
) => {
    return useQuery({
        queryKey: ['answers', assessmentId, userId],
        queryFn: () => assessmentService.fetchAnswers(assessmentId!, userId!),
        enabled: !!assessmentId && !!userId,
        staleTime: 1000 * 60 * 2, // 2 minutes (answers might change)
        retry: 2,
    });
};
