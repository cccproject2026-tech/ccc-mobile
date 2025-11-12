import { grantService } from '@/services/grant.service';
import { MicrograntApplication, MicrograntApplicationDetail } from '@/types/grant.type';
import { useQuery } from '@tanstack/react-query';

export const micrograntApplicationsKeys = {
    all: ['microgrant-applications'] as const,
    byStatus: (status?: string) => ['microgrant-applications', status] as const,
    byId: (applicationId: string) => ['microgrant-applications', 'detail', applicationId] as const,
};

/**
 * Hook to fetch microgrant applications with optional status filter
 */
export function useMicrograntApplications(status?: string) {
    return useQuery<MicrograntApplication[], Error>({
        queryKey: micrograntApplicationsKeys.byStatus(status),
        queryFn: () => grantService.getApplications(status),
    });
}

/**
 * Hook to fetch a single microgrant application by ID
 */
export function useMicrograntApplication(applicationId: string) {
    return useQuery<MicrograntApplicationDetail, Error>({
        queryKey: micrograntApplicationsKeys.byId(applicationId),
        queryFn: () => grantService.getApplication(applicationId),
        enabled: !!applicationId,
    });
}

