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
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { Phase, Task } from './types';


export const getPhaseNumberOld = (phase: Phase): number | undefined => {
    // Don't show phase badge for single roadmap phases
    if (phase.isSingleRoadmap) return undefined;

    // Extract phase number from phase ID (e.g., 'phase-1' → 1)
    const match = phase.id.match(/phase-(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
};

export function usePhaseCard(phase: Phase, tasks: Task[]) {
    const { progress } = useRoadmapProgress();

    // Calculate completion
    const completed = tasks.filter(t =>
        (progress[t.id]?.status || t.status) === 'COMPLETED'
    ).length;
    const total = tasks.length;

    // Check status
    const anyDue = tasks.some(t => {
        const status = progress[t.id]?.status || t.status;
        const today = new Date().toISOString().slice(0, 10);
        return t.dueDate && t.dueDate <= today && status !== 'COMPLETED';
    });

    const anyInProgress = tasks.some(t =>
        (progress[t.id]?.status || t.status) === 'IN_PROGRESS'
    );

    const allCompleted = completed === total && total > 0;

    // Determine phase status
    const status: 'initial' | 'in-progress' | 'completed' | 'due' =
        allCompleted ? 'completed' :
            anyDue ? 'due' :
                anyInProgress || completed > 0 ? 'in-progress' :
                    'initial';
    const phaseNumber = getPhaseNumberOld(phase);


    return {
        phase: phase.id,
        image: phase.coverImage,
        title: phase.title,
        description: phase.subtitle,
        completionTime: `Completion Time\nMonths ${phase.estMonthsMin} – ${phase.estMonthsMax}`,
        status,
        completedDate: allCompleted ? new Date().toISOString().slice(0, 10) : undefined,
        taskProgress: (status === 'in-progress' || status === 'due') && total > 0
            ? { completed, total }
            : undefined,
        showArrow: true,
        showCheckmark: allCompleted,
        phaseNumber,
    };
}


// lib/roadmap/mappers.ts
import {
    getCardStatus,
    getCompletionStats,
    getPhaseNumber,
    isSingleTask,
    parseDurationMonths
} from './helpers';
import { NestedRoadmap, Roadmap, RoadmapCardData } from './types';

/**
 * Get card data for a roadmap (phase) - NO HOOK
 */
export function getRoadmapCard(roadmap: Roadmap): RoadmapCardData {
    if (!roadmap) {
        // Return a default card if roadmap is undefined
        return {
            image: undefined,
            title: 'Unknown Roadmap',
            description: undefined,
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
    const hasProgress = status === 'in-progress' || status === 'due';

    return {
        image: roadmap.imageUrl,
        title: roadmap.name || 'Untitled Roadmap',
        description: roadmap.roadMapDetails,
        completionTime: `Completion Time\nMonths ${min}${min !== max ? ` – ${max}` : ''}`,
        status,
        completedDate: roadmap.completedOn || undefined,
        taskProgress: hasProgress && total > 0 ? { completed, total } : undefined,
        showArrow: true,
        showCheckmark: allCompleted,
        phaseNumber,
    };
}

/**
 * Get card data for a nested roadmap (task) - NO HOOK
 */
export function getTaskCard(task: NestedRoadmap): RoadmapCardData {
    const status = getCardStatus(task);
    const isCompleted = status === 'completed';

    return {
        image: task.imageUrl,
        title: task.name,
        description: task.roadMapDetails,
        completionTime: `Duration: ${task.duration}`,
        status,
        showArrow: true,
        showCheckmark: isCompleted,
    };
}
