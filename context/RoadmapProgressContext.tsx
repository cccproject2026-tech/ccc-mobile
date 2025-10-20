// context/RoadmapProgressContext.tsx - UPDATED FOR NEW SCHEMA
import { Status } from '@/lib/roadmap/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Progress data structure for each task
interface TaskProgress {
    status?: Status;
    formValues?: Record<string, any>; // All field values (text, checkbox, dropdown, etc.)
    attachments?: Record<string, FileAttachment[]>; // Files per field
    updatedAt: number;
}

interface FileAttachment {
    id: string;
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
}

// Overall progress state
type Progress = Record<string, TaskProgress>; // taskId -> progress

// Context interface
interface RoadmapProgressContextValue {
    progress: Progress;
    updateItem: (taskId: string, patch: Partial<TaskProgress>) => void;
    resetAll: () => void;
    resetTask: (taskId: string) => void;
}

const RoadmapProgressContext = createContext<RoadmapProgressContextValue | null>(null);

const STORAGE_KEY = 'roadmap-progress-v2'; // v2 for new schema

export function RoadmapProgressProvider({ children }: { children: React.ReactNode }) {
    const [progress, setProgress] = useState<Progress>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from AsyncStorage on mount
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const loaded = JSON.parse(raw);
                    setProgress(loaded);
                }
            } catch (error) {
                console.error('Failed to load progress:', error);
            } finally {
                setIsLoaded(true);
            }
        })();
    }, []);

    // Save to AsyncStorage with debounce
    useEffect(() => {
        if (!isLoaded) return; // Don't save until initial load is complete

        const timer = setTimeout(() => {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch(error => {
                console.error('Failed to save progress:', error);
            });
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [progress, isLoaded]);

    // Update task progress
    const updateItem = useCallback((taskId: string, patch: Partial<TaskProgress>) => {
        setProgress(prev => {
            const current = prev[taskId] || { updatedAt: 0 };

            // Merge updates
            const updated: TaskProgress = {
                ...current,
                ...patch,
                updatedAt: Date.now(),
            };

            // Merge formValues if provided
            if (patch.formValues) {
                updated.formValues = {
                    ...(current.formValues || {}),
                    ...patch.formValues,
                };
            }

            // Merge attachments if provided
            if (patch.attachments) {
                updated.attachments = {
                    ...(current.attachments || {}),
                    ...patch.attachments,
                };
            }

            return {
                ...prev,
                [taskId]: updated,
            };
        });
    }, []);

    // Reset all progress
    const resetAll = useCallback(() => {
        setProgress({});
        AsyncStorage.removeItem(STORAGE_KEY).catch(error => {
            console.error('Failed to clear progress:', error);
        });
    }, []);

    // Reset single task
    const resetTask = useCallback((taskId: string) => {
        setProgress(prev => {
            const { [taskId]: _, ...rest } = prev;
            return rest;
        });
    }, []);

    const value = useMemo(
        () => ({
            progress,
            updateItem,
            resetAll,
            resetTask,
        }),
        [progress, updateItem, resetAll, resetTask]
    );

    return (
        <RoadmapProgressContext.Provider value={value}>
            {children}
        </RoadmapProgressContext.Provider>
    );
}

// Hook to use context
export function useRoadmapProgress() {
    const ctx = useContext(RoadmapProgressContext);
    if (!ctx) {
        throw new Error('useRoadmapProgress must be used within RoadmapProgressProvider');
    }
    return ctx;
}

// Helper hooks for common operations
export function useTaskProgress(taskId: string) {
    const { progress, updateItem } = useRoadmapProgress();

    const taskProgress = progress[taskId];

    const updateField = useCallback(
        (fieldId: string, value: any) => {
            updateItem(taskId, {
                formValues: { [fieldId]: value },
                status: 'IN_PROGRESS',
            });
        },
        [taskId, updateItem]
    );

    const updateAttachment = useCallback(
        (fieldId: string, files: FileAttachment[]) => {
            updateItem(taskId, {
                attachments: { [fieldId]: files },
            });
        },
        [taskId, updateItem]
    );

    const completeTask = useCallback(() => {
        updateItem(taskId, { status: 'COMPLETED' });
    }, [taskId, updateItem]);

    return {
        taskProgress,
        updateField,
        updateAttachment,
        completeTask,
    };
}
