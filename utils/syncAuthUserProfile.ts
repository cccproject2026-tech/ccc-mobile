import { useAuthStore } from "@/stores/auth.store";
import { User } from "@/types/auth.types";
import { storage } from "@/utils/storage";

/** Keep Zustand + SecureStore user in sync after profile picture upload or fetch. */
export async function syncAuthUserProfile(updates: Partial<User>): Promise<void> {
  const { user, updateUser } = useAuthStore.getState();
  if (!user) return;

  updateUser(updates);
  const merged = { ...user, ...updates } as User;
  await storage.setUserData(merged);
}
