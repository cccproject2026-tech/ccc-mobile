import AsyncStorage from "@react-native-async-storage/async-storage";
import { REVIEW_CENTER_STALE_MS } from "@/lib/mentor/reviewCenterQueryKeys";

const PENDING_COUNT_STORAGE_PREFIX = "mentor_review_center_pending_count";

type PersistedPendingCount = {
  count: number;
  savedAtMs: number;
};

function storageKey(mentorId: string): string {
  return `${PENDING_COUNT_STORAGE_PREFIX}:${mentorId}`;
}

export async function loadPersistedPendingCount(
  mentorId: string,
): Promise<number | null> {
  if (!mentorId) return null;
  try {
    const raw = await AsyncStorage.getItem(storageKey(mentorId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPendingCount;
    if (
      typeof parsed?.count !== "number" ||
      typeof parsed?.savedAtMs !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.savedAtMs > REVIEW_CENTER_STALE_MS) {
      return null;
    }
    return Math.max(0, parsed.count);
  } catch {
    return null;
  }
}

export async function persistPendingCount(
  mentorId: string,
  count: number,
): Promise<void> {
  if (!mentorId) return;
  try {
    const payload: PersistedPendingCount = {
      count: Math.max(0, count),
      savedAtMs: Date.now(),
    };
    await AsyncStorage.setItem(storageKey(mentorId), JSON.stringify(payload));
  } catch {
    // ignore persistence failures
  }
}
