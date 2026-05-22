import AsyncStorage from "@react-native-async-storage/async-storage";

/** Hide from pastor home this long after the assignment card was first seen. */
export const PASTOR_NEW_ASSIGNMENT_VIEW_HIDE_MS = 24 * 60 * 60 * 1000;

const STORAGE_PREFIX = "pastor_new_assignment_viewed_";

const storageKey = (
  userId: string,
  kind: "roadmap" | "assessment",
  itemId: string,
) => `${STORAGE_PREFIX}${userId}::${kind}::${itemId}`;

const viewMapKey = (kind: "roadmap" | "assessment", itemId: string) =>
  `${kind}:${itemId}`;

export async function markNewAssignmentViewed(
  userId: string,
  kind: "roadmap" | "assessment",
  itemId: string,
): Promise<void> {
  if (!userId || !itemId) return;
  const key = storageKey(userId, kind, itemId);
  const existing = await AsyncStorage.getItem(key);
  if (existing != null) return;
  await AsyncStorage.setItem(key, String(Date.now()));
}

export async function loadNewAssignmentViews(
  userId: string,
): Promise<Record<string, number>> {
  if (!userId) return {};
  const prefix = `${STORAGE_PREFIX}${userId}::`;
  const allKeys = await AsyncStorage.getAllKeys();
  const relevant = allKeys.filter((k) => k.startsWith(prefix));
  if (relevant.length === 0) return {};

  const pairs = await AsyncStorage.multiGet(relevant);
  const out: Record<string, number> = {};
  for (const [key, value] of pairs) {
    if (!value) continue;
    const suffix = key.slice(prefix.length);
    const sep = suffix.indexOf("::");
    if (sep < 0) continue;
    const kind = suffix.slice(0, sep);
    const itemId = suffix.slice(sep + 2);
    if (kind !== "roadmap" && kind !== "assessment") continue;
    const viewed = Number(value);
    if (Number.isNaN(viewed)) continue;
    out[viewMapKey(kind, itemId)] = viewed;
  }
  return out;
}

export function shouldShowNewAssignmentOnHome(
  viewedAtMs: number | null | undefined,
): boolean {
  if (viewedAtMs == null) return true;
  return Date.now() - viewedAtMs <= PASTOR_NEW_ASSIGNMENT_VIEW_HIDE_MS;
}