import {
  formatAssignmentDateTime,
  getAssessmentAssignmentSortTs,
  getRoadmapAssignmentSortTs,
  isNewlyAssignedAssessment,
  isNewlyAssignedRoadmapCandidate,
  NewAssignmentHomeItem,
} from "@/lib/pastor/newAssignments";
import type { Roadmap } from "@/lib/roadmap/types";
import type { Assessment } from "@/types/assessment.types";
import { useMemo } from "react";

const NEW_ASSIGNMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

function isWithin24Hours(assignedTs: number): boolean {
  if (!assignedTs) return false;
  return Date.now() - assignedTs <= NEW_ASSIGNMENT_WINDOW_MS;
}

export function usePastorNewAssignmentsHome(
  _userId: string | undefined,
  roadmaps: Roadmap[] | undefined,
  assessments: Assessment[],
) {
  const visibleItems = useMemo<NewAssignmentHomeItem[]>(() => {
    const items: NewAssignmentHomeItem[] = [];

    for (const roadmap of roadmaps ?? []) {
      if (!isNewlyAssignedRoadmapCandidate(roadmap)) continue;
      const sortTs = getRoadmapAssignmentSortTs(roadmap);
      if (!isWithin24Hours(sortTs)) continue;
      items.push({
        kind: "roadmap",
        id: String(roadmap._id),
        title: roadmap.name || "Roadmap phase",
        sortTs,
        assignedLabel: formatAssignmentDateTime(sortTs),
        roadmap,
      });
    }

    for (const assessment of assessments) {
      if (!isNewlyAssignedAssessment(assessment)) continue;
      const sortTs = getAssessmentAssignmentSortTs(assessment);
      if (!isWithin24Hours(sortTs)) continue;
      items.push({
        kind: "assessment",
        id: assessment.id,
        title: assessment.title,
        sortTs,
        assignedLabel: formatAssignmentDateTime(sortTs),
        assessment,
      });
    }

    return items.sort((a, b) => b.sortTs - a.sortTs);
  }, [roadmaps, assessments]);

  return {
    visibleItems,
    hasNewAssignments: visibleItems.length > 0,
  };
}