import { useMemo } from "react";
import type { Roadmap, NestedRoadmap } from "@/lib/roadmap/types";
import {
    formatDisplayDate,
    getRelativeDueDate,
    type RelativeDueDate,
} from "@/utils/date";

export interface RoadmapMetaInfo {
    hasAssignedBy: boolean;
    assignedByName: string;
    assignedOnLabel: string;
    dueDateLabel: string;
    dueDateStatus: RelativeDueDate;
    completionTime: string | null;
    hasMetadata: boolean;
    isMultiTask: boolean;
}

function resolveAssignedByName(
    assignedBy: Roadmap["assignedBy"],
): string {
    if (!assignedBy) return "";
    if (typeof assignedBy === "string") return assignedBy;
    const first = assignedBy.firstName?.trim() ?? "";
    const last = assignedBy.lastName?.trim() ?? "";
    return `${first} ${last}`.trim();
}

export function useRoadmapMeta(
    roadmap: Roadmap | null | undefined,
    task?: NestedRoadmap | null,
): RoadmapMetaInfo {
    return useMemo(() => {
        const assignedByRaw = resolveAssignedByName(roadmap?.assignedBy);
        const hasAssignedBy = assignedByRaw.length > 0;
        const assignedByName = hasAssignedBy ? assignedByRaw : "Not assigned";

        const assignedOnDate = roadmap?.assignedAt ?? roadmap?.createdAt;
        const assignedOnLabel = formatDisplayDate(assignedOnDate, "\u2014");

        const isCompleted =
            String(task?.status ?? roadmap?.status ?? "").toLowerCase() === "completed";

        const effectiveDueDate =
            task?.dueDate ?? roadmap?.dueDate ?? task?.endDate ?? roadmap?.endDate;
        const dueDateStatus = getRelativeDueDate(effectiveDueDate, isCompleted);
        const dueDateLabel = dueDateStatus.label;

        const duration = (task as any)?.duration ?? roadmap?.duration;
        const completionTime = duration ? String(duration) : null;

        const isMultiTask =
            Array.isArray(roadmap?.roadmaps) && roadmap.roadmaps.length > 1;

        const hasMetadata = !!(roadmap);

        return {
            hasAssignedBy,
            assignedByName,
            assignedOnLabel,
            dueDateLabel,
            dueDateStatus,
            completionTime,
            hasMetadata,
            isMultiTask,
        };
    }, [roadmap, task]);
}
