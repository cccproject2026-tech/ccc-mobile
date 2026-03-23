import AsyncStorage from "@react-native-async-storage/async-storage";

/** How long the pastor dashboard shows mentor-assignment intro cards after onboarding. */
export const PASTOR_MENTOR_INTRO_WINDOW_MS = 24 * 60 * 60 * 1000;

const storageKey = (userId: string) => `pastor_mentor_intro_anchor_${userId}`;

/**
 * Start the mentor-intro window for this user (first write wins).
 * Call from onboarding paths only — not on every login.
 */
export async function markPastorMentorIntroStart(userId: string): Promise<void> {
  if (!userId) return;
  const key = storageKey(userId);
  const existing = await AsyncStorage.getItem(key);
  if (existing != null) return;
  await AsyncStorage.setItem(key, String(Date.now()));
}

export async function isPastorMentorIntroActive(userId: string): Promise<boolean> {
  if (!userId) return false;
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (raw == null) return false;
  const started = Number(raw);
  if (Number.isNaN(started)) return false;
  return Date.now() - started <= PASTOR_MENTOR_INTRO_WINDOW_MS;
}
