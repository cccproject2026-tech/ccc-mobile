import { onboardingService } from '@/services/onboarding.service';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export const useCheckApprovalStatus = () => {
    const router = useRouter();
    const {
        applicationId,
        interestStatus,
        setInterestStatus,
        updateLastStatusCheck,
    } = useOnboardingStore();

    const query = useQuery({
        queryKey: ['approval-status', applicationId],
        queryFn: () => onboardingService.checkApprovalStatus(applicationId!),
        enabled: !!applicationId && interestStatus === 'pending',
        refetchInterval: 10000,
        refetchIntervalInBackground: false,
    });

    useEffect(() => {
        if (query.data) {
            updateLastStatusCheck();
            setInterestStatus(query.data.status);

            console.log('📊 Approval status:', query.data.status);

            if (query.data.status === 'approved') {
                console.log('✅ Approved! Navigating to verify email...');
                router.push('/(unauthenticated)/set-password');
            } else if (query.data.status === 'rejected') {
                console.log('❌ Application rejected');
            }
        }
    }, [query.data]);

    return query;
};
