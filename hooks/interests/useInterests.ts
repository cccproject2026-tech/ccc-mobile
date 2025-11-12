import { interestsService } from '@/services/interests.service';
import { InterestItem, InterestMetadata, UpdateInterestStatusResponse } from '@/types/interest.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const interestsKeys = {
    all: ['interests'] as const,
    metadata: ['interests', 'metadata'] as const,
};

export function useInterests() {
    return useQuery<InterestItem[]>({
        queryKey: interestsKeys.all,
        queryFn: () => interestsService.getAll(),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 1,
    });
}

export function useInterestMetadata() {
    return useQuery<InterestMetadata>({
        queryKey: interestsKeys.metadata,
        queryFn: () => interestsService.getMetadata(),
        staleTime: 1000 * 60 * 60, // 1 hour - metadata doesn't change often
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 1,
    });
}

export function useUpdateInterestStatus() {
    const queryClient = useQueryClient();

    return useMutation<UpdateInterestStatusResponse, Error, { interestId: string; status: 'accepted' | 'rejected' | 'pending' }>({
        mutationFn: ({ interestId, status }) => 
            interestsService.updateStatus(interestId, status),
        onSuccess: () => {
            // Invalidate interests list to refetch updated data
            queryClient.invalidateQueries({ queryKey: interestsKeys.all });
        },
    });
}


