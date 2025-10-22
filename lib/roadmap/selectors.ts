import { Comment, Phase, Query, QueryResponse, RevitalizationData, Task } from './types';

// Existing helpers
export const getPhase = (data: RevitalizationData, id: string): Phase => data.phases[id];
export const getTask = (data: RevitalizationData, id: string): Task => data.tasks[id];
export const getPhaseTasks = (data: RevitalizationData, phase: Phase): Task[] =>
    phase.tasks.map(id => data.tasks[id]);

// Comment helpers
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

// Query helpers
// Query helpers - simplified, no filtering by phase/task
export const getQuery = (data: RevitalizationData, id: string): Query | undefined =>
    data.queries?.[id];

export const getTaskQueries = (data: RevitalizationData, taskId: string): Query[] => {
    const task = getTask(data, taskId);
    if (!task.queries || !data.queries) return [];

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
