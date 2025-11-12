// // // lib/roadmap/mappers.ts
// // import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
// // import { Phase, RevitalizationData } from '@/lib/roadmap/types';

// // export function usePhaseToCard(data: RevitalizationData, phase: Phase) {
// //     const { progress } = useRoadmapProgress();
// //     const items = phase.items.map(id => data.items[id]);

// //     // FIX: Use progress context to get actual status
// //     const completed = items.filter(i => {
// //         const actualStatus = progress[i.id]?.status || i.status;
// //         return actualStatus === 'COMPLETED';
// //     }).length;

// //     const total = items.length;

// //     const anyDue = items.some(i => {
// //         const actualStatus = progress[i.id]?.status || i.status;
// //         return i.dueDate && actualStatus !== 'COMPLETED';
// //     });

// //     const anyInProgress = items.some(i => {
// //         const actualStatus = progress[i.id]?.status || i.status;
// //         return actualStatus === 'IN_PROGRESS';
// //     });

// //     const allCompleted = completed === total && total > 0;

// //     const status: 'initial' | 'in-progress' | 'completed' | 'due' =
// //         allCompleted ? 'completed' : anyDue ? 'due' : anyInProgress || completed > 0 ? 'in-progress' : 'initial';

// //     const completedDate = allCompleted
// //         ? new Date().toISOString().slice(0, 10)
// //         : undefined;

// //     // FIX: Only show progress bar when status is in-progress or due
// //     const taskProgress =
// //         (status === 'in-progress' || status === 'due') && total > 0
// //             ? { completed, total }
// //             : undefined;

// //     return {
// //         image: phase.coverImage,
// //         title: phase.title,
// //         description: phase.subtitle,
// //         completionTime: `Completion Time\nMonths ${phase.estMonthsMin} – ${phase.estMonthsMax}`,
// //         status,
// //         completedDate,
// //         taskProgress,
// //         showArrow: true,
// //         showCheckmark: allCompleted,
// //     } as const;
// // }


// // lib/roadmap/mappers.ts - SINGLE HOOK FOR CARD DATA
// lib/roadmap/mappers.ts
import {
    formatDate,
    getCardStatus,
    getCompletionStats,
    getPhaseNumber,
    isSingleTask,
    parseDurationMonths
} from './helpers';
import { NestedRoadmap, Roadmap, RoadmapCardData } from './types';

/**
 * Get card data for a roadmap (phase)
 * Status is already merged from progress data via useRoadmaps hook
 */
export function getRoadmapCard(roadmap: Roadmap): RoadmapCardData {
    const { completed, total } = getCompletionStats(roadmap);
    const status = getCardStatus(roadmap);
    const { min, max } = parseDurationMonths(roadmap.duration);
    const phaseNumber = isSingleTask(roadmap) ? undefined : getPhaseNumber(roadmap.phase);

    const allCompleted = completed === total && total > 0;
    const hasProgress = (status === 'in-progress' || status === 'due') && total > 0;

    return {
        image: roadmap.imageUrl,
        title: roadmap.name,
        description: roadmap.roadMapDetails,
        completionTime: `Completion Time\nMonths ${min}${min !== max ? ` – ${max}` : ''}`,
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

    return {
        image: task.imageUrl,
        title: task.name,
        description: task.roadMapDetails,
        completionTime: task.duration ? `Duration: ${task.duration}` : undefined,
        status,
        completedDate: task.completedOn ? formatDate(task.completedOn) : undefined,
        showArrow: true,
        showCheckmark: isCompleted,
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
        description: roadmap.roadMapDetails,
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
