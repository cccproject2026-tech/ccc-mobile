
import { API_CONFIG } from '@/constants/config/api';
import { taskCompletionMapKey } from '@/lib/roadmap/taskCompletionTimestamps';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import type { Extra } from './types';
import {
    EXTRA_FIELD_KEY_SEP,
    mapSavedExtrasToFormValues,
} from './extraFieldKeys';

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

/** True when every task extra is an ASSESSMENT link (completion is owned by backend progress). */
export function isAssessmentOnlyTask(extras: Extra[]): boolean {
    return extras.length > 0 && extras.every((extra) => extra.type === 'ASSESSMENT');
}

/** Normalize API ids that may arrive as strings or populated objects. */
export function normalizeMongoId(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('{')) {
            try {
                return normalizeMongoId(JSON.parse(trimmed));
            } catch {
                return trimmed;
            }
        }
        return trimmed;
    }
    if (typeof value === 'object') {
        const obj = value as { _id?: unknown; $oid?: unknown; id?: unknown };
        if (typeof obj._id === 'string') return obj._id.trim();
        if (typeof obj.$oid === 'string') return obj.$oid.trim();
        if (typeof obj.id === 'string') return obj.id.trim();
        if (obj._id != null) return normalizeMongoId(obj._id);
        if (obj.id != null) return normalizeMongoId(obj.id);
    }
    return String(value).trim();
}

/** Normalize ids from expo-router search params (string | string[] | object). */
export function resolveRouteParamId(value: unknown): string {
    const raw = Array.isArray(value) ? value[0] : value;
    return normalizeMongoId(raw);
}

export type AssessmentAnswerSectionSlice = {
    sectionId?: string;
    layers?: unknown[];
    recommendations?: string[];
};

/** Pastor all sections answered → submitted; any mentor CDP → completed (matches backend). */
export function deriveAssessmentTaskStatusFromAnswers(
    sections: AssessmentAnswerSectionSlice[] | undefined | null,
    expectedSectionCount?: number,
): 'submitted' | 'completed' | null {
    if (!sections?.length) return null;

    const hasAnyCdp = sections.some(
        (s) => Array.isArray(s.recommendations) && s.recommendations.length > 0,
    );
    if (hasAnyCdp) return 'completed';

    const expected =
        typeof expectedSectionCount === 'number' && expectedSectionCount > 0
            ? expectedSectionCount
            : sections.length;

    const sectionsWithAnswers = sections.filter(
        (s) => Array.isArray(s.layers) && s.layers.length > 0,
    );
    if (sectionsWithAnswers.length < expected) return null;

    return 'submitted';
}

/**
 * When progress lags, derive submitted/completed from assessment answers (source of truth for CDP).
 */
export function applyAssessmentAnswerStatusOverlay(
    roadmap: Roadmap,
    answersByAssessmentId: Record<string, AssessmentAnswerSectionSlice[] | undefined>,
): Roadmap {
    if (!roadmap.roadmaps?.length) return roadmap;

    let changed = false;
    const roadmaps = roadmap.roadmaps.map((task) => {
        if (!task?._id) return task;

        const current = normalizeNestedTaskStatus(task.status);
        if (current === 'completed') return task;

        const defExtras = collectDefinitionExtras(task, roadmap);
        if (!isAssessmentOnlyTask(defExtras)) return task;

        const assessmentId = normalizeMongoId(defExtras[0]?.assessmentId);
        if (!assessmentId) return task;

        const derived = deriveAssessmentTaskStatusFromAnswers(
            answersByAssessmentId[assessmentId],
        );
        if (!derived || current === derived) return task;

        changed = true;
        return { ...task, status: derived };
    });

    if (!changed) return roadmap;

    const withTasks = { ...roadmap, roadmaps };
    const { completed, total } = getCompletionStats(withTasks);
    let status = roadmap.status;
    if (total > 0 && completed >= total) {
        status = 'completed';
    } else if (completed > 0 || roadmaps.some((t) => normalizeNestedTaskStatus(t?.status) === 'submitted')) {
        status = 'in-progress';
    }
    return { ...withTasks, status };
}

/** Backend writes this marker on roadmap extras when CDP fully completes an assessment task. */
export function isSystemAssessmentCompletionExtra(extra: unknown): boolean {
    if (!extra || typeof extra !== 'object') return false;
    const item = extra as { type?: string; trigger?: string; completedBy?: string };
    return (
        item.type === 'ASSESSMENT' &&
        (item.trigger === 'mentor_cdp_complete' || item.completedBy === 'system')
    );
}

/**
 * Overlay task completion from saved roadmap extras (backend-written after CDP).
 * Used when progress nested steps lag behind extras completion.
 */
export function applyBackendAssessmentCompletionFromExtras(
    roadmap: Roadmap,
    extrasByTaskId: Record<string, { extras?: unknown[] } | undefined>,
): Roadmap {
    if (!roadmap.roadmaps?.length) return roadmap;

    let changed = false;
    const roadmaps = roadmap.roadmaps.map((task) => {
        if (!task?._id) return task;
        if (normalizeNestedTaskStatus(task.status) === 'completed') return task;

        const defExtras = collectDefinitionExtras(task, roadmap);
        if (!isAssessmentOnlyTask(defExtras)) return task;

        const assessmentIds = defExtras
            .map((e) => normalizeMongoId(e.assessmentId))
            .filter(Boolean);
        if (assessmentIds.length === 0) return task;

        const saved = extrasByTaskId[normalizeMongoId(task._id)]?.extras ?? [];
        const systemCompletedIds = new Set(
            saved
                .filter(isSystemAssessmentCompletionExtra)
                .map((e) => normalizeMongoId((e as { assessmentId?: unknown }).assessmentId))
                .filter(Boolean),
        );

        const allComplete = assessmentIds.every((id) => systemCompletedIds.has(id));
        if (!allComplete) return task;

        changed = true;
        return { ...task, status: 'completed' as const };
    });

    if (!changed) return roadmap;

    const withTasks = { ...roadmap, roadmaps };
    const { completed, total } = getCompletionStats(withTasks);
    let status = roadmap.status;
    if (total > 0 && completed >= total) {
        status = 'completed';
    } else if (completed > 0) {
        status = 'in-progress';
    }
    return { ...withTasks, status };
}

/** Saved extras include real form fields (not only Jumpstart completion marker). */
export function hasSavableFormExtras(savedItems?: any[] | null): boolean {
    if (!Array.isArray(savedItems)) return false;
    return savedItems.some(
        (item) => item?.name && item.type !== 'JUMPSTART_COMPLETE',
    );
}

/**
 * Whether submit should PATCH vs POST extras for this task.
 * Nested tasks: roadmap-level Jumpstart fallback must not force PATCH on nested id
 * unless roadmap-level extras already exist (backend: one extras row per user+roadmap).
 */
export function shouldUpdateTaskExtras(
    hasNestedTaskId: boolean,
    hasNestedSavableExtras: boolean,
    extrasItems?: any[] | null,
    roadmapLevelExtrasExist?: boolean,
): boolean {
    if (hasNestedSavableExtras) return true;
    if (hasNestedTaskId && roadmapLevelExtrasExist) return true;
    if (!hasNestedTaskId) return hasSavableFormExtras(extrasItems);
    return false;
}

export function isSingleOnboardingRoadmap(roadmap: Roadmap | undefined | null): boolean {
    return String(roadmap?.type ?? '').trim().toLowerCase() === 'single';
}

/**
 * Attach locally recorded completion time to tasks already marked completed by
 * backend progress merge. Never promotes status to completed from AsyncStorage alone.
 */
export function applyLocalTaskCompletionOverrides(
    roadmap: Roadmap,
    localCompletionMs?: Record<string, number>,
): Roadmap {
    if (!localCompletionMs || !roadmap.roadmaps?.length) return roadmap;

    const phaseId = String(roadmap._id ?? '').trim();
    if (!phaseId) return roadmap;

    let changed = false;
    const roadmaps = roadmap.roadmaps.map((task) => {
        if (!task?._id) return task;
        if (normalizeNestedTaskStatus(task.status) !== 'completed') return task;

        const key = taskCompletionMapKey(phaseId, String(task._id));
        const localMs = localCompletionMs[key];
        if (!localMs || localMs <= 0) return task;
        if (task.completedOn) return task;

        changed = true;
        return { ...task, completedOn: new Date(localMs).toISOString() };
    });

    if (!changed) return roadmap;
    return { ...roadmap, roadmaps };
}

/** Last saved value per field name (ignores duplicate rows from repeated saves). */
export function savedExtrasToFormValues(
    savedItems?: any[] | null,
    templateExtras?: Extra[] | null,
): Record<string, any> {
    if (templateExtras?.length) {
        return mapSavedExtrasToFormValues(savedItems, templateExtras) as Record<string, any>;
    }

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

export { EXTRA_FIELD_KEY_SEP } from './extraFieldKeys';

/** True when `id` is a 24-char hex MongoDB ObjectId. */
export function isMongoObjectId(id: string | undefined | null): id is string {
    return (
        typeof id === 'string' &&
        id.trim() !== '' &&
        id.length === 24 &&
        /^[0-9a-fA-F]{24}$/.test(id)
    );
}

/**
 * Roadmap id for comments/queries API threads — one thread per nested task.
 * Prefers the nested task id; falls back to the parent phase id for legacy callers.
 */
export function resolveRoadmapThreadId(
    taskId?: string | null,
    fallbackRoadmapId?: string | null,
): string | undefined {
    if (isMongoObjectId(taskId)) return taskId;
    if (isMongoObjectId(fallbackRoadmapId)) return fallbackRoadmapId;
    const task = taskId?.trim();
    if (task) return task;
    const fallback = fallbackRoadmapId?.trim();
    return fallback || undefined;
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

    // If this is a phase with nested tasks, derive status from child task progress.
    if ('roadmaps' in roadmap && Array.isArray(roadmap.roadmaps) && roadmap.roadmaps.length > 0) {
        const { completed, total } = getCompletionStats(roadmap as Roadmap);
        if (total > 0 && completed >= total) {
            return 'completed';
        }
        if (completed > 0) {
            return 'in-progress';
        }
        const hasActiveWork = getTasks(roadmap as Roadmap).some((t) => {
            const s = normalizeNestedTaskStatus(t?.status);
            return s === 'in-progress' || s === 'blocked' || s === 'submitted';
        });
        if (hasActiveWork) {
            return 'in-progress';
        }
        return 'initial';
    }

    const normalized = normalizeNestedTaskStatus(roadmap.status);
    const statusMap: Record<string, RoadmapCardStatus> = {
        'not started': 'initial',
        'in-progress': 'in-progress',
        'completed': 'completed',
        'submitted': 'submitted',
        'blocked': 'in-progress',
    };

    return statusMap[normalized] || 'initial';
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
    if (raw === 'submitted') return 'submitted';
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

/** Assigned phases the pastor has not started yet (0% progress, no active tasks). */
export function isPastorPhaseNewlyAssigned(roadmap: Roadmap): boolean {
    return getPastorPhaseSortGroup(roadmap) === 1;
}

/** Sort phases in canonical journey order (Jump Start → Self → Church → Community). */
export function comparePastorPhasesForHome(a: Roadmap, b: Roadmap): number {
    return comparePastorPhasesForFocus(a, b);
}

function toEpochMsForSort(dateString?: string): number {
    if (!dateString) return 0;
    const parsed = Date.parse(dateString);
    return Number.isNaN(parsed) ? 0 : parsed;
}

function getCanonicalPhaseIndex(roadmap: Roadmap): number {
    const name = String(roadmap.name ?? roadmap.phase ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

    if (name.includes('jump') || name.includes('jumpstart')) return 0;

    const phaseNum = getPhaseNumber(String(roadmap.phase ?? ''));
    if (phaseNum === 1) return 1;
    if (phaseNum === 2) return 2;
    if (phaseNum === 3) return 3;

    if (name.includes('self revitalization') || name.includes('phase 1')) return 1;
    if (name.includes('church empowerment') || name.includes('phase 2')) return 2;
    if (name.includes('community revitalization') || name.includes('multiplication') || name.includes('phase 3')) return 3;

    return 99;
}

export function comparePastorPhasesForFocus(a: Roadmap, b: Roadmap): number {
    const aIdx = getCanonicalPhaseIndex(a);
    const bIdx = getCanonicalPhaseIndex(b);
    if (aIdx !== bIdx) return aIdx - bIdx;
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

/** When a phase has exactly one nested task, return its id for direct navigation. */
export function getSingleNestedTaskId(
    roadmap: Roadmap | null | undefined,
): string | undefined {
    const nested = (roadmap?.roadmaps ?? []).filter((task) => task != null);
    if (nested.length !== 1) return undefined;
    const id = nested[0]?._id;
    return id != null && String(id).length > 0 ? String(id) : undefined;
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
    if (!duration) return { min: 1, max: 1 };

    // Match numbers, optionally separated by hyphen/dash, optionally followed by unit
    
    const match = duration.match(/(\d+)(?:\s*[-–]\s*(\d+))?(?:\s*(month|week))?/i);
    if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        const unit = match[3] ? match[3].toLowerCase() : 'month';

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

export type FlattenedRoadmapDocument = {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    extraName?: string;
    uploadBatchId?: string;
};

/** Flatten submission-scoped uploadedDocuments (immutable per submission snapshot). */
export function flattenSubmissionUploadedDocuments(
    uploadedDocuments?: any[] | null,
    extraName?: string,
): FlattenedRoadmapDocument[] {
    if (!uploadedDocuments?.length) return [];

    const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
    const wanted = extraName ? norm(extraName) : null;

    const flatFiles = uploadedDocuments.flatMap((batch: any, batchIndex: number) => {
        const batchExtraName = batch.name ?? batch.extraName ?? batch.fieldName;
        const files = Array.isArray(batch.files) ? batch.files : null;

        if (files) {
            return files.map((f: any, fileIndex: number) => {
                const rawUrl =
                    f.fileUrl ?? f.url ?? f.path ?? f.location ?? f.secureUrl ?? "";
                return {
                    ...f,
                    _id: String(
                        f._id ??
                            f.id ??
                            `${batch.uploadBatchId ?? batch._id ?? "batch"}-${batchIndex}-${fileIndex}-${f.fileName ?? f.name ?? "file"}`,
                    ),
                    fileName: f.fileName ?? f.name ?? "File",
                    fileUrl: resolveRoadmapDocumentUrl(rawUrl),
                    fileType: f.fileType ?? f.mimeType ?? f.type ?? "",
                    extraName: batchExtraName ?? f.extraName ?? f.name,
                    uploadBatchId:
                        batch.uploadBatchId ??
                        batch._id ??
                        batch.id ??
                        f.uploadBatchId,
                };
            });
        }

        const rawUrl =
            batch.fileUrl ?? batch.url ?? batch.path ?? batch.location ?? batch.secureUrl ?? "";
        if (!rawUrl) return [];

        return [
            {
                ...batch,
                _id: String(batch._id ?? batch.id ?? `submission-doc-${batchIndex}`),
                fileName: batch.fileName ?? batch.name ?? "File",
                fileUrl: resolveRoadmapDocumentUrl(rawUrl),
                fileType: batch.fileType ?? batch.mimeType ?? batch.type ?? "",
                extraName: batchExtraName ?? batch.extraName,
                uploadBatchId: batch.uploadBatchId ?? batch._id ?? batch.id,
            },
        ];
    });

    if (!wanted) return flatFiles;
    return flatFiles.filter((f) => norm(f.extraName) === wanted);
}

export function isLegacySubmissionId(id?: string | null): boolean {
    return String(id ?? "").startsWith("legacy-");
}

export function isSyntheticSubmissionId(id?: string | null): boolean {
    const value = String(id ?? "").trim();
    return isLegacySubmissionId(value) || /-v\d+$/.test(value);
}

export type RoadmapDocumentBatch = {
    _id?: string;
    name?: string;
    extraName?: string;
    uploadBatchId?: string;
    uploadedAt?: string;
    historyVersion?: number;
    files?: any[];
};

export function normalizeRoadmapDocumentBatches(rawBatches?: any[] | null): RoadmapDocumentBatch[] {
    return (rawBatches ?? []).map((batch) => ({
        ...batch,
        name: batch.name ?? batch.extraName,
        uploadBatchId: batch.uploadBatchId ?? batch._id ?? batch.id,
        uploadedAt: batch.uploadedAt ?? batch.createdAt,
        historyVersion: batch.historyVersion,
    }));
}

const SKIP_EXTRA_TYPES = new Set(["JUMPSTART_COMPLETE"]);

/** Count submission versions from duplicate field entries in extras[]. */
export function computeHistoryVersionCount(extras?: any[] | null): number {
    const allExtras = (extras ?? []).filter(
        (entry) => entry?.name && !SKIP_EXTRA_TYPES.has(entry.type),
    );
    if (allExtras.length === 0) return 1;

    const byName = new Map<string, number>();
    for (const entry of allExtras) {
        const key = String(entry.name);
        byName.set(key, (byName.get(key) ?? 0) + 1);
    }

    return Math.max(1, ...Array.from(byName.values()));
}

export function getTaskDocumentVersionNumber(
    latestSubmission?: { submissionNumber?: number } | null,
    extrasList?: any[] | null,
    batches?: RoadmapDocumentBatch[] | null,
): number {
    if (latestSubmission?.submissionNumber && latestSubmission.submissionNumber > 0) {
        return latestSubmission.submissionNumber;
    }

    if ((extrasList?.length ?? 0) > 0) {
        return computeHistoryVersionCount(extrasList);
    }

    const stamped = (batches ?? [])
        .map((batch) => Number(batch.historyVersion))
        .filter((value) => Number.isFinite(value) && value > 0);
    if (stamped.length > 0) return Math.max(...stamped);

    return 1;
}

function sortBatchesChronologically(batches: RoadmapDocumentBatch[]): RoadmapDocumentBatch[] {
    return [...batches].sort((a, b) => {
        const aMs = new Date(String(a.uploadedAt ?? "")).getTime();
        const bMs = new Date(String(b.uploadedAt ?? "")).getTime();
        if (Number.isFinite(aMs) && Number.isFinite(bMs) && aMs !== bMs) {
            return aMs - bMs;
        }
        return String(a.uploadBatchId ?? "").localeCompare(String(b.uploadBatchId ?? ""));
    });
}

/** Latest upload batch per field — used for the active task screen (not history). */
export function getLatestBatchesPerField(
    uploadedDocuments: RoadmapDocumentBatch[] | undefined | null,
): RoadmapDocumentBatch[] {
    const batches = uploadedDocuments ?? [];
    if (batches.length === 0) return [];

    const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
    const byField = new Map<string, RoadmapDocumentBatch[]>();

    for (const batch of batches) {
        const key = norm(batch.name ?? batch.extraName);
        if (!key) continue;
        if (!byField.has(key)) byField.set(key, []);
        byField.get(key)!.push(batch);
    }

    const resolved: RoadmapDocumentBatch[] = [];
    for (const fieldBatches of byField.values()) {
        const sorted = sortBatchesChronologically(fieldBatches);
        const latest = sorted[sorted.length - 1];
        if (latest) resolved.push(latest);
    }

    return sortBatchesChronologically(resolved);
}

/** Documents that belong to a specific history version (immutable snapshot). */
export function resolveUploadedDocumentsForVersion(
    uploadedDocuments: RoadmapDocumentBatch[] | undefined | null,
    versionNumber: number,
): RoadmapDocumentBatch[] {
    const batches = uploadedDocuments ?? [];
    if (batches.length === 0) return [];

    const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();

    const stamped = batches.filter(
        (batch) => Number(batch.historyVersion) === versionNumber,
    );
    if (stamped.length > 0) return sortBatchesChronologically(stamped);

    // Legacy batches (no historyVersion) keep their original index per field.
    const legacyBatches = batches.filter(
        (batch) => batch.historyVersion == null || batch.historyVersion === undefined,
    );

    const byField = new Map<string, RoadmapDocumentBatch[]>();
    for (const batch of legacyBatches) {
        const key = norm(batch.name ?? batch.extraName);
        if (!key) continue;
        if (!byField.has(key)) byField.set(key, []);
        byField.get(key)!.push(batch);
    }

    const resolved: RoadmapDocumentBatch[] = [];
    for (const fieldBatches of byField.values()) {
        const sorted = sortBatchesChronologically(fieldBatches);
        const batch = sorted[versionNumber - 1];
        if (batch) resolved.push(batch);
    }

    return sortBatchesChronologically(resolved);
}

/** Resolve upload-field media for a specific submission snapshot. */
export function getSubmissionUploadDocuments(
    submission: Pick<TaskSubmission, "_id" | "submissionNumber" | "uploadedDocuments">,
    fieldName: string,
    documentBatches: RoadmapDocumentBatch[] = [],
): FlattenedRoadmapDocument[] {
    const fromSubmission = flattenSubmissionUploadedDocuments(
        submission.uploadedDocuments,
        fieldName,
    );
    if (fromSubmission.length > 0) {
        return fromSubmission;
    }

    if (!isLegacySubmissionId(submission._id) && submission.uploadedDocuments !== undefined) {
        return [];
    }

    const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
    const wanted = norm(fieldName);
    const versionDocs = resolveUploadedDocumentsForVersion(
        documentBatches,
        submission.submissionNumber,
    );

    return flattenSubmissionUploadedDocuments(
        versionDocs.filter((batch) => norm(batch.name ?? batch.extraName) === wanted),
        fieldName,
    );
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
