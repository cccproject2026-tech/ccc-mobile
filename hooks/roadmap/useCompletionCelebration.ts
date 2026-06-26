import { useCallback, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  getCompletionStats,
  getNextIncompleteNestedTaskId,
} from "@/lib/roadmap/helpers";
import type { Roadmap } from "@/lib/roadmap/types";
import { getReturnToParam, safeGoBack } from "@/utils/navigation";
import type { Href } from "expo-router";

export type CelebrationKind = "task" | "phase" | null;

export interface CelebrationState {
  kind: CelebrationKind;
  taskName: string;
  phaseName: string;
  completedCount: number;
  totalCount: number;
  currentPhaseNumber: number;
  totalPhases: number;
  nextPhaseName: string;
  hasNextPhase: boolean;
  nextTaskId: string | null;
  phaseRoadmapId: string;
  nextPhaseRoadmapId: string | null;
}

const INITIAL: CelebrationState = {
  kind: null,
  taskName: "",
  phaseName: "",
  completedCount: 0,
  totalCount: 0,
  currentPhaseNumber: 0,
  totalPhases: 0,
  nextPhaseName: "",
  hasNextPhase: false,
  nextTaskId: null,
  phaseRoadmapId: "",
  nextPhaseRoadmapId: null,
};

function computePostSaveStats(
  roadmap: Roadmap | undefined | null,
  taskId: string | undefined,
) {
  if (!roadmap) return { completed: 0, total: 0, wasAlreadyComplete: true };
  const { completed, total } = getCompletionStats(roadmap);

  const tasks = roadmap.roadmaps ?? [];
  const task = tasks.find((t) => t && String(t._id) === String(taskId));
  const taskStatus = String(task?.status ?? "").toLowerCase();
  const wasAlreadyComplete = taskStatus === "completed" || taskStatus === "complete";

  const newCompleted = wasAlreadyComplete ? completed : completed + 1;
  return { completed: newCompleted, total, wasAlreadyComplete };
}

function findPhaseContext(allRoadmaps: Roadmap[], currentPhaseId: string) {
  const idx = allRoadmaps.findIndex(
    (r) => String(r._id) === String(currentPhaseId),
  );
  const totalPhases = allRoadmaps.length;
  const currentPhaseNumber = idx >= 0 ? idx + 1 : 1;
  const nextPhase =
    idx >= 0 && idx + 1 < allRoadmaps.length ? allRoadmaps[idx + 1] : null;

  return {
    currentPhaseNumber,
    totalPhases,
    nextPhase,
    nextPhaseName: nextPhase?.name ?? "",
    nextPhaseRoadmapId: nextPhase?._id ?? null,
  };
}

function findNextAfterCurrentTask(
  roadmap: Roadmap,
  currentTaskId: string,
): string | null {
  const tasks = roadmap.roadmaps ?? [];
  const currentIdx = tasks.findIndex(
    (t) => t && String(t._id) === String(currentTaskId),
  );
  if (currentIdx < 0) return null;

  for (let i = currentIdx + 1; i < tasks.length; i++) {
    const t = tasks[i];
    if (!t) continue;
    const s = String(t.status ?? "").toLowerCase();
    if (s !== "completed" && s !== "complete") {
      return String(t._id);
    }
  }
  return null;
}

