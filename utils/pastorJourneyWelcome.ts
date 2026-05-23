import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey = (userId: string) => `pastor_journey_welcome_seen_${userId}`;

/** Returns true if the pastor has already dismissed the roadmap welcome intro. */
export async function hasSeenPastorJourneyWelcome(userId: string): Promise<boolean> {
  if (!userId) return true;
  const raw = await AsyncStorage.getItem(storageKey(userId));
  return raw === "1";
}

/** Persist that the pastor completed the one-time roadmap welcome. */
export async function markPastorJourneyWelcomeSeen(userId: string): Promise<void> {
  if (!userId) return;
  await AsyncStorage.setItem(storageKey(userId), "1");
}
