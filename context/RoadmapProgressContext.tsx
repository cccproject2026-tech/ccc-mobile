import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ProgressItem = {
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
    notes?: string;
    formValues?: Record<string, any>;
    attachments?: { id: string; uri: string; name: string }[];
    checklist?: Record<string, boolean>;
    updatedAt: number;
    signedAt?: string;
};
type Progress = Record<string, ProgressItem>;

type Ctx = {
    progress: Progress;
    updateItem: (itemId: string, patch: Partial<ProgressItem>) => void;
    toggleChecklist: (itemId: string, cid: string) => void;
    resetAll: () => void;
};

const RoadmapProgressContext = createContext<Ctx | null>(null);

export function RoadmapProgressProvider({ children }: { children: React.ReactNode }) {
    const [progress, setProgress] = useState<Progress>({});

    // load once
    useEffect(() => {
        (async () => {
            const raw = await AsyncStorage.getItem('roadmap-progress');
            if (raw) setProgress(JSON.parse(raw));
        })();
    }, []);

    // persist on change (debounced)
    useEffect(() => {
        const id = setTimeout(() => AsyncStorage.setItem('roadmap-progress', JSON.stringify(progress)), 250);
        return () => clearTimeout(id);
    }, [progress]);

    const updateItem = useCallback((itemId: string, patch: Partial<ProgressItem>) => {
        setProgress(prev => {
            const curr = prev[itemId] || { updatedAt: 0 };
            return { ...prev, [itemId]: { ...curr, ...patch, updatedAt: Date.now() } };
        });
    }, []);

    const toggleChecklist = useCallback((itemId: string, cid: string) => {
        setProgress(prev => {
            const curr = prev[itemId] || { updatedAt: 0 };
            const map = { ...(curr.checklist || {}) };
            map[cid] = !map[cid];
            return { ...prev, [itemId]: { ...curr, checklist: map, updatedAt: Date.now() } };
        });
    }, []);

    const resetAll = useCallback(() => setProgress({}), []);

    const value = useMemo(() => ({ progress, updateItem, toggleChecklist, resetAll }), [progress, updateItem, toggleChecklist, resetAll]);

    return <RoadmapProgressContext.Provider value={value}>{children}</RoadmapProgressContext.Provider>;
}

export function useRoadmapProgress() {
    const ctx = useContext(RoadmapProgressContext);
    if (!ctx) throw new Error('useRoadmapProgress must be used within RoadmapProgressProvider');
    return ctx;
}
