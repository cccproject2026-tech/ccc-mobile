import type { Assessment } from "@/types/assessment.types";

/** Assessments assigned to the pastor that they have not begun. */
export function isNewlyAssignedAssessment(assessment: Assessment): boolean {
  return assessment.status === "Not Started" || assessment.status === "Due";
}