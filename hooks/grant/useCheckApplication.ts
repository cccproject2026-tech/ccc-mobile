import { grantService } from '@/services/grant.service';
import { CheckApplicationResponse } from '@/types/grant.type';
import { useQuery } from '@tanstack/react-query';

export const useCheckApplication = (userId: string | undefined) => {
    return useQuery<CheckApplicationResponse>({
        queryKey: ['checkApplication', userId],
        queryFn: () => grantService.checkApplication(userId!),
        enabled: !!userId,
        staleTime: 2000,
        retry: 1,
    });
};

