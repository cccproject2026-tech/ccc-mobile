import { roadmapService } from "@/services/roadmap.service";
import { getTasks } from "@/lib/roadmap/helpers";
import type { NestedRoadmap, Roadmap, TaskSubmission } from "@/lib/roadmap/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ResubmittedEntry = {
    task: NestedRoadmap;
    phaseId: string;
    phaseTitle: string;
    resubmittedAt: string;
    submissionCount: number;
    latestSubmission?: TaskSubmission;
};

/**
 * Detects resubmitted tasks by checking if a task has more than one submission record.
 * Replaces the old unreliable updatedAt > createdAt timestamp comparison.
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
                        const submissions = await roadmapService.getTaskSubmissions(
                            phaseId,
                            task._id,
                            pastorId,
                        );

                        if (submissions.length > 1) {
                            const latest = submissions.reduce((a, b) =>
                                b.submissionNumber > a.submissionNumber ? b : a,
                            );
                            results.push({
                                task,
                                phaseId,
                                phaseTitle,
                                resubmittedAt: latest.submittedAt,
                                submissionCount: submissions.length,
                                latestSubmission: latest,
                            });
                        }
                    } catch {
                        // Task may not have submissions yet — ignore
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
