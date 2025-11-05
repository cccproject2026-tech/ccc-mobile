import { authService } from '@/services/auth.service';
import { ResetPasswordRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useResetPassword = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
        onSuccess: (data) => {
            console.log('✅ Password reset successful:', data.message);

            // Navigate to login
            router.replace('/(unauthenticated)');
        },
        onError: (error: any) => {
            console.error('❌ Reset password failed:', error.message);
        },
    });
};  