export function useCompletionCelebration() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = getReturnToParam(params as { returnTo?: string | string[] });
  const [celebration, setCelebration] = useState<CelebrationState>(INITIAL);

  /** Ref mirrors the latest celebration so handlers always read fresh values. */
  const stateRef = useRef<CelebrationState>(INITIAL);

  const goBackOrFallback = useCallback(
    (fallback?: Href) => {
      safeGoBack(router, { returnTo, fallback, role: "pastor" });
    },
    [router, returnTo],
  );

  const triggerCelebration = useCallback(
    (
      roadmap: Roadmap | undefined | null,
      taskId: string | undefined,
      taskName: string,
      allRoadmaps: Roadmap[],
    ) => {
      if (!roadmap || !taskId) return false;

      const { completed, total, wasAlreadyComplete } = computePostSaveStats(
        roadmap,
        taskId,
      );

      if (wasAlreadyComplete) return false;

      const phaseName = roadmap.name || "Current Phase";
      const phaseRoadmapId = String(roadmap._id);
      const isPhaseComplete = total > 0 && completed >= total;

      let next: CelebrationState;

      if (isPhaseComplete) {
        const ctx = findPhaseContext(allRoadmaps, phaseRoadmapId);
        const nextPhaseFirstTask = ctx.nextPhase
          ? getNextIncompleteNestedTaskId(ctx.nextPhase)
          : null;

        next = {
          kind: "phase",
          taskName,
          phaseName,
          completedCount: completed,
          totalCount: total,
          currentPhaseNumber: ctx.currentPhaseNumber,
          totalPhases: ctx.totalPhases,
          nextPhaseName: ctx.nextPhaseName,
          hasNextPhase: !!ctx.nextPhase && !!nextPhaseFirstTask,
          nextTaskId: nextPhaseFirstTask,
          phaseRoadmapId,
          nextPhaseRoadmapId: ctx.nextPhaseRoadmapId,
        };
      } else {
        const nextTaskId = getNextIncompleteNestedTaskId(roadmap);
        const resolvedNextTaskId =
          nextTaskId && String(nextTaskId) !== String(taskId)
            ? nextTaskId
            : findNextAfterCurrentTask(roadmap, taskId);

        next = {
          kind: "task",
          taskName,
          phaseName,
          completedCount: completed,
          totalCount: total,
          currentPhaseNumber: 0,
          totalPhases: 0,
          nextPhaseName: "",
          hasNextPhase: false,
          nextTaskId: resolvedNextTaskId,
          phaseRoadmapId,
          nextPhaseRoadmapId: null,
        };
      }

      stateRef.current = next;
      setCelebration(next);
      return true;
    },
    [],
  );

  const dismissCelebration = useCallback(() => {
    stateRef.current = INITIAL;
    setCelebration(INITIAL);
  }, []);

  const handleContinueJourney = useCallback(() => {
    const { nextTaskId, phaseRoadmapId } = stateRef.current;
    dismissCelebration();

    if (nextTaskId && phaseRoadmapId) {
      const nextHref = `/roadmap/${phaseRoadmapId}/${nextTaskId}` as Href;
      if (router.canGoBack()) {
        router.back();
        setTimeout(() => {
          router.push(nextHref);
        }, 300);
      } else {
        router.replace(nextHref);
      }
      return;
    }

    goBackOrFallback(
      phaseRoadmapId
        ? (`/(pastor)/(tabs)/roadmap/${phaseRoadmapId}` as const)
        : ("/(pastor)/(tabs)/roadmap" as const),
    );
  }, [dismissCelebration, goBackOrFallback, router]);

  const handleBackToPhase = useCallback(() => {
    const { phaseRoadmapId } = stateRef.current;
    dismissCelebration();

    goBackOrFallback(
      phaseRoadmapId
        ? (`/(pastor)/(tabs)/roadmap/${phaseRoadmapId}` as const)
        : ("/(pastor)/(tabs)/roadmap" as const),
    );
  }, [dismissCelebration, goBackOrFallback]);

  const handleStartNextPhase = useCallback(() => {
    const { nextPhaseRoadmapId, nextTaskId } = stateRef.current;
    dismissCelebration();

    const navigateToNextPhase = () => {
      if (nextPhaseRoadmapId && nextTaskId) {
        router.push(`/roadmap/${nextPhaseRoadmapId}/${nextTaskId}` as any);
      } else if (nextPhaseRoadmapId) {
        router.push(`/roadmap/${nextPhaseRoadmapId}` as any);
      }
    };

    if (router.canGoBack()) {
      router.back();
      setTimeout(navigateToNextPhase, 300);
      return;
    }

    if (nextPhaseRoadmapId && nextTaskId) {
      router.replace(`/roadmap/${nextPhaseRoadmapId}/${nextTaskId}` as any);
    } else if (nextPhaseRoadmapId) {
      router.replace(`/roadmap/${nextPhaseRoadmapId}` as any);
    } else {
      goBackOrFallback("/(pastor)/(tabs)/roadmap" as const);
    }
  }, [dismissCelebration, goBackOrFallback, router]);

  const handleBackToJourney = useCallback(() => {
    dismissCelebration();
    router.replace("/(pastor)/(tabs)/roadmap" as any);
  }, [dismissCelebration, router]);

  return {
    celebration,
    triggerCelebration,
    dismissCelebration,
    handleContinueJourney,
    handleBackToPhase,
    handleStartNextPhase,
    handleBackToJourney,
  };
}
