import { roadmapService } from "@/services/roadmap.service";
import { getTasks } from "@/lib/roadmap/helpers";
import type { NestedRoadmap, Roadmap } from "@/lib/roadmap/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ResubmittedEntry = {
    task: NestedRoadmap;
    phaseId: string;
    phaseTitle: string;
    resubmittedAt: string;
};

/**
 * Detects resubmitted tasks by comparing each task's extras
 * `updatedAt` vs `createdAt`. A task is "resubmitted" when a pastor
 * updates saved extras after the initial submission (updatedAt > createdAt).
 *
 * Only fetches extras for tasks that already have saved data (status !== "not started").
 */
export function useResubmittedTasks(
    roadmaps: Roadmap[] | undefined | null,
    pastorId: string | undefined,
) {
    const [entries, setEntries] = useState<ResubmittedEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const lastKeyRef = useRef("");

    const candidateTasks = useMemo(() => {
        if (!roadmaps?.length || !pastorId) return [];
        const list: { task: NestedRoadmap; phaseId: string; phaseTitle: string }[] = [];
        for (const r of roadmaps) {
            const phaseId = r._id;
            const phaseTitle = r.name || "Untitled";
            for (const t of getTasks(r)) {
                const status = String(t.status ?? "").toLowerCase();
                if (status === "completed" || status === "in-progress") {
                    list.push({ task: t, phaseId, phaseTitle });
                }
            }
        }
        return list;
    }, [roadmaps, pastorId]);

    const cacheKey = useMemo(() => {
        if (!pastorId || !candidateTasks.length) return "";
        const ids = candidateTasks.map((c) => c.task._id).sort().join(",");
        return `${pastorId}:${ids}`;
    }, [pastorId, candidateTasks]);

    const check = useCallback(async () => {
        if (!pastorId || !candidateTasks.length) {
            setEntries([]);
            return;
        }

        setIsLoading(true);
        try {
            const results: ResubmittedEntry[] = [];
            await Promise.all(
                candidateTasks.map(async ({ task, phaseId, phaseTitle }) => {
                    try {
                        const extras = await roadmapService.getRoadmapExtras(
                            phaseId,
                            task._id,
                            pastorId,
                        );
                        if (!extras) return;

                        const created = new Date(extras.createdAt).getTime();
                        const updated = new Date(extras.updatedAt).getTime();
                        const FIVE_SECONDS = 5_000;
                        if (updated - created > FIVE_SECONDS) {
                            results.push({
                                task,
                                phaseId,
                                phaseTitle,
                                resubmittedAt: new Date(extras.updatedAt).toISOString(),
                            });
                        }
                    } catch {
                        // Task may not have extras saved yet — ignore
                    }
                }),
            );
            setEntries(results);
        } finally {
            setIsLoading(false);
        }
    }, [pastorId, candidateTasks]);

    useEffect(() => {
        if (cacheKey === lastKeyRef.current) return;
        lastKeyRef.current = cacheKey;
        check();
    }, [cacheKey, check]);

    const reload = useCallback(() => {
        lastKeyRef.current = "";
        check();
    }, [check]);

    return { resubmittedTasks: entries, isLoadingResubmitted: isLoading, reloadResubmitted: reload };
}
