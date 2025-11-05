// src/hooks/auth/useSetPassword.ts
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { SetPasswordRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useSetPassword = () => {
    const router = useRouter();
    const { login } = useAuthStore();
    const { setPasswordSet } = useOnboardingStore();

    return useMutation({
        mutationFn: (data: SetPasswordRequest) => authService.setPassword(data),

        onSuccess: async (response) => {
            try {
                console.log('✅ Set password response:', response);
                // Extract user and tokens from response
                const { status, message, data } = response;

                // Auto-login after password set

                // Mark password as set
                setPasswordSet(true);

                console.log('✅ Password set successfully :', message);

                // // Navigate to profile completion
                // router.replace('/(unauthenticated)/profile');
            } catch (error) {
                console.error('❌ Error in onSuccess:', error);
            }
        },

        onError: (error: any) => {
            console.error('❌ Set password failed:', {
                message: error.message,
                statusCode: error.statusCode,
                errors: error.errors,
            });
        },
    });
};
