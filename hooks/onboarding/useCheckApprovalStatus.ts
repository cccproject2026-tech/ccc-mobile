// src/hooks/onboarding/useCheckUserStatus.ts
import { onboardingService } from '@/services/onboarding.service';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export const useCheckUserStatus = () => {
    const router = useRouter();
    const { userId, interestStatus, setInterestStatus } = useOnboardingStore();
    console.log('UserId : ', userId)
    const query = useQuery({
        queryKey: ['user-status', userId],
        queryFn: () => onboardingService.checkUserStatus(userId!),
        enabled: !!userId && (interestStatus === 'pending' || interestStatus === 'new'),
        refetchInterval: 10000, // Poll every 10 seconds
        refetchIntervalInBackground: false,
    });

    // Handle status changes
    useEffect(() => {
        if (query.data?.data) {
            const newStatus = query.data.data.status;

            // Update status
            setInterestStatus(newStatus);
        }
    }, [query.data]);

    return query;
};
