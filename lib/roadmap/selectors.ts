import { Comment, Division, Phase, Query, QueryResponse, RevitalizationData, Task } from './types';


export const getTask = (data: RevitalizationData, id: string): Task => data.tasks[id];
export function getPhase(data: RevitalizationData, phaseId: string): Phase {
    return data.phases[phaseId];
}

export function getPhaseTasks(data: RevitalizationData, phase: Phase): Task[] {
    
    if (phase.divisions && data.divisions) {
        const allTasks: Task[] = [];
        phase.divisions.forEach(divId => {
            const division = data.divisions![divId];
            if (division?.tasks) {
                division.tasks.forEach(taskId => {
                    const task = data.tasks[taskId];
                    if (task) allTasks.push(task);
                });
            }
        });
        return allTasks;
    }

    
    if (phase.tasks) {
        return phase.tasks
            .map(taskId => data.tasks[taskId])
            .filter(Boolean);
    }

    return [];
}


export const getComment = (data: RevitalizationData, id: string): Comment | undefined =>
    data.comments?.[id];

export const getTaskComments = (data: RevitalizationData, taskId: string): Comment[] => {
    const task = getTask(data, taskId);
    if (!task.comments || !data.comments) return [];

    return task.comments
        .map(id => data.comments![id])
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getUnreadCommentCount = (data: RevitalizationData, taskId: string): number => {
    return getTaskComments(data, taskId).filter(c => c.status === 'UNREAD').length;
};


export const getQuery = (data: RevitalizationData, id: string): Query | undefined =>
    data.queries?.[id];

export const getTaskQueries = (data: RevitalizationData, taskId: string): Query[] => {
    const task = getTask(data, taskId);
    if (!task || !task.queries || !data.queries) return [];

    return task.queries
        .map(id => data.queries![id])
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getQueryResponse = (data: RevitalizationData, id: string): QueryResponse | undefined =>
    data.queryResponses?.[id];

export const getQueryResponses = (data: RevitalizationData, queryId: string): QueryResponse[] => {
    const query = getQuery(data, queryId);
    if (!query?.responses || !data.queryResponses) return [];

    return query.responses
        .map(id => data.queryResponses![id])
        .filter(Boolean)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};




export function getDivisionsForPhase(
    data: RevitalizationData,
    phaseId: string
): Division[] {
    const phase = data.phases[phaseId];
    if (!phase?.divisions || !data.divisions) return [];

    return phase.divisions
        .map(divId => data.divisions![divId])
        .filter(Boolean)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getTasksForDivision(
    data: RevitalizationData,
    divisionId: string
): Task[] {
    const division = data.divisions?.[divisionId];
    if (!division?.tasks) return [];

    return division.tasks
        .map(taskId => data.tasks[taskId])
        .filter(Boolean);
}

export function phaseHasDivisions(
    data: RevitalizationData,
    phaseId: string
): boolean {
    const phase = data.phases[phaseId];
    return phase?.divisions != null && phase.divisions.length > 0;
}