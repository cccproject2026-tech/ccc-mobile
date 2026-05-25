import type { NestedRoadmap, Roadmap } from "./types";

const RESUBMITTED_STATUSES = new Set([
    "resubmitted",
    "re_submitted",
    "re-submitted",
    "needs_review_again",
    "needs-review-again",
]);

export function isResubmittedTask(task: NestedRoadmap | null | undefined): boolean {
    if (!task) return false;
    if (task.isResubmitted) return true;
    const status = String(task.status ?? "").toLowerCase().replace(/\s+/g, "_");
    return RESUBMITTED_STATUSES.has(status);
}

export type TaskDisplayStatus =
    | "not-started"
    | "in-progress"
    | "completed"
    | "due"
    | "resubmitted";

export function getTaskDisplayStatus(task: NestedRoadmap | null | undefined): TaskDisplayStatus {
    if (!task) return "not-started";
    if (isResubmittedTask(task)) return "resubmitted";
    const raw = String(task.status ?? "").toLowerCase();
    if (raw === "completed") return "completed";
    if (raw === "in-progress") return "in-progress";
    if (raw === "blocked") return "due";
    return "not-started";
}

export interface StatusBadgeStyle {
    bg: string;
    accent: string;
    text: string;
    label: string;
}

const STATUS_BADGE_MAP: Record<TaskDisplayStatus, StatusBadgeStyle> = {
    "not-started": {
        bg: "rgba(56, 189, 248, 0.16)",
        accent: "rgba(56, 189, 248, 0.45)",
        text: "#fff",
        label: "Not Started",
    },
    "in-progress": {
        bg: "rgba(59, 130, 246, 0.18)",
        accent: "rgba(59, 130, 246, 0.55)",
        text: "#fff",
        label: "In Progress",
    },
    completed: {
        bg: "rgba(34, 197, 94, 0.18)",
        accent: "rgba(34, 197, 94, 0.55)",
        text: "#fff",
        label: "Completed",
    },
    due: {
        bg: "rgba(250, 204, 21, 0.20)",
        accent: "rgba(250, 204, 21, 0.55)",
        text: "#fff",
        label: "Due",
    },
    resubmitted: {
        bg: "rgba(251, 146, 60, 0.20)",
        accent: "rgba(251, 146, 60, 0.55)",
        text: "#fff",
        label: "Resubmitted",
    },
};

export function getStatusBadgeColor(status: TaskDisplayStatus): StatusBadgeStyle {
    return STATUS_BADGE_MAP[status] ?? STATUS_BADGE_MAP["not-started"];
}

export function countResubmittedTasks(roadmap: Roadmap | null | undefined): number {
    if (!roadmap?.roadmaps) return 0;
    return roadmap.roadmaps.filter(isResubmittedTask).length;
}

export function filterResubmittedTasks(tasks: NestedRoadmap[]): NestedRoadmap[] {
    return tasks.filter(isResubmittedTask);
}
