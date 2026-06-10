import { extractApiErrorMessage } from "@/utils/availability/api-error";

/** Mirrors backend `JUMPSTART_MENTOR_NO_AVAILABILITY_MSG` (roadmaps.service.ts). */
export const JUMPSTART_MENTOR_NO_AVAILABILITY_MSG =
    "Your assigned mentor has not configured availability. Please ask your mentor to set availability before completing Jumpstart.";

/** Mirrors backend `JUMPSTART_NO_MENTOR_MSG` (roadmaps.service.ts). */
export const JUMPSTART_NO_MENTOR_MSG =
    "No mentor is assigned to your account. Please contact support before completing Jumpstart.";

function normalizedMessage(error: unknown): string {
    return extractApiErrorMessage(error).trim().toLowerCase();
}

/** True when the backend blocked Jumpstart completion (mentor assignment / availability). */
export function isJumpstartBlockingError(error: unknown): boolean {
    const msg = normalizedMessage(error);
    if (!msg) return false;

    const availabilityNeedle = JUMPSTART_MENTOR_NO_AVAILABILITY_MSG.toLowerCase();
    const noMentorNeedle = JUMPSTART_NO_MENTOR_MSG.toLowerCase();

    if (msg === availabilityNeedle || msg === noMentorNeedle) {
        return true;
    }

    return (
        msg.includes("not configured availability") ||
        msg.includes("no mentor is assigned") ||
        msg.includes("mentor has no availability")
    );
}

export function getJumpstartErrorTitle(error: unknown): string {
    const msg = normalizedMessage(error);

    if (
        msg.includes("no mentor is assigned") ||
        msg === JUMPSTART_NO_MENTOR_MSG.toLowerCase()
    ) {
        return "Mentor Not Assigned";
    }

    if (
        msg.includes("not configured availability") ||
        msg.includes("mentor has no availability") ||
        msg === JUMPSTART_MENTOR_NO_AVAILABILITY_MSG.toLowerCase()
    ) {
        return "Mentor Availability Required";
    }

    return "Cannot Complete Jumpstart";
}
