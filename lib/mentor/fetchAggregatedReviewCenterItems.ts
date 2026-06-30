import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  mentorService,
  type ReviewPastorMeta,
} from "@/services/mentor.service";
import type { ReviewItem } from "@/lib/mentor/reviewCenter.types";

const SEEN_STORAGE_KEY = "mentor_review_center_seen";

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export interface AggregatedReviewCenterResult {
  items: ReviewItem[];
  pastors: ReviewPastorMeta[];
}

/**
 * Fetch the aggregated Review Center payload from the backend and overlay the
 * locally-persisted "seen" state (kept client-side, exactly as the legacy scan did).
 */
export async function fetchAggregatedReviewCenterItems(
  mentorId: string,
): Promise<AggregatedReviewCenterResult> {
  const startedAt = Date.now();
  const [response, seenIds] = await Promise.all([
    mentorService.getReviewCenter(mentorId),
    loadSeenIds(),
  ]);

  const items = response.items.map((item) => ({
    ...item,
    isSeen: seenIds.has(item.id),
  }));

  if (__DEV__) {
    console.log(
      `[ReviewCenter] aggregated: ${items.length} items in ${
        Date.now() - startedAt
      }ms (server=${response.generatedInMs}ms, cached=${response.cached})`,
    );
  }

  return { items, pastors: response.pastors };
}
