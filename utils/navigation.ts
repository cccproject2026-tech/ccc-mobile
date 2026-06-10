import type { Href, Router } from "expo-router";

export type ReturnToParams = {
  returnTo?: string | string[];
};

const PASTOR_TABS_GROUPED_PREFIX =
  "/(pastor)/(tabs)/(index,assessments,roadmap,appointments,progress)";
const MENTOR_TABS_GROUPED_PREFIX =
  "/(mentor)/(tabs)/(index,roadmap,assessments,appointments,progress,mentees)";

function tabsGroupedPrefixForRole(role?: string): string | undefined {
  const r = String(role ?? "").toLowerCase();
  if (r === "pastor") return PASTOR_TABS_GROUPED_PREFIX;
  if (r === "mentor") return MENTOR_TABS_GROUPED_PREFIX;
  return undefined;
}

/** Expand tab-relative paths (e.g. `/assessments/survey-guidelines`) to full Expo Router hrefs. */
export function normalizeReturnToHref(
  href?: string | null,
  role?: string,
): string | undefined {
  const trimmed = String(href ?? "").trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("/(")) return trimmed;

  const qIndex = trimmed.indexOf("?");
  const path = qIndex >= 0 ? trimmed.slice(0, qIndex) : trimmed;
  const query = qIndex >= 0 ? trimmed.slice(qIndex) : "";

  const prefix = tabsGroupedPrefixForRole(role);
  if (
    prefix &&
    (path.startsWith("/review-center") ||
      path.startsWith("/roadmap") ||
      path.startsWith("/assessments"))
  ) {
    return `${prefix}${path}${query}`;
  }

  return trimmed;
}

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
  role?: string,
): string {
  if (!searchParams) {
    return normalizeReturnToHref(pathname, role) ?? pathname;
  }

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "returnTo" || value == null) continue;
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized == null || normalized === "") continue;
    qs.set(key, String(normalized));
  }

  const query = qs.toString();
  const href = query ? `${pathname}?${query}` : pathname;
  return normalizeReturnToHref(href, role) ?? href;
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
  options?: { fallback?: Href; returnTo?: string; role?: string },
): void {
  const returnTo = normalizeReturnToHref(options?.returnTo, options?.role);

  if (returnTo) {
    router.replace(returnTo as Href);
    return;
  }

  if (router.canGoBack()) {
    router.back();
    return;
  }

  const fallback = normalizeReturnToHref(String(options?.fallback ?? ""), options?.role);
  if (fallback) {
    router.replace(fallback as Href);
    return;
  }

  if (options?.fallback) {
    router.replace(options.fallback);
  }
}
