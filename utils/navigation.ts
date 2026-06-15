import type { Href, Router } from "expo-router";

export type ReturnToParams = {
  returnTo?: string | string[];
};

const PASTOR_TABS_GROUPED_PREFIX =
  "/(pastor)/(tabs)/(index,assessments,roadmap,appointments,progress)";
const MENTOR_TABS_GROUPED_PREFIX =
  "/(mentor)/(tabs)/(index,roadmap,assessments,appointments,progress,mentees)";

function splitHref(href: string): { path: string; query: string } {
  const qIndex = href.indexOf("?");
  if (qIndex < 0) return { path: href, query: "" };
  return { path: href.slice(0, qIndex), query: href.slice(qIndex) };
}

/** Map grouped-tab file paths to canonical Expo Router hrefs used by router.push. */
function canonicalizeGroupedTabsHref(path: string, role?: string): string | undefined {
  const r = String(role ?? "").toLowerCase();

  if (path.startsWith(MENTOR_TABS_GROUPED_PREFIX)) {
    const rest = path.slice(MENTOR_TABS_GROUPED_PREFIX.length);
    if (rest.startsWith("/roadmap")) {
      return `/(mentor)/roadmap${rest.slice("/roadmap".length)}`;
    }
    if (rest.startsWith("/assessments")) {
      return `/(mentor)${rest}`;
    }
    if (rest.startsWith("/review-center")) {
      return `/(mentor)/(tabs)${rest}`;
    }
    return undefined;
  }

  if (path.startsWith(PASTOR_TABS_GROUPED_PREFIX)) {
    const rest = path.slice(PASTOR_TABS_GROUPED_PREFIX.length);
    if (rest.startsWith("/roadmap") || rest.startsWith("/assessments")) {
      return `/(pastor)${rest}`;
    }
    return undefined;
  }

  if (r === "mentor" && path.startsWith("/roadmap")) {
    return `/(mentor)/roadmap${path.slice("/roadmap".length)}`;
  }
  if (r === "mentor" && path.startsWith("/assessments")) {
    return `/(mentor)${path}`;
  }
  if (r === "mentor" && path.startsWith("/review-center")) {
    return `/(mentor)/(tabs)${path}`;
  }
  if (r === "pastor" && (path.startsWith("/roadmap") || path.startsWith("/assessments"))) {
    return `/(pastor)${path}`;
  }

  return undefined;
}

/** Expand tab-relative paths (e.g. `/roadmap/landing/landing`) to navigable Expo Router hrefs. */
export function normalizeReturnToHref(
  href?: string | null,
  role?: string,
): string | undefined {
  const trimmed = String(href ?? "").trim();
  if (!trimmed) return undefined;

  const { path, query } = splitHref(trimmed);
  const canonical = canonicalizeGroupedTabsHref(path, role);
  if (canonical) return `${canonical}${query}`;

  if (trimmed.startsWith("/(")) return trimmed;

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
 * Prefer stack `back()` when history exists, then `returnTo`, then `fallback`.
 */
export function safeGoBack(
  router: Router,
  options?: { fallback?: Href; returnTo?: string; role?: string },
): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  const returnTo = normalizeReturnToHref(options?.returnTo, options?.role);
  if (returnTo) {
    router.replace(returnTo as Href);
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
