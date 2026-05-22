import type { Roadmap } from "@/lib/roadmap/types";
import type { Router } from "expo-router";

export function resolveSearchEntityId(item: unknown): string | undefined {
  if (!item || typeof item !== "object") return undefined;
  const record = item as Record<string, unknown>;
  const metadata =
    record.metadata && typeof record.metadata === "object"
      ? (record.metadata as Record<string, unknown>)
      : undefined;
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : undefined;

  const candidates = [
    record._id,
    record.id,
    record.roadmapId,
    record.interestId,
    metadata?._id,
    metadata?.id,
    data?._id,
    data?.id,
  ];

  for (const value of candidates) {
    if (value != null && String(value).trim()) {
      return String(value);
    }
  }
  return undefined;
}

export function isSearchInterestItem(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  const it = item as Record<string, unknown>;
  const lowerKeys = (Object.keys(it).join(" ") || "").toLowerCase();
  const typeHint = String(it.type ?? it.module ?? it.resource ?? "").toLowerCase();

  return (
    typeHint.includes("interest") ||
    lowerKeys.includes("interest") ||
    "firstName" in it ||
    "churchDetails" in it ||
    typeof it.email === "string" ||
    typeof it.phoneNumber === "string"
  );
}

export function isSearchRoadmapItem(item: unknown): boolean {
  if (!item || typeof item !== "object") return false;
  if (isSearchInterestItem(item)) return false;

  const it = item as Record<string, unknown>;
  const metadata =
    it.metadata && typeof it.metadata === "object"
      ? (it.metadata as Record<string, unknown>)
      : undefined;
  const lowerKeys = (Object.keys(it).join(" ") || "").toLowerCase();
  const typeHint = String(it.type ?? it.module ?? it.resource ?? "").toLowerCase();

  return (
    typeHint.includes("roadmap") ||
    lowerKeys.includes("roadmap") ||
    (metadata != null && "roadMapDetails" in metadata) ||
    "roadmaps" in it ||
    typeof it.roadmapId === "string" ||
    (!!it.phase && (!!it.name || !!it.roadMapDetails))
  );
}

export function getInterestDisplayTitle(item: unknown): string {
  if (!item || typeof item !== "object") return "Interest";
  const it = item as Record<string, unknown>;
  const name = `${it.firstName ?? ""} ${it.lastName ?? ""}`.trim();
  return name || String(it.title ?? it.name ?? "Interest");
}

export function getRoadmapDisplayTitle(item: unknown): string {
  if (!item || typeof item !== "object") return "Untitled Roadmap";
  const it = item as Record<string, unknown>;
  const metadata =
    it.metadata && typeof it.metadata === "object"
      ? (it.metadata as Record<string, unknown>)
      : undefined;
  return String(it.title ?? it.name ?? metadata?.name ?? "Untitled Roadmap");
}

export function getRoadmapDisplaySubtitle(item: unknown): string {
  if (!item || typeof item !== "object") return "";
  const it = item as Record<string, unknown>;
  const metadata =
    it.metadata && typeof it.metadata === "object"
      ? (it.metadata as Record<string, unknown>)
      : undefined;
  return String(
    it.description ??
      metadata?.roadMapDetails ??
      metadata?.roadmapDetails ??
      "",
  );
}

export type RoadmapNavTarget = {
  phaseId: string;
  itemId?: string;
};

export function findParentPhaseIdForNested(
  nestedId: string,
  allRoadmaps: Roadmap[],
): string | undefined {
  for (const phase of allRoadmaps) {
    if (phase._id === nestedId) {
      return phase._id;
    }
    if (phase.roadmaps?.some((nested) => nested._id === nestedId)) {
      return phase._id;
    }
  }
  return undefined;
}

/** Same rules as revitalization-roadmaps/index handlePhasePress. */
export function resolveRoadmapNavigationTarget(
  item: unknown,
  allRoadmaps?: Roadmap[],
): RoadmapNavTarget | null {
  const id = resolveSearchEntityId(item);
  if (!id) return null;

  const record = (item ?? {}) as Record<string, unknown>;
  const type = String(record.type ?? "").toLowerCase();
  const nestedList = Array.isArray(record.roadmaps) ? record.roadmaps : [];
  const firstNestedId = nestedList[0] ? resolveSearchEntityId(nestedList[0]) : undefined;

  const explicitParent = record.parentRoadmapId ?? record.parentId ?? record.phaseRoadmapId;
  if (explicitParent) {
    const parentId = String(explicitParent);
    if (parentId !== id) {
      return { phaseId: parentId, itemId: id };
    }
  }

  if (type === "phase") {
    return { phaseId: id };
  }

  if (allRoadmaps?.length) {
    const parentId = findParentPhaseIdForNested(id, allRoadmaps);
    if (parentId && parentId !== id) {
      return { phaseId: parentId, itemId: id };
    }
  }

  if (record.haveNextedRoadMaps && firstNestedId) {
    return { phaseId: id, itemId: firstNestedId };
  }

  return { phaseId: id };
}

export function navigateToSearchRoadmap(
  router: Router,
  role: string | undefined,
  item: unknown,
  allRoadmaps?: Roadmap[],
): void {
  const target = resolveRoadmapNavigationTarget(item, allRoadmaps);
  if (!target) {
    console.warn("[search] roadmap result missing id", item);
    return;
  }

  const { phaseId, itemId } = target;
  const normalizedRole = String(role ?? "").toLowerCase();

  if (normalizedRole === "director") {
    if (itemId) {
      router.push(
        `/(director)/(tabs)/revitalization-roadmaps/${phaseId}/${itemId}` as never,
      );
    } else {
      router.push(`/(director)/(tabs)/revitalization-roadmaps/${phaseId}` as never);
    }
    return;
  }

  if (normalizedRole === "pastor") {
    // Relative paths — same as pastor roadmap/index (search lives in shared stack)
    if (itemId) {
      router.push(`/roadmap/${phaseId}/${itemId}` as never);
    } else {
      router.push(`/roadmap/${phaseId}` as never);
    }
    return;
  }

  if (normalizedRole === "mentor") {
    if (itemId) {
      router.push(`/(mentor)/roadmap/${phaseId}/${itemId}` as never);
    } else {
      router.push(`/(mentor)/roadmap/${phaseId}` as never);
    }
    return;
  }

  console.warn("[search] unsupported role for roadmap navigation:", role);
}

export function navigateToSearchInterest(
  router: Router,
  role: string | undefined,
  item: unknown,
): void {
  const interestId = resolveSearchEntityId(item);
  if (!interestId) {
    console.warn("[search] interest result missing id", item);
    return;
  }

  const normalizedRole = String(role ?? "").toLowerCase();
  if (normalizedRole !== "director") {
    console.warn("[search] interest details are only available for directors");
    return;
  }

  router.push(
    `/(director)/(tabs)/new-interests/interest-details?interestId=${encodeURIComponent(interestId)}` as never,
  );
}

export function getGlobalSearchRoute(role: string | undefined): string {
  const normalizedRole = String(role ?? "").toLowerCase();
  if (normalizedRole === "mentor") return "/(mentor)/(tabs)/search";
  if (normalizedRole === "pastor") return "/(pastor)/(tabs)/search";
  if (normalizedRole === "director") return "/(director)/(tabs)/search";
  return "/";
}