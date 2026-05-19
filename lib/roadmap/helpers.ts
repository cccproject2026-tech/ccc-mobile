// lib/roadmap/helpers.ts
import { API_CONFIG } from '@/constants/config/api';
import { taskCompletionMapKey } from '@/lib/roadmap/taskCompletionTimestamps';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { Extra, NestedRoadmap, Roadmap, RoadmapCardStatus } from './types';

const FORM_EXTRA_TYPES = new Set<Extra['type']>([
    'TEXT_AREA',
    'TEXT_DISPLAY',
    'CHECKBOX',
    'TEXT_FIELD',
    'DATE_PICKER',
    'SECTION',
    'UPLOAD',
    'BUTTON',
    'ASSESSMENT',
    'SIGNATURE',
]);

function extraNameKey(name: unknown): string {
    return String(name ?? '').trim().toLowerCase();
}

function dedupeExtrasByName(extras: Extra[]): Extra[] {
    const seen = new Set<string>();
    const out: Extra[] = [];
    for (const extra of extras) {
        const key = extraNameKey(extra?.name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(extra);
    }
    return out;
}

/** Build form field definitions from a prior save when the roadmap payload omits extras. */
export function extrasFromSavedItems(savedItems?: any[] | null): Extra[] {
    if (!Array.isArray(savedItems)) return [];

    const out: Extra[] = [];
    for (const item of savedItems) {
        if (!item?.name || item.type === 'JUMPSTART_COMPLETE') continue;
        const type = String(item.type ?? 'TEXT_FIELD') as Extra['type'];
        if (!FORM_EXTRA_TYPES.has(type)) continue;
        out.push({
            type,
            name: item.name,
            placeHolder: item.placeHolder,
            buttonName: item.buttonName,
            haveButton: item.haveButton,
            date: item.date,
            checkboxes: item.checkboxes,
            sections: item.sections,
            assessmentId: item.assessmentId,
            linkUrl: item.linkUrl,
            editable: item.editable !== false,
        });
    }
    return dedupeExtrasByName(out);
}

/**
 * Field templates for the active task only — not every sibling nested roadmap.
 */
export function collectDefinitionExtras(
    task?: NestedRoadmap | null,
    roadmap?: Roadmap | null,
): Extra[] {
    if (Array.isArray(task?.extras) && task.extras.length > 0) {
        return dedupeExtrasByName(task.extras);
    }
    if (Array.isArray(roadmap?.extras) && roadmap.extras.length > 0) {
        return dedupeExtrasByName(roadmap.extras);
    }
    const firstNested = roadmap?.roadmaps?.[0];
    if (firstNested?.extras?.length) {
        return dedupeExtrasByName(firstNested.extras);
    }
    return [];
}

/**
 * Form definitions may live on the nested task, parent roadmap, any sibling nested task,
 * or only in previously saved extras (common for Jumpstart).
 */
export function getEffectiveTaskExtras(
    task: NestedRoadmap | undefined | null,
    roadmap?: Roadmap | null,
    savedItems?: any[] | null,
): Extra[] {
    const fromDefinitions = collectDefinitionExtras(task, roadmap);
    if (fromDefinitions.length > 0) return fromDefinitions;
    return extrasFromSavedItems(savedItems);
}

/** Last saved value per field name (ignores duplicate rows from repeated saves). */
export function savedExtrasToFormValues(savedItems?: any[] | null): Record<string, any> {
    const values: Record<string, any> = {};
    if (!Array.isArray(savedItems)) return values;

    for (const item of savedItems) {
        if (!item?.name || item.type === 'JUMPSTART_COMPLETE') continue;
        const key = extraNameKey(item.name);
        if (!key) continue;
        if (item.type === 'SIGNATURE' && item.signatureData != null) {
            values[item.name] = item.signatureData;
        } else if (item.value !== undefined) {
            values[item.name] = item.value;
        }
    }
    return values;
}

/** Resolve the task row for the detail screen (handles single-roadmap / missing nested edge cases). */
export function resolveRoadmapDetailTask(
    roadmap: Roadmap | undefined | null,
    itemId?: string,
): NestedRoadmap | undefined {
    if (!roadmap) return undefined;

    const nested = (roadmap.roadmaps ?? []).filter(Boolean);
    if (itemId) {
        const match = nested.find((t) => String(t._id) === String(itemId));
        if (match) return match;
    }
    if (nested.length === 1) return nested[0];
    if (nested.length === 0 && collectDefinitionExtras(undefined, roadmap).length > 0) {
        return {
            _id: String(itemId || roadmap._id),
            name: roadmap.name,
            roadMapDetails: roadmap.roadMapDetails,
            description: roadmap.description,
            status: roadmap.status,
            duration: roadmap.duration,
            imageUrl: roadmap.imageUrl,
            meetings: roadmap.meetings ?? [],
            startDate: roadmap.startDate,
            endDate: roadmap.endDate,
            completedOn: roadmap.completedOn,
            phase: roadmap.phase,
            totalSteps: roadmap.totalSteps,
            extras: roadmap.extras ?? [],
        };
    }
    return undefined;
}

/**
 * Get status for card display
 * Note: Status is now properly set from progress data via useRoadmaps hook
 */
export function getCardStatus(roadmap: Roadmap | NestedRoadmap | undefined | null): RoadmapCardStatus {
    if (!roadmap) return 'initial';
    
    const statusMap: Record<string, RoadmapCardStatus> = {
        'not started': 'initial',
        'in-progress': 'in-progress',
        'completed': 'completed',
        'blocked': 'due',
    };

    // Check if roadmap is overdue (only for non-completed items)
    if ('endDate' in roadmap && roadmap.endDate && roadmap.status !== 'completed') {
        const endDate = new Date(roadmap.endDate);
        const now = new Date();

        if (endDate < now) {
            return 'due';
        }
    }

    return statusMap[roadmap.status] || 'initial';
}

/**
 * Get all tasks for a roadmap (nested roadmaps)
 */
export function getTasks(roadmap: Roadmap): NestedRoadmap[] {
    return (roadmap?.roadmaps || []).filter(task => task != null);
}

/**
 * Get tasks grouped by division/phase
 */
export function getTasksByDivision(roadmap: Roadmap): Record<string, NestedRoadmap[]> {
    const grouped: Record<string, NestedRoadmap[]> = {};

    roadmap?.roadmaps?.forEach(task => {
        if (!task) return;
        const division = task.phase || 'Uncategorized';
        if (!grouped[division]) {
            grouped[division] = [];
        }
        grouped[division].push(task);
    });

    return grouped;
}

/** API / merge may send status variants; use for counts and pastor focus lists. */
export function normalizeNestedTaskStatus(
    status: string | undefined | null,
): NestedRoadmap['status'] {
    const raw = String(status ?? '')
        .toLowerCase()
        .replace(/_/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    if (raw === 'in-progress' || raw === 'in progress') return 'in-progress';
    if (raw === 'not-started' || raw === 'not started' || raw === 'pending')
        return 'not started';
    if (raw === 'completed' || raw === 'complete' || raw === 'done')
        return 'completed';
    if (raw === 'blocked') return 'blocked';
    return 'not started';
}

/**
 * Calculate completion stats (uses normalized task status from merged progress).
 */
export function getCompletionStats(roadmap: Roadmap): { completed: number; total: number } {
    const tasks = getTasks(roadmap);
    const total = tasks.length;
    const completed = tasks.filter(
        (task) => task && normalizeNestedTaskStatus(task.status) === 'completed',
    ).length;
    return { completed, total };
}

/** First incomplete nested task in roadmap order (matches pastor roadmap tab). */
export function getNextIncompleteNestedTaskId(
    roadmap: Roadmap | undefined | null,
): string | null {
    if (!roadmap) return null;
    for (const t of getTasks(roadmap)) {
        if (!t) continue;
        if (normalizeNestedTaskStatus(t.status) !== 'completed') {
            return String(t._id);
        }
    }
    return null;
}

export function getNestedTaskTitleById(
    roadmap: Roadmap | undefined | null,
    taskId: string | null,
): string {
    if (!roadmap || !taskId) return 'Next task';
    const found = getTasks(roadmap).find((t) => t && String(t._id) === String(taskId));
    const name = found?.name?.trim();
    return name && name.length > 0 ? name : 'Next task';
}

/** Sort bucket: 0 = in progress, 1 = not started / no tasks, 2 = completed. */
export function getPastorPhaseSortGroup(roadmap: Roadmap): 0 | 1 | 2 {
    const { completed, total } = getCompletionStats(roadmap);
    const hasTasks = total > 0;
    if (!hasTasks) return 1;
    if (completed === total) return 2;
    if (completed > 0) return 0;
    const hasActiveWork = getTasks(roadmap).some((t) => {
        const s = normalizeNestedTaskStatus(t?.status);
        return s === 'in-progress' || s === 'blocked';
    });
    return hasActiveWork ? 0 : 1;
}

/** Phases that belong in pastor home "In Progress Roadmaps" (same rules as roadmap tab focus). */
export function isPastorPhaseInFocus(roadmap: Roadmap): boolean {
    return getPastorPhaseSortGroup(roadmap) === 0;
}

function toEpochMsForSort(dateString?: string): number {
    if (!dateString) return 0;
    const parsed = Date.parse(dateString);
    return Number.isNaN(parsed) ? 0 : parsed;
}

export function comparePastorPhasesForFocus(a: Roadmap, b: Roadmap): number {
    const ga = getPastorPhaseSortGroup(a);
    const gb = getPastorPhaseSortGroup(b);
    if (ga !== gb) return ga - gb;
    const timeDelta = toEpochMsForSort(b.updatedAt) - toEpochMsForSort(a.updatedAt);
    if (timeDelta !== 0) return timeDelta;
    return String(a?._id ?? '').localeCompare(String(b?._id ?? ''));
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(roadmap: Roadmap): number {
    const { completed, total } = getCompletionStats(roadmap);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
}

/**
 * Check if roadmap is single task
 */
export function isSingleTask(roadmap: Roadmap): boolean {
    return !roadmap?.haveNextedRoadMaps || !roadmap?.roadmaps || roadmap.roadmaps.length === 0;
}

/**
 * Get phase number from phase string
 * e.g., "Phase 1" -> 1
 */
export function getPhaseNumber(phaseString: string): number | undefined {
    if (!phaseString) return undefined;

    const match = phaseString.match(/\d+/);
    return match ? parseInt(match[0], 10) : undefined;
}

/**
 * Parse duration to months
 * Handles formats like: "1 month", "2-3 months", "4 weeks"
 */
export function parseDurationMonths(duration: string): { min: number; max: number } {
    console.log("duration:----->>>>>>>>>>>>>>parseDurationMonths", duration);
    if (!duration) return { min: 1, max: 1 };

    // Match numbers, optionally separated by hyphen/dash, optionally followed by unit
    // Handles: "10-12", "1 month", "2-3 months", "4 weeks"
    const match = duration.match(/(\d+)(?:\s*[-–]\s*(\d+))?(?:\s*(month|week))?/i);
    console.log("match:----->>>>>>>>>>>>>>parseDurationMonths", match);
    if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        const unit = match[3] ? match[3].toLowerCase() : 'month'; // Default to month if no unit

        if (unit.startsWith('week')) {
            return { min: Math.ceil(min / 4), max: Math.ceil(max / 4) };
        }

        return { min, max };
    }

    return { min: 1, max: 1 };
}

/**
 * Format duration string for display
 */
export function formatDuration(duration: string): string {
    const { min, max } = parseDurationMonths(duration);

    if (min === max) {
        return `${min} ${min === 1 ? 'month' : 'months'}`;
    }

    return `${min}-${max} months`;
}

/**
 * Check if a roadmap/task is overdue
 */
export function isOverdue(roadmap: Roadmap | NestedRoadmap): boolean {
    if (!('endDate' in roadmap) || !roadmap.endDate || roadmap.status === 'completed') {
        return false;
    }

    const endDate = new Date(roadmap.endDate);
    const now = new Date();

    return endDate < now;
}

/**
 * Get days remaining until due date
 */
export function getDaysRemaining(endDate: string): number | null {
    if (!endDate) return null;

    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/** Absolute URL for roadmap upload files (API often returns relative paths). */
export function resolveRoadmapDocumentUrl(fileUrl?: string | null): string {
    const raw = String(fileUrl ?? '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const origin = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/i, '');
    if (raw.startsWith('/')) return `${origin}${raw}`;
    return `${origin}/${raw}`;
}

/** Display label for upload field names on shared media (avoid huge raw form keys). */
export function formatRoadmapUploadFieldLabel(extraName?: string | null): string {
    const trimmed = String(extraName ?? '').trim();
    if (!trimmed) return 'Uploaded media';
    if (/^upload\s*media$/i.test(trimmed)) return 'Uploaded media';
    return trimmed.replace(/_/g, ' ');
}

/** Flattened completed nested task for pastor review lists (frontend-only). */
export type PastorCompletedTaskItem = {
    id: string;
    taskId: string;
    phaseId: string;
    taskTitle: string;
    phaseTitle: string;
    completedOnMs: number;
    duration?: string;
    /** Source nested task for shared RoadmapCard UI. */
    task: NestedRoadmap;
};

export function parseRoadmapTimestampMs(value: unknown): number {
    if (value == null || value === '') return 0;
    const ms = new Date(String(value)).getTime();
    return Number.isFinite(ms) ? ms : 0;
}

/** Ignore template/parent dates that are not real task completion times. */
function resolveCompletedTaskTimestampMs(
    task: NestedRoadmap,
    phaseId: string,
    roadmap: Roadmap,
    localCompletionMs?: Record<string, number>,
): number {
    const mapKey = taskCompletionMapKey(phaseId, String(task._id ?? ''));
    const localMs = localCompletionMs?.[mapKey];
    if (localMs && localMs > 0) return localMs;

    const parentUpdatedMs = parseRoadmapTimestampMs(roadmap.updatedAt);
    const parentCreatedMs = parseRoadmapTimestampMs(roadmap.createdAt);

    const taskCompletedMs = parseRoadmapTimestampMs(task.completedOn);
    if (taskCompletedMs > 0) {
        const differsFromParent =
            (parentUpdatedMs > 0 && Math.abs(taskCompletedMs - parentUpdatedMs) > 60_000) &&
            (parentCreatedMs <= 0 || Math.abs(taskCompletedMs - parentCreatedMs) > 60_000);
        if (differsFromParent || parentUpdatedMs <= 0) {
            return taskCompletedMs;
        }
    }

    const taskUpdatedMs = parseRoadmapTimestampMs(
        (task as NestedRoadmap & { updatedAt?: string }).updatedAt,
    );
    if (taskUpdatedMs > 0 && parentUpdatedMs > 0 && Math.abs(taskUpdatedMs - parentUpdatedMs) > 60_000) {
        return taskUpdatedMs;
    }

    return 0;
}

/**
 * All completed nested tasks across pastor roadmaps, newest first.
 * Prefer locally recorded completion time (save / status transition), not parent roadmap updatedAt.
 */
export function flattenPastorCompletedTasks(
    roadmaps: Roadmap[] | undefined | null,
    localCompletionMs?: Record<string, number>,
): PastorCompletedTaskItem[] {
    if (!roadmaps?.length) return [];

    const items: PastorCompletedTaskItem[] = [];

    for (const roadmap of roadmaps) {
        const phaseId = String(roadmap._id ?? '').trim();
        if (!phaseId) continue;

        const phaseTitle =
            String(roadmap.name ?? roadmap.phase ?? '').trim() || 'Roadmap phase';

        for (const task of getTasks(roadmap)) {
            if (!task || normalizeNestedTaskStatus(task.status) !== 'completed') continue;

            const taskId = String(task._id ?? '').trim();
            if (!taskId) continue;

            const taskTitle =
                String(task.name ?? task.roadMapDetails ?? '').trim() || 'Completed task';
            const completedOnMs = resolveCompletedTaskTimestampMs(
                task,
                phaseId,
                roadmap,
                localCompletionMs,
            );

            items.push({
                id: `${phaseId}:${taskId}`,
                taskId,
                phaseId,
                taskTitle,
                phaseTitle,
                completedOnMs,
                duration: task.duration ? String(task.duration) : undefined,
                task,
            });
        }
    }

    items.sort((a, b) => {
        if (b.completedOnMs !== a.completedOnMs) return b.completedOnMs - a.completedOnMs;
        return a.taskTitle.localeCompare(b.taskTitle);
    });

    return items;
}

export type PastorCompletedJourneyTab = {
    key: string;
    label: string;
    count: number;
};

/** Tabs for filtering completed tasks by parent roadmap (All + each journey with completions). */
export function buildPastorCompletedJourneyTabs(
    items: PastorCompletedTaskItem[],
    roadmaps: Roadmap[] | undefined | null,
): PastorCompletedJourneyTab[] {
    const tabs: PastorCompletedJourneyTab[] = [
        { key: 'all', label: 'All', count: items.length },
    ];
    if (!items.length) return tabs;

    const countByPhase = new Map<string, number>();
    for (const item of items) {
        countByPhase.set(item.phaseId, (countByPhase.get(item.phaseId) ?? 0) + 1);
    }

    const roadmapById = new Map<string, Roadmap>();
    for (const roadmap of roadmaps ?? []) {
        const id = String(roadmap._id ?? '').trim();
        if (id) roadmapById.set(id, roadmap);
    }

    const phaseIds = [...countByPhase.keys()];
    phaseIds.sort((a, b) => {
        const ra = roadmapById.get(a);
        const rb = roadmapById.get(b);
        if (ra && rb) return comparePastorPhasesForFocus(ra, rb);
        return a.localeCompare(b);
    });

    for (const phaseId of phaseIds) {
        const count = countByPhase.get(phaseId) ?? 0;
        if (count <= 0) continue;

        const roadmap = roadmapById.get(phaseId);
        const rawName = String(roadmap?.name ?? roadmap?.phase ?? '').trim();
        const label =
            rawName.replace(/\s+Phase$/i, '').trim() || rawName || 'Roadmap';

        tabs.push({ key: phaseId, label, count });
    }

    return tabs;
}

/** Friendly relative label for completed-task review cards; omit when no date. */
export function formatPastorCompletedRelativeLabel(completedOnMs: number): string | null {
    if (!completedOnMs) return null;

    const completedDay = startOfDay(new Date(completedOnMs));
    const today = startOfDay(new Date());
    const days = differenceInCalendarDays(today, completedDay);
    if (days < 0) return null;
    if (days === 0) return 'Completed today';
    if (days === 1) return 'Completed yesterday';
    if (days <= 14) return `Completed ${days} days ago`;
    return `Completed ${formatDate(new Date(completedOnMs).toISOString())}`;
}
