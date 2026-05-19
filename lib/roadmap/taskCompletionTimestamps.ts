import AsyncStorage from '@react-native-async-storage/async-storage';

export const TASK_COMPLETION_STORAGE_PREFIX = 'roadmap-task-completion-at-v1';

export type TaskCompletionTimestampMap = Record<string, number>;

function storageKey(userId: string): string {
    return `${TASK_COMPLETION_STORAGE_PREFIX}:${userId}`;
}

export function taskCompletionMapKey(phaseId: string, taskId: string): string {
    return `${phaseId}:${taskId}`;
}

export async function readTaskCompletionTimestamps(
    userId: string,
): Promise<TaskCompletionTimestampMap> {
    if (!userId) return {};
    try {
        const raw = await AsyncStorage.getItem(storageKey(userId));
        if (!raw) return {};
        const parsed = JSON.parse(raw) as TaskCompletionTimestampMap;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

export async function recordTaskCompletionTimestamp(
    userId: string,
    phaseId: string,
    taskId: string,
    completedAtMs: number = Date.now(),
): Promise<void> {
    if (!userId || !phaseId || !taskId) return;
    const map = await readTaskCompletionTimestamps(userId);
    const key = taskCompletionMapKey(phaseId, taskId);
    map[key] = completedAtMs;
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(map));
}
