import type { MutableRefObject } from "react";
import {
    isJumpstartBlockingError,
    presentJumpstartBlockingError,
} from "@/lib/roadmap/jumpstartErrors";
import { isMongoObjectId } from "@/lib/roadmap/helpers";

export type TriggerJumpstartAsync = (args: {
    roadmapId: string;
    userId: string;
    nestedRoadMapItemId?: string;
}) => Promise<{ success?: boolean; alreadyExists?: boolean; message?: string }>;

export function hasJumpstartCompleteMarker(extras?: unknown[] | null): boolean {
    if (!Array.isArray(extras)) return false;
    return extras.some((item) => {
        const entry = item as { type?: string };
        return entry?.type === "JUMPSTART_COMPLETE";
    });
}

/** Append JUMPSTART_COMPLETE to a pastor form submit payload (single atomic extras save). */
export function withJumpstartCompleteExtra<T extends { type: string; name?: string }>(
    extras: T[],
    options: {
        isPastorJumpstartSubmit: boolean;
        existingExtras?: unknown[] | null;
    },
): T[] {
    const { isPastorJumpstartSubmit, existingExtras } = options;
    if (!isPastorJumpstartSubmit || hasJumpstartCompleteMarker(existingExtras)) {
        return extras;
    }
    return [...extras, { type: "JUMPSTART_COMPLETE" } as T];
}

export function shouldRunJumpstartCompletion(params: {
    isPastorEditor: boolean;
    isJumpStartPhase: boolean;
    userId?: string | null;
    existingExtras?: unknown[] | null;
    triggeredUsers: ReadonlySet<string>;
}): boolean {
    const { isPastorEditor, isJumpStartPhase, userId, triggeredUsers } = params;
    if (!isPastorEditor || !isJumpStartPhase || !userId) return false;
    if (triggeredUsers.has(userId)) return false;
    return true;
}

/**
 * POST JUMPSTART_COMPLETE — run only after pastor jumpstart form extras save succeeds.
 * Backend validates mentor slots on form PATCH/POST; posting JUMPSTART first still bumps progress.
 * Returns false when the pastor must fix mentor setup first (no completion side-effects in caller).
 */
export async function ensureJumpstartPastorSubmit(params: {
    triggerJumpstartAsync: TriggerJumpstartAsync;
    roadmapId: string;
    userId: string;
    nestedRoadMapItemId?: string;
    triggeredUsersRef: MutableRefObject<Set<string>>;
}): Promise<boolean> {
    const {
        triggerJumpstartAsync,
        roadmapId,
        userId,
        nestedRoadMapItemId,
        triggeredUsersRef,
    } = params;

    const extrasRoadmapId = isMongoObjectId(roadmapId) ? roadmapId : undefined;
    const nestedForExtras = isMongoObjectId(nestedRoadMapItemId)
        ? nestedRoadMapItemId
        : undefined;

    if (!extrasRoadmapId || !userId) {
        console.error("❌ Missing required data for jumpstart POST", {
            extrasRoadmapId,
            userId,
        });
        return true;
    }

    if (triggeredUsersRef.current.has(userId)) {
        return true;
    }

    try {
        const response = await triggerJumpstartAsync({
            roadmapId: extrasRoadmapId,
            userId,
            nestedRoadMapItemId: nestedForExtras,
        });

        if (response?.success || response?.alreadyExists) {
            triggeredUsersRef.current.add(userId);
        }
        return true;
    } catch (error) {
        if (isJumpstartBlockingError(error)) {
            presentJumpstartBlockingError(error);
            return false;
        }
        console.warn(
            "[Jumpstart Trigger] Failed (non-blocking). Continuing save flow.",
            error,
        );
        return true;
    }
}
