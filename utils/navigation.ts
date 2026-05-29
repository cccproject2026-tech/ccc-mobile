import type { Href, Router } from "expo-router";

export type ReturnToParams = {
  returnTo?: string | string[];
};

/** Read `returnTo` route param (href to restore when leaving a cross-stack screen). */
export function getReturnToParam(params: ReturnToParams): string | undefined {
  const raw = params.returnTo;
  if (!raw) return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = String(value ?? "").trim();
  return trimmed || undefined;
}

/** Build a return href for the current screen (pathname + query, excluding `returnTo`). */
export function buildReturnTo(
  pathname: string,
  searchParams?: Record<string, string | string[] | undefined | null>,
): string {
  if (!searchParams) return pathname;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "returnTo" || value == null) continue;
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized == null || normalized === "") continue;
    qs.set(key, String(normalized));
  }

  const query = qs.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Attach `returnTo` when pushing into another stack so back can restore the prior screen. */
export function appendReturnTo<T extends Record<string, unknown>>(
  params: T,
  returnTo: string,
): T & { returnTo: string } {
  if (!returnTo) return params as T & { returnTo: string };
  return { ...params, returnTo };
}

/**
 * When `returnTo` is set (cross-stack entry), restore that screen first.
 * Otherwise use stack `back()`, then `fallback`.
 */
export function safeGoBack(
  router: Router,
  options?: { fallback?: Href; returnTo?: string },
): void {
  const returnTo = options?.returnTo?.trim();

  if (returnTo) {
    if (typeof router.dismissTo === "function") {
      router.dismissTo(returnTo as Href);
      return;
    }
    router.push(returnTo as Href);
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  if (options?.fallback) {
    router.replace(options.fallback);
  }
}
