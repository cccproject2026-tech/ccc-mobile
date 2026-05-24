import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useProgress } from "@/hooks/progress/useProgress";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";

export type PastorProgressOverviewStat = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
};

export function usePastorProgressOverview(hasIssuedCertificate?: boolean) {
  const { user } = useAuthStore();
  const pastorId = user?.id;

  const { data: progress, isLoading: isProgressLoading } = useProgress(pastorId);
  const { data: sessions = [], isLoading: isSessionsLoading } =
    usePastorSessions(pastorId);
  const { data: assessments = [], isLoading: isAssessmentsLoading } =
    useAssignedAssessments(pastorId);

  const stats = useMemo((): PastorProgressOverviewStat[] => {
    const sessionsCompleted = sessions.filter(
      (s) => s.status === "COMPLETED",
    ).length;
    const sessionsTotal = sessions.length;

    const assessmentsCompletedFromApi = progress?.assessments?.completed ?? 0;
    const assessmentsTotalFromApi = progress?.assessments?.total ?? 0;
    const assessmentsCompletedFallback = assessments.filter(
      (a) => (a.status || "").toLowerCase() === "completed",
    ).length;
    const assessmentsCompleted =
      assessmentsTotalFromApi > 0
        ? assessmentsCompletedFromApi
        : assessmentsCompletedFallback;
    const assessmentsTotal =
      assessmentsTotalFromApi > 0 ? assessmentsTotalFromApi : assessments.length;

    const roadmapPercent = Math.round(
      progress?.roadmaps?.percentage ?? progress?.overallProgress ?? 0,
    );

    const certificatesEarned = hasIssuedCertificate ? 1 : 0;

    return [
      {
        id: "sessions",
        icon: "people-outline",
        value: `${sessionsCompleted} / ${sessionsTotal}`,
        label: "Sessions Completed",
      },
      {
        id: "assessments",
        icon: "document-text-outline",
        value: `${assessmentsCompleted} / ${assessmentsTotal}`,
        label: "Assessments Completed",
      },
      {
        id: "roadmap",
        icon: "layers-outline",
        value: `${roadmapPercent}%`,
        label: "Roadmap Progress",
      },
      {
        id: "certificates",
        icon: "ribbon-outline",
        value: String(certificatesEarned),
        label: "Certificates Earned",
      },
    ];
  }, [
    assessments,
    hasIssuedCertificate,
    progress?.assessments?.completed,
    progress?.assessments?.total,
    progress?.overallProgress,
    progress?.roadmaps?.percentage,
    sessions,
  ]);

  return {
    stats,
    isLoading: isProgressLoading || isSessionsLoading || isAssessmentsLoading,
  };
}
