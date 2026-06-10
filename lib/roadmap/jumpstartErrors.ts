import {
    isJumpstartBlockingApiError,
    isJumpstartBlockingMessage,
    JUMPSTART_MENTOR_NO_AVAILABILITY_MSG,
    JUMPSTART_NO_MENTOR_MSG,
    JUMPSTART_NO_SLOTS_MSG,
    JUMPSTART_NO_SLOTS_NOTICE_MSG,
    matchesJumpstartBlockingMessage,
} from "@/lib/roadmap/jumpstartErrorMatch";
import { extractApiErrorMessage } from "@/utils/availability/api-error";
import { Alert } from "react-native";

export {
    JUMPSTART_MENTOR_NO_AVAILABILITY_MSG,
    JUMPSTART_NO_MENTOR_MSG,
    JUMPSTART_NO_SLOTS_MSG,
    JUMPSTART_NO_SLOTS_NOTICE_MSG,
    isJumpstartBlockingMessage,
};

/** True when the backend blocked Jumpstart completion (mentor assignment / availability). */
export function isJumpstartBlockingError(error: unknown): boolean {
    if (isJumpstartBlockingApiError(error)) return true;

    const msg = extractApiErrorMessage(error);
    return matchesJumpstartBlockingMessage(msg);
}

function jumpstartErrorTitle(message: string): string {
    const msg = message.trim().toLowerCase();

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

    if (
        msg.includes("minimum scheduling notice period") ||
        msg === JUMPSTART_NO_SLOTS_NOTICE_MSG.toLowerCase()
    ) {
        return "Scheduling Notice Required";
    }

    if (
        msg.includes("no available mentoring slots") ||
        msg === JUMPSTART_NO_SLOTS_MSG.toLowerCase()
    ) {
        return "No Mentoring Slots Available";
    }

    return "Cannot Complete Jumpstart";
}

export function getJumpstartErrorTitle(error: unknown): string {
    return jumpstartErrorTitle(extractApiErrorMessage(error));
}

/** User-facing alert for Jumpstart mentor validation (not an app crash). */
export function presentJumpstartBlockingError(error: unknown): void {
    const message = extractApiErrorMessage(error);
    Alert.alert(jumpstartErrorTitle(message), message);
}
