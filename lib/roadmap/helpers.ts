// lib/roadmap/helpers.ts
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

/**
 * Calculate completion stats
 * Uses the actual status from progress data
 */
export function getCompletionStats(roadmap: Roadmap): { completed: number; total: number } {
    const tasks = getTasks(roadmap);
    const total = tasks.length;
    const completed = tasks.filter(task => task && task.status === 'completed').length;
    console.log("completed:----->>>>>>>>>>>>>>getCompletionStats", completed, total);
    return { completed, total };
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
