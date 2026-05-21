export type LoginApiError = {
    message?: string;
    statusCode?: number;
    response?: { data?: { message?: string } };
};

const EMAIL_NOT_VERIFIED_PATTERNS = [
    "email not verified",
    "verify email",
    "unverified",
];

function rawMessage(error: LoginApiError): string {
    return (error.response?.data?.message || error.message || "").trim();
}

export function isEmailNotVerifiedError(error: LoginApiError | null | undefined): boolean {
    if (!error) return false;
    const msg = rawMessage(error).toLowerCase();
    return (
        error.statusCode === 400 &&
        EMAIL_NOT_VERIFIED_PATTERNS.some((p) => msg.includes(p))
    );
}

/** User-facing login failure message; null when handled elsewhere (e.g. verify-email alert). */
export function getLoginErrorMessage(
    error: LoginApiError | null | undefined
): string | null {
    if (!error) return null;
    if (isEmailNotVerifiedError(error)) return null;

    const raw = rawMessage(error);
    const msg = raw.toLowerCase();
    const status = error.statusCode;

    const isUserNotFound =
        status === 404 ||
        msg.includes("user not found") ||
        msg.includes("no user found") ||
        msg.includes("user does not exist") ||
        msg.includes("user doesn't exist") ||
        msg.includes("email not found") ||
        msg.includes("account not found") ||
        msg.includes("no account") ||
        /\b(user|account|email)\b[^.]{0,40}\b(not found|does not exist|doesn't exist)\b/.test(
            msg
        ) ||
        /\b(not found|does not exist|doesn't exist)\b[^.]{0,40}\b(user|account|email)\b/.test(
            msg
        );

    if (isUserNotFound) {
        return "User not found";
    }

    const isWrongPassword =
        status === 401 ||
        msg.includes("incorrect password") ||
        msg.includes("wrong password") ||
        msg.includes("invalid password") ||
        msg.includes("password incorrect") ||
        msg.includes("password is incorrect") ||
        msg.includes("password mismatch") ||
        (msg.includes("password") &&
            (msg.includes("invalid") ||
                msg.includes("incorrect") ||
                msg.includes("wrong"))) ||
        msg.includes("invalid credentials") ||
        (msg.includes("authentication failed") && !msg.includes("not found"));

    if (isWrongPassword) {
        return "Incorrect password";
    }

    if (status === 401) {
        return "Incorrect password";
    }

    if (status === 404) {
        return "User not found";
    }

    return raw || "Something went wrong";
}