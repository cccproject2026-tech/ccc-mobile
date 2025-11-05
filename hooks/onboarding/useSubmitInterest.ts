// src/hooks/onboarding/useSubmitInterest.ts
import { onboardingService } from '@/services/onboarding.service';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { InterestFormData } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useSubmitInterest = () => {
    const router = useRouter();
    const { setUserId, setInterestData, setApplicationId, setInterestStatus } = useOnboardingStore();

    return useMutation({
        mutationFn: (data: InterestFormData) => onboardingService.submitInterest(data),
        onSuccess: (response, variables) => {
            // ✅ UPDATED: Store userId and applicationId from response
            setUserId(response.data.userId);
            setApplicationId(response.data.id);
            setInterestStatus('new');
            setInterestData(variables);

            console.log('✅ Interest form submitted:', response.data);

            // Navigate to waiting screen
            router.push('/(unauthenticated)');
        },
        onError: (error: any) => {
            console.error('❌ Submit interest failed:', error);
        },
    });
};
