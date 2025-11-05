import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileStore } from '@/stores/profile.store';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useProfile = () => {
    const { isAuthenticated, user } = useAuthStore();
    const { profile, setProfile, needsRefresh } = useProfileStore();

    const query = useQuery({
        queryKey: ['profile'],
        queryFn: () => profileService.getMyProfile(user!.id),
        enabled: isAuthenticated && needsRefresh(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2,
    });

    // Update store when data is fetched
    useEffect(() => {
        if (query.data) {
            setProfile(query.data);
        }
    }, [query.data]);

    // Return cached profile immediately if available, otherwise query data
    return {
        ...query,
        data: profile || query.data,
    };
};
