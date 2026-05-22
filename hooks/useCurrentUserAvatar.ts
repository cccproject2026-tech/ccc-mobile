import { useUserProfile } from "@/hooks/profile/useProfile";
import { useAuthStore } from "@/stores/auth.store";
import { getAvatarSource } from "@/utils/avatarSource";
import { syncAuthUserProfile } from "@/utils/syncAuthUserProfile";
import { useEffect, useMemo } from "react";
import { ImageSourcePropType } from "react-native";

/**
 * Avatar for the logged-in user (home WelcomeCard, drawer, etc.).
 * Prefers fresh profile API data, then auth store; syncs store when API has a picture.
 */
export function useCurrentUserAvatar(): ImageSourcePropType {
  const authUser = useAuthStore((s) => s.user);
  const { data: profileUser } = useUserProfile();

  const profilePicture =
    profileUser?.profilePicture ?? authUser?.profilePicture ?? undefined;

  useEffect(() => {
    if (!profileUser?.profilePicture || !authUser?.id) return;
    if (profileUser.profilePicture === authUser.profilePicture) return;
    void syncAuthUserProfile({ profilePicture: profileUser.profilePicture });
  }, [authUser?.id, authUser?.profilePicture, profileUser?.profilePicture]);

  return useMemo(
    () => getAvatarSource({ profilePicture }),
    [profilePicture],
  );
}
