// types/progress.types.ts

export interface NestedRoadmapProgress {
    nestedRoadmapId: string;
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
}

export interface RoadmapProgress {
    roadMapId: string;
    completedSteps: number;
    totalSteps: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
    nestedRoadmaps?: NestedRoadmapProgress[];
}

export interface AssessmentProgress {
    assessmentId: string;
    completedSections: number;
    totalSections: number;
    progressPercentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
}

export interface ProgressData {
    overallProgress: number;
    roadmaps: {
        total: number;
        completed: number;
        percentage: number;
        items: RoadmapProgress[];
    };
    assessments: {
        total: number;
        completed: number;
        percentage: number;
        items: AssessmentProgress[];
    };
}
