import {
  comparePastorPhasesForFocus,
  getCompletionStats,
  getPhaseNumber,
} from "@/lib/roadmap/helpers";
import type { Roadmap } from "@/lib/roadmap/types";

/** Canonical 12-month journey order shown in the visual flow strip. */
export const CANONICAL_JOURNEY_STEPS = [
  { id: "jump-start", title: "Jump Start", shortTitle: "Jump Start" },
  { id: "phase-1", title: "Self Revitalization", shortTitle: "Self" },
  { id: "phase-2", title: "Church Empowerment", shortTitle: "Church" },
  { id: "phase-3", title: "Community Revitalization", shortTitle: "Community" },
] as const;

export type JourneyFlowStepState = "completed" | "current" | "locked";

export type JourneyFlowStep = {
  id: string;
  title: string;
  shortTitle: string;
  state: JourneyFlowStepState;
  /** Assigned roadmap document, when the director has assigned this phase. */
  roadmap?: Roadmap;
};

function normalizePhaseName(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function isJumpStartRoadmap(roadmap: Roadmap): boolean {
  const name = normalizePhaseName(String(roadmap.name ?? roadmap.phase ?? ""));
  return name.includes("jump") || name.includes("jump-start") || name.includes("jumpstart");
}

/** Match an assigned roadmap to a canonical journey step. */
export function matchRoadmapToCanonicalStep(roadmap: Roadmap): string | null {
  if (isJumpStartRoadmap(roadmap)) return "jump-start";

  const phaseNum = getPhaseNumber(String(roadmap.phase ?? ""));
  if (phaseNum === 1) return "phase-1";
  if (phaseNum === 2) return "phase-2";
  if (phaseNum === 3) return "phase-3";

  const name = normalizePhaseName(String(roadmap.name ?? ""));
  if (name.includes("self revitalization") || name.includes("phase 1")) return "phase-1";
  if (name.includes("church empowerment") || name.includes("phase 2")) return "phase-2";
  if (
    name.includes("community revitalization") ||
    name.includes("multiplication") ||
    name.includes("phase 3")
  ) {
    return "phase-3";
  }

  return null;
}

export function getOverallJourneyTaskStats(roadmaps: Roadmap[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  let completed = 0;
  let total = 0;
  for (const roadmap of roadmaps) {
    const stats = getCompletionStats(roadmap);
    completed += stats.completed;
    total += stats.total;
  }
  const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return { completed, total, percentage };
}

/**
 * Build visual journey steps: ✓ completed, highlighted current, 🔒 locked future.
 * Sequential rule: a phase stays locked until all earlier assigned phases are finished.
 *
 * Any assigned roadmaps that don't match a canonical step are appended
 * dynamically so newly-added phases always appear in the flow strip.
 */
export function buildJourneyFlowSteps(roadmaps: Roadmap[]): JourneyFlowStep[] {
  const byStepId = new Map<string, Roadmap>();
  const matchedRoadmapIds = new Set<string>();

  for (const roadmap of roadmaps) {
    const stepId = matchRoadmapToCanonicalStep(roadmap);
    if (stepId && !byStepId.has(stepId)) {
      byStepId.set(stepId, roadmap);
      matchedRoadmapIds.add(String(roadmap._id));
    }
  }

  const unmatchedRoadmaps = roadmaps.filter(
    (r) => !matchedRoadmapIds.has(String(r._id)),
  );

  type StepDef = { id: string; title: string; shortTitle: string };
  const allStepDefs: StepDef[] = [...CANONICAL_JOURNEY_STEPS];

  for (const roadmap of unmatchedRoadmaps) {
    const dynamicId = `dynamic-${roadmap._id}`;
    const name = String(roadmap.name ?? "Phase").trim();
    const shortName = name.length > 12 ? name.slice(0, 12).trim() : name;
    allStepDefs.push({ id: dynamicId, title: name, shortTitle: shortName });
    byStepId.set(dynamicId, roadmap);
  }

  const assignedSteps = allStepDefs.filter((step) => byStepId.has(step.id));

  let currentStepIndex = -1;
  for (let i = 0; i < assignedSteps.length; i++) {
    const assigned = byStepId.get(assignedSteps[i].id)!;
    const { completed, total } = getCompletionStats(assigned);
    const done = total > 0 && completed === total;
    if (!done) {
      currentStepIndex = i;
      break;
    }
  }

  return assignedSteps.map((step, index) => {
    const roadmap = byStepId.get(step.id)!;
    const { completed, total } = getCompletionStats(roadmap);
    const done = total > 0 && completed === total;

    if (done) {
      return { ...step, state: "completed" as const, roadmap };
    }

    if (currentStepIndex === -1) {
      return { ...step, state: "completed" as const, roadmap };
    }

    if (index === currentStepIndex) {
      return { ...step, state: "current" as const, roadmap };
    }

    if (index < currentStepIndex) {
      return { ...step, state: "completed" as const, roadmap };
    }

    return { ...step, state: "locked" as const, roadmap };
  });
}

/** First phase that needs attention — powers “Continue where you left off”. */
export function getFocusRoadmap(roadmaps: Roadmap[]): Roadmap | null {
  if (!roadmaps.length) return null;

  const sorted = [...roadmaps].sort(comparePastorPhasesForFocus);

  const open = sorted.find((r) => {
    const { completed, total } = getCompletionStats(r);
    return total > 0 && completed < total;
  });

  return open ?? null;
}

export function areAllAssignedPhasesComplete(roadmaps: Roadmap[]): boolean {
  if (!roadmaps.length) return false;
  return roadmaps.every((r) => {
    const { completed, total } = getCompletionStats(r);
    return total > 0 && completed === total;
  });
}
