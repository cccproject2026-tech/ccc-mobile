import { BaseItem, RevitalizationData } from './types';

export const selectProgram = (d: RevitalizationData) => d.program;
export const selectPhase = (d: RevitalizationData, id: string) => d.phases[id];
export const selectItems = (d: RevitalizationData, ids: string[]) => ids.map(i => d.items[i]);

export type FilterTab = 'ALL' | 'DUE' | 'NOT_STARTED' | 'COMPLETED' | 'IN_PROGRESS';

export const filterItems = (items: BaseItem[], tab: FilterTab) => {
    const today = new Date().toISOString().slice(0, 10);
    const t = tab.toUpperCase(); // normalize

    if (t === 'ALL') return items;

    if (t === 'DUE') {
        return items.filter(
            i =>
                i.dueDate &&
                i.dueDate <= today &&
                i.status.toUpperCase() !== 'COMPLETED'
        );
    }

    // compare uppercase versions to be safe
    return items.filter(i => i.status.toUpperCase() === t);
};
