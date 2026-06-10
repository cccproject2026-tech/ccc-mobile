import {
    readTaskCompletionTimestamps,
    recordTaskCompletionTimestamp,
    type TaskCompletionTimestampMap,
} from '@/lib/roadmap/taskCompletionTimestamps';
import type { Roadmap } from '@/lib/roadmap/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Loads locally recorded task completion times (written only after a successful save).
 * Used so "Completed X days ago" reflects when the pastor finished, not roadmap template dates.
 */
export function useTaskCompletionTimestamps(
    userId: string | undefined,
    _roadmaps?: Roadmap[] | undefined | null,
) {
    const [timestamps, setTimestamps] = useState<TaskCompletionTimestampMap>({});

    const reload = useCallback(async () => {
        if (!userId) {
            setTimestamps({});
            return;
        }
        const map = await readTaskCompletionTimestamps(userId);
        setTimestamps(map);
    }, [userId]);

    useEffect(() => {
        reload();
    }, [reload]);

    const recordCompletion = useCallback(
        async (phaseId: string, taskId: string, completedAtMs?: number) => {
            if (!userId) return;
            await recordTaskCompletionTimestamp(userId, phaseId, taskId, completedAtMs ?? Date.now());
            await reload();
        },
        [userId, reload],
    );

    return { timestamps, recordCompletion, reloadTimestamps: reload };
}
