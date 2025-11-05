import { authService } from '@/services';
import { SendOtpRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (data: SendOtpRequest) => authService.sendOtp(data),
    onSuccess: (data) => {
      console.log(`✅ OTP sent (expires in ${data.data.expiresIn}s)`);
    },
    onError: (error: any) => {
      console.error('❌ Send OTP failed:', error.message);
    },
  });
};
