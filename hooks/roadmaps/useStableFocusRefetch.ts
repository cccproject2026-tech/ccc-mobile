import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

const DEFAULT_COOLDOWN_MS = 5000;

/**
 * Runs refetch at most once per cooldown window when a screen gains focus.
 * Prevents roadmap/progress/extras storms when multiple screens refetch on focus.
 */
export function useStableFocusRefetch(
    refetch: () => void | Promise<unknown>,
    key: string,
    cooldownMs: number = DEFAULT_COOLDOWN_MS,
) {
    const lastRefetchAt = useRef(0);

    useFocusEffect(
        useCallback(() => {
            const now = Date.now();
            if (now - lastRefetchAt.current < cooldownMs) {
                return;
            }
            lastRefetchAt.current = now;
            void refetch();
        }, [refetch, cooldownMs]),
    );
}
