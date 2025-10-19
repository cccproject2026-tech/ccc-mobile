import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { Phase, RevitalizationData } from '@/lib/roadmap/types';

export function usePhaseToCard(data: RevitalizationData, phase: Phase) {
    const { progress } = useRoadmapProgress();
    const items = phase.items.map(id => data.items[id]);
    const completed = items.filter(i => (progress[i.id]?.status || i.status) === 'COMPLETED').length;
    const total = items.length;

    const anyDue = items.some(i => i.dueDate && (progress[i.id]?.status ?? i.status) !== 'COMPLETED');
    const anyInProgress = items.some(i => (progress[i.id]?.status ?? i.status) === 'IN_PROGRESS');
    const allCompleted = completed === total && total > 0;

    const status: 'initial' | 'in-progress' | 'completed' | 'due' =
        allCompleted ? 'completed' : anyDue ? 'due' : anyInProgress ? 'in-progress' : 'initial';

    const completedDate = allCompleted
        ? new Date().toISOString().slice(0, 10) // demo only
        : undefined;

    const taskProgress =
        (status === 'due' || status === 'in-progress') && total > 0
            ? { completed, total }
            : undefined;
    return {
        image: phase.coverImage,
        title: phase.title,
        description: phase.subtitle,
        completionTime: `Completion Time\nMonths ${phase.estMonthsMin} – ${phase.estMonthsMax}`,
        status,
        completedDate,
        taskProgress,
        showArrow: true,
        showCheckmark: allCompleted,
    } as const;
}
