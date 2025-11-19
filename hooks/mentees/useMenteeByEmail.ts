import { MenteeDetail, menteesService } from '@/services/mentees.service';
import { useQuery } from '@tanstack/react-query';

export const useMenteeByEmail = (email: string | undefined) => {
    return useQuery<MenteeDetail>({
        queryKey: ['mentee', 'email', email],
        queryFn: () => menteesService.getMenteeByEmail(email!),
        enabled: !!email,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });
};

