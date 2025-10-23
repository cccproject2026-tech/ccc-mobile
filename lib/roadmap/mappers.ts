// // lib/roadmap/mappers.ts
// import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
// import { Phase, RevitalizationData } from '@/lib/roadmap/types';

// export function usePhaseToCard(data: RevitalizationData, phase: Phase) {
//     const { progress } = useRoadmapProgress();
//     const items = phase.items.map(id => data.items[id]);

//     // FIX: Use progress context to get actual status
//     const completed = items.filter(i => {
//         const actualStatus = progress[i.id]?.status || i.status;
//         return actualStatus === 'COMPLETED';
//     }).length;

//     const total = items.length;

//     const anyDue = items.some(i => {
//         const actualStatus = progress[i.id]?.status || i.status;
//         return i.dueDate && actualStatus !== 'COMPLETED';
//     });

//     const anyInProgress = items.some(i => {
//         const actualStatus = progress[i.id]?.status || i.status;
//         return actualStatus === 'IN_PROGRESS';
//     });

//     const allCompleted = completed === total && total > 0;

//     const status: 'initial' | 'in-progress' | 'completed' | 'due' =
//         allCompleted ? 'completed' : anyDue ? 'due' : anyInProgress || completed > 0 ? 'in-progress' : 'initial';

//     const completedDate = allCompleted
//         ? new Date().toISOString().slice(0, 10)
//         : undefined;

//     // FIX: Only show progress bar when status is in-progress or due
//     const taskProgress =
//         (status === 'in-progress' || status === 'due') && total > 0
//             ? { completed, total }
//             : undefined;

//     return {
//         image: phase.coverImage,
//         title: phase.title,
//         description: phase.subtitle,
//         completionTime: `Completion Time\nMonths ${phase.estMonthsMin} – ${phase.estMonthsMax}`,
//         status,
//         completedDate,
//         taskProgress,
//         showArrow: true,
//         showCheckmark: allCompleted,
//     } as const;
// }


// lib/roadmap/mappers.ts - SINGLE HOOK FOR CARD DATA
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { Phase, Task } from './types';


export const getPhaseNumber = (phase: Phase): number | undefined => {
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
    const phaseNumber = getPhaseNumber(phase);


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
