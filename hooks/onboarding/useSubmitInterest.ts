// src/hooks/onboarding/useSubmitInterest.ts
import { onboardingService } from '@/services/onboarding.service';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { InterestFormData } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useSubmitInterest = () => {
    const router = useRouter();
    const { setApplicationId, setInterestData, setInterestStatus } = useOnboardingStore();

    return useMutation({
        mutationFn: (data: InterestFormData) => onboardingService.submitInterest(data),
        onSuccess: (response, variables) => {
            // Store application data
            setApplicationId(response.applicationId);
            setInterestData(variables);
            setInterestStatus(response.status);

            console.log('✅ Interest form submitted:', response.applicationId);

            // Navigate to waiting screen
            router.push('/(unauthenticated)');
        },
        onError: (error: any) => {
            console.error('❌ Submit interest failed:', error.message);
        },
    });
};
