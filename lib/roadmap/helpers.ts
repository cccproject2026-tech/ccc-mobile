// lib/roadmap/helpers.ts
import { NestedRoadmap, Roadmap, RoadmapCardStatus } from './types';

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
    if (!duration) return { min: 1, max: 1 };

    const match = duration.match(/(\d+)(?:\s*[-–]\s*(\d+))?\s*(month|week)/i);

    if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        const unit = match[3].toLowerCase();

        if (unit === 'week') {
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
