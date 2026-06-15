import { profileKeys } from '@/hooks/profile/useProfile';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { User } from '@/types/auth.types';
import { storage } from '@/utils/storage';
import { normalizeApiUser } from '@/utils/userRole';
import { getAuthenticatedHomeRoute } from '@/utils/userRole';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

async function applyInvitationUserUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  updatedUser: User,
) {
  const normalizedUser = normalizeApiUser({
    ...updatedUser,
    fieldMentorInvitation: undefined,
  });

  useAuthStore.getState().setUser(normalizedUser);
  await storage.setUserData(normalizedUser);
  await queryClient.clear();

  return normalizedUser;
}

export function useAcceptFieldMentorInvitation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (token: string) => usersService.acceptInvitation(token),
    onSuccess: async (response) => {
      if (!response.data) {
        throw new Error('Invitation response did not include updated user data.');
      }

      const normalizedUser = await applyInvitationUserUpdate(
        queryClient,
        response.data,
      );

      if (normalizedUser.profilePicture) {
        useOnboardingStore.getState().setHasProfilePicture(true);
      }

      Toast.show({
        type: 'success',
        text1: 'Invitation Accepted',
        text2:
          response.message ||
          'Your role has been updated. Welcome to the Field Mentor program.',
      });

      const homeRoute = getAuthenticatedHomeRoute(normalizedUser.role) ?? '/(mentor)/(tabs)';
      router.replace(homeRoute as any);
    },
    onError: (error: any) => {
      Alert.alert(
        'Request Failed',
        error?.response?.data?.message ||
          error?.message ||
          'Failed to accept invitation.',
      );
    },
  });
}

export function useRejectFieldMentorInvitation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: (token: string) => usersService.rejectInvitation(token),
    onSuccess: async (response) => {
      const { user, updateUser } = useAuthStore.getState();

      if (response.data) {
        const normalizedUser = normalizeApiUser({
          ...user,
          ...response.data,
          fieldMentorInvitation: undefined,
        });
        updateUser(normalizedUser);
        await storage.setUserData(normalizedUser);
      } else if (user) {
        const clearedUser = { ...user, fieldMentorInvitation: undefined };
        updateUser(clearedUser);
        await storage.setUserData(clearedUser);
      }

      if (userId) {
        await queryClient.invalidateQueries({ queryKey: profileKeys.user(userId) });
      }
    },
  });
}

export function useFieldMentorInvitationActions() {
  const acceptMutation = useAcceptFieldMentorInvitation();
  const rejectMutation = useRejectFieldMentorInvitation();

  const handleAccept = useCallback(
    (token?: string) => {
      if (!token) {
        Alert.alert(
          'Invitation Error',
          'Invitation token is missing. Please contact support.',
        );
        return;
      }

      acceptMutation.mutate(token);
    },
    [acceptMutation],
  );

  const handleReject = useCallback(
    (token?: string) => {
      if (!token) {
        Alert.alert(
          'Invitation Error',
          'Invitation token is missing. Please contact support.',
        );
        return;
      }

      rejectMutation.mutate(token, {
        onSuccess: (response) => {
          Toast.show({
            type: 'success',
            text1: 'Invitation Declined',
            text2: response.message || 'Invitation rejected successfully.',
          });
        },
        onError: (error: any) => {
          Alert.alert(
            'Request Failed',
            error?.response?.data?.message ||
              error?.message ||
              'Failed to reject invitation.',
          );
        },
      });
    },
    [rejectMutation],
  );

  return {
    handleAccept,
    handleReject,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isLoading: acceptMutation.isPending || rejectMutation.isPending,
  };
}
