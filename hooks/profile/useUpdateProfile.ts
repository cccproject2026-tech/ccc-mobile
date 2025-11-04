import { profileService } from '@/services/profile.service';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileStore } from '@/stores/profile.store';
import { PastorProfile, UpdateProfileData } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { updateProfile: updateProfileStore } = useProfileStore();
    const { updateUser } = useAuthStore();

    return useMutation({
        mutationFn: (updates: UpdateProfileData) =>
            profileService.updateProfile(updates),

        // Optimistic update (immediate UI feedback)
        onMutate: async (updates) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: ['profile'] });

            // Snapshot previous value
            const previousProfile = queryClient.getQueryData<PastorProfile>(['profile']);

            // Optimistically update cache
            if (previousProfile) {
                const optimisticProfile = { ...previousProfile, ...updates };
                queryClient.setQueryData(['profile'], optimisticProfile);
                updateProfileStore(updates);
            }

            return { previousProfile };
        },

        onError: (err, variables, context) => {
            // Rollback on error
            if (context?.previousProfile) {
                queryClient.setQueryData(['profile'], context.previousProfile);
                updateProfileStore(context.previousProfile);
            }
            console.error('❌ Update profile failed:', err);
        },

        onSuccess: (data) => {
            // Confirm update with server data
            updateProfileStore(data);
            updateUser(data); // Also update auth store
            queryClient.setQueryData(['profile'], data);
            console.log('✅ Profile updated successfully');
        },

        onSettled: () => {
            // Refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};
