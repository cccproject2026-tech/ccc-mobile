/** Route param value when browsing mentor Roadmap Library (template preview). */
export const ROADMAP_LIBRARY_MODE = "1" as const;

export function roadmapLibraryRouteParams(enabled: boolean) {
  return enabled ? { libraryMode: ROADMAP_LIBRARY_MODE } : {};
}

export function isRoadmapLibraryMode(
  value: string | string[] | undefined | null,
): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === ROADMAP_LIBRARY_MODE || raw === "true";
}
