import { authService } from '@/services/auth.service';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { VerifyOtpRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useVerifyOtp = () => {
    const router = useRouter();
    const { setEmailVerified } = useOnboardingStore();

    return useMutation({
        mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
        onSuccess: (data) => {
            if (data.data.isValid) {
                setEmailVerified(true);
                console.log('✅ OTP verified successfully');

                // // Store temporary token in state for password setting
                // // You can use a separate store or pass it as navigation param
                // router.push({
                //     pathname: '/(unauthenticated)/set-password',
                //     params: { token: data.data.token },
                // });
            }
        },
        onError: (error: any) => {
            console.error('❌ OTP verification failed:', error.message);
        },
    });
};
