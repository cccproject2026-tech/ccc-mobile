import { certificatesService } from '@/services/certificates.service';
import { useQuery } from '@tanstack/react-query';

export const pastorCertificateKeys = {
  all: ['pastor-certificate'] as const,
  user: (userId: string) => [...pastorCertificateKeys.all, userId] as const,
};

export function usePastorCertificate(userId?: string) {
  return useQuery({
    queryKey: pastorCertificateKeys.user(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is missing');
      return certificatesService.getUserCertificate(userId);
    },
    enabled: !!userId,
    staleTime: 60_000,
    retry: 1,
  });
}
