import { getTasks, normalizeNestedTaskStatus } from '@/lib/roadmap/helpers';
import {
    readTaskCompletionTimestamps,
    recordTaskCompletionTimestamp,
    TASK_COMPLETION_STORAGE_PREFIX,
    taskCompletionMapKey,
    type TaskCompletionTimestampMap,
} from '@/lib/roadmap/taskCompletionTimestamps';
import type { Roadmap } from '@/lib/roadmap/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads locally recorded task completion times and observes newly completed tasks.
 * Used so "Completed X days ago" reflects when the pastor finished, not roadmap template dates.
 */
export function useTaskCompletionTimestamps(
    userId: string | undefined,
    roadmaps: Roadmap[] | undefined | null,
) {
    const [timestamps, setTimestamps] = useState<TaskCompletionTimestampMap>({});
    const statusSnapshotRef = useRef<Record<string, string>>({});

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

    useEffect(() => {
        if (!userId || !roadmaps?.length) return;

        let cancelled = false;

        (async () => {
            const stored = await readTaskCompletionTimestamps(userId);
            let didWrite = false;
            const nextSnapshot: Record<string, string> = {};

            for (const roadmap of roadmaps) {
                const phaseId = String(roadmap._id ?? '').trim();
                if (!phaseId) continue;

                for (const task of getTasks(roadmap)) {
                    if (!task?._id) continue;
                    const taskId = String(task._id);
                    const key = taskCompletionMapKey(phaseId, taskId);
                    const status = normalizeNestedTaskStatus(task.status);
                    nextSnapshot[key] = status;

                    const prev = statusSnapshotRef.current[key];
                    if (status === 'completed' && prev && prev !== 'completed') {
                        stored[key] = Date.now();
                        didWrite = true;
                    }
                }
            }

            statusSnapshotRef.current = nextSnapshot;

            if (cancelled) return;

            if (didWrite) {
                await AsyncStorage.setItem(
                    `${TASK_COMPLETION_STORAGE_PREFIX}:${userId}`,
                    JSON.stringify(stored),
                );
            }
            setTimestamps({ ...stored });
        })();

        return () => {
            cancelled = true;
        };
    }, [userId, roadmaps]);

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
