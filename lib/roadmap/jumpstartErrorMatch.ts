/** Mirrors backend jumpstart validation messages — zero deps for safe interceptor import. */
export const JUMPSTART_MENTOR_NO_AVAILABILITY_MSG =
    "Your assigned mentor has not configured availability. Please ask your mentor to set availability before completing Jumpstart.";

export const JUMPSTART_NO_MENTOR_MSG =
    "No mentor is assigned to your account. Please contact support before completing Jumpstart.";

export function matchesJumpstartBlockingMessage(msg: string): boolean {
    if (!msg) return false;

    const normalized = msg.trim().toLowerCase();
    const availabilityNeedle = JUMPSTART_MENTOR_NO_AVAILABILITY_MSG.toLowerCase();
    const noMentorNeedle = JUMPSTART_NO_MENTOR_MSG.toLowerCase();

    if (normalized === availabilityNeedle || normalized === noMentorNeedle) {
        return true;
    }

    return (
        normalized.includes("not configured availability") ||
        normalized.includes("no mentor is assigned") ||
        normalized.includes("mentor has no availability")
    );
}

export function isJumpstartBlockingMessage(message: string | undefined | null): boolean {
    return matchesJumpstartBlockingMessage(String(message ?? ""));
}

function readErrorMessage(error: unknown): string {
    if (!error || typeof error !== "object") return "";

    const e = error as {
        message?: string;
        response?: { data?: unknown; status?: number };
    };

    const data = e.response?.data;
    if (typeof data === "string") {
        try {
            const parsed = JSON.parse(data) as { message?: unknown };
            if (typeof parsed.message === "string") return parsed.message;
        } catch {
            return data;
        }
    }

    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        if (typeof record.message === "string") return record.message;
        if (Array.isArray(record.message)) return record.message.map(String).join(", ");
        if (typeof record.error === "string") return record.error;
    }

    if (
        typeof e.message === "string" &&
        !e.message.startsWith("Request failed with status")
    ) {
        return e.message;
    }

    return "";
}

/** Detect Jumpstart mentor-validation failures across axios + shaped API errors. */
export function isJumpstartBlockingApiError(error: unknown): boolean {
    const e = error as { statusCode?: number; response?: { status?: number } };
    const status = e?.statusCode ?? e?.response?.status;
    if (status !== undefined && status !== 400) return false;
    return isJumpstartBlockingMessage(readErrorMessage(error));
}
