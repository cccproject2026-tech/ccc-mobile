import { assessmentService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export const useFetchAnswers = (
    assessmentId: string | undefined,
    userId: string | undefined,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: ['answers', assessmentId, userId],
        queryFn: () => assessmentService.fetchAnswers(assessmentId!, userId!),
        enabled: enabled && !!assessmentId && !!userId,
        staleTime: 2000,
        retry: 2,
    });
};
