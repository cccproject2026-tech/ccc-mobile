import type { CreateExtrasDto } from '@/lib/roadmap/types';

function getHttpErrorStatus(error: unknown): number | undefined {
    const e = error as { response?: { status?: number }; statusCode?: number };
    return e?.response?.status ?? e?.statusCode;
}

function getHttpErrorMessage(error: unknown): string {
    const e = error as {
        response?: { data?: { message?: string } };
        message?: string;
    };
    return String(e?.response?.data?.message ?? e?.message ?? '');
}

function shouldFallbackToPatch(error: unknown): boolean {
    const status = getHttpErrorStatus(error);
    if (status === 409) return true;
    if (status === 400) {
        return /already exist|use patch/i.test(getHttpErrorMessage(error));
    }
    return false;
}

export type TaskExtrasPayloadItem = {
    type: string;
    name: string;
    value?: unknown;
    signatureData?: unknown;
};

/**
 * Persists task form extras: PATCH when prior saves exist, POST otherwise.
 * On PATCH 404 (row missing), falls back to POST so Jumpstart nested tasks still save.
 */
export async function saveTaskRoadmapExtras(params: {
    isUpdateMode: boolean;
    roadMapId: string;
    userId: string;
    nestedRoadMapItemId?: string;
    extras: TaskExtrasPayloadItem[];
    createExtras: (payload: CreateExtrasDto) => Promise<unknown>;
    updateExtras: (vars: {
        roadMapId: string;
        payload: { extras: TaskExtrasPayloadItem[] };
        userId: string;
        nestedRoadMapItemId?: string;
    }) => Promise<unknown>;
}): Promise<void> {
    const {
        isUpdateMode,
        roadMapId,
        userId,
        nestedRoadMapItemId,
        extras,
        createExtras,
        updateExtras,
    } = params;

    const createPayload: CreateExtrasDto = {
        userId,
        roadMapId,
        nestedRoadMapItemId,
        extras,
    };

    const updateVars = {
        roadMapId,
        payload: { extras },
        userId,
        nestedRoadMapItemId,
    };

    if (isUpdateMode) {
        try {
            await updateExtras(updateVars);
            return;
        } catch (error) {
            if (getHttpErrorStatus(error) === 404) {
                await createExtras(createPayload);
                return;
            }
            throw error;
        }
    }

    try {
        await createExtras(createPayload);
    } catch (error) {
        if (shouldFallbackToPatch(error)) {
            await updateExtras(updateVars);
            return;
        }
        throw error;
    }
}
