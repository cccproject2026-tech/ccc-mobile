import type { Assessment } from "@/types/assessment.types";
import type { Roadmap } from "@/lib/roadmap/types";
import { getCompletionStats, isPastorPhaseNewlyAssigned } from "@/lib/roadmap/helpers";
import { format } from "date-fns";

export function parseAssignmentTimestamp(iso?: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

export function getAssessmentAssignmentSortTs(assessment: Assessment): number {
  return (
    parseAssignmentTimestamp(assessment.assignedAt) ??
    parseAssignmentTimestamp(assessment.updatedAt) ??
    0
  );
}

export function getRoadmapAssignmentSortTs(roadmap: Roadmap): number {
  return (
    parseAssignmentTimestamp(roadmap.assignedAt) ??
    parseAssignmentTimestamp(roadmap.updatedAt) ??
    parseAssignmentTimestamp(roadmap.createdAt) ??
    0
  );
}

export function formatAssignmentDateTime(sortTs: number): string {
  if (!sortTs) return "";
  const date = new Date(sortTs);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "dd MMM yyyy, h:mm a");
}

export function isNewlyAssignedAssessment(assessment: Assessment): boolean {
  return assessment.status === "Not Started" || assessment.status === "Due";
}

export function isNewlyAssignedRoadmapCandidate(roadmap: Roadmap): boolean {
  if (roadmap.assignedAt) {
    const s = (roadmap.status || "").toLowerCase().trim();
    return s !== "completed" && s !== "complete" && s !== "done";
  }
  const { completed } = getCompletionStats(roadmap);
  if (completed === 0) return true;
  return isPastorPhaseNewlyAssigned(roadmap);
}

export type NewAssignmentHomeKind = "roadmap" | "assessment";

export type NewAssignmentHomeItem = {
  kind: NewAssignmentHomeKind;
  id: string;
  title: string;
  sortTs: number;
  assignedLabel: string;
  roadmap?: Roadmap;
  assessment?: Assessment;
};