import {
    formatDate,
    formatPastorCompletedRelativeLabel,
    getCardStatus,
    getCompletionStats,
    getPhaseNumber,
    isSingleTask,
    parseDurationMonths,
    type PastorCompletedTaskItem,
} from './helpers';
import { isResubmittedTask } from './resubmission';
import { NestedRoadmap, Roadmap, RoadmapCardData } from './types';

/**
 * Get card data for a roadmap (phase)
 * Status is already merged from progress data via useRoadmaps hook
 */
export function getRoadmapCard(roadmap: Roadmap): RoadmapCardData {
    if (!roadmap) {
        
        return {
            image: undefined,
            title: 'Unknown Roadmap',
            description: undefined,
            phaseLabel: undefined,
            completionTime: 'Completion Time\nMonths 1 - 1',
            status: 'initial',
            showArrow: true,
        };
    }

    const { completed, total } = getCompletionStats(roadmap);
    const status = getCardStatus(roadmap);
    const { min, max } = parseDurationMonths(roadmap.duration || '1 month');
    const phaseNumber = isSingleTask(roadmap) ? undefined : getPhaseNumber(roadmap.phase || '');

    const allCompleted = completed === total && total > 0;
    const hasProgress = (status === 'in-progress') && total > 0;
    return {
        image: roadmap.imageUrl,
        title: roadmap.name || 'Untitled Roadmap',
        description: roadmap.roadMapDetails || roadmap.description,
        phaseLabel: roadmap.phase,
        completionTime: `Completion Time\nMonths ${min} - ${max}`,
        status,
        completedDate: roadmap.completedOn ? formatDate(roadmap.completedOn) : undefined,
        taskProgress: hasProgress ? { completed, total } : undefined,
        showArrow: true,
        showCheckmark: allCompleted,
        phaseNumber,
    };
}

/**
 * Get card data for a nested roadmap (task)
 * Status is already merged from progress data
 */
export function getTaskCard(task: NestedRoadmap): RoadmapCardData {
    const status = getCardStatus(task);
    const isCompleted = status === 'completed';
    const resubmitted = isResubmittedTask(task);

    return {
        image: task.imageUrl,
        title: task.name,
        description: task.roadMapDetails || task.description,
        phaseLabel: task.phase,
        completionTime: task.duration ? `Duration: ${task.duration}` : undefined,
        status,
        completedDate: task.completedOn ? formatDate(task.completedOn) : undefined,
        showArrow: true,
        showCheckmark: isCompleted,
        isResubmitted: resubmitted,
        resubmittedAt: resubmitted ? task.resubmittedAt : undefined,
    };
}

/** Completed-task row using the same card UI as phase lists, with parent journey context. */
export function getPastorCompletedTaskCardData(
    item: Pick<PastorCompletedTaskItem, 'phaseTitle' | 'completedOnMs'>,
    task: NestedRoadmap,
): RoadmapCardData {
    const base = getTaskCard(task);
    const relative = formatPastorCompletedRelativeLabel(item.completedOnMs);

    return {
        ...base,
        status: 'completed',
        showArrow: true,
        showCheckmark: true,
        phaseLabel: item.phaseTitle,
        phaseContextPrefix: 'Roadmap',
        completedDate: relative ?? undefined,
        completedDateDisplay: relative ? 'plain' : undefined,
        completionTime: base.completionTime,
    };
}

/**
 * Get simplified card data (for lists/previews)
 */
export function getSimpleRoadmapCard(roadmap: Roadmap): Omit<RoadmapCardData, 'completionTime' | 'taskProgress'> {
    const status = getCardStatus(roadmap);
    const phaseNumber = isSingleTask(roadmap) ? undefined : getPhaseNumber(roadmap.phase);

    return {
        image: roadmap.imageUrl,
        title: roadmap.name,
        description: roadmap.roadMapDetails || roadmap.description,
        phaseLabel: roadmap.phase,
        status,
        showArrow: true,
        showCheckmark: status === 'completed',
        phaseNumber,
    };
}

/**
 * Get card data with custom overrides
 */
export function getRoadmapCardWithOverrides(
    roadmap: Roadmap,
    overrides?: Partial<RoadmapCardData>
): RoadmapCardData {
    const baseCard = getRoadmapCard(roadmap);
    return { ...baseCard, ...overrides };
}
