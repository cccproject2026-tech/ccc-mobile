import { authService } from '@/services/auth.service';
import { ForgotPasswordRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
        onSuccess: (data) => {
            console.log('✅ Password reset email sent:', data.message);
        },
        onError: (error: any) => {
            console.error('❌ Forgot password failed:', error.message);
        },
    });
};
