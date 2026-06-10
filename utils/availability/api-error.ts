/** Extract user-facing message from Axios / API errors (matches ccc-web). */
export function extractApiErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { response?: { data?: unknown }; message?: string };
    const d = e.response?.data;

    if (typeof d === "string") {
      try {
        const parsed = JSON.parse(d) as { message?: unknown };
        if (typeof parsed.message === "string") return parsed.message;
      } catch {
        return d;
      }
    }

    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;
      if (typeof o.message === "string") return o.message;
      if (Array.isArray(o.message)) return o.message.map(String).join(", ");
      if (typeof o.error === "string") return o.error;
    }
    if (
      typeof e.message === "string" &&
      !e.message.startsWith("Request failed with status")
    ) {
      return e.message;
    }
  }
  return "Request failed";
}
