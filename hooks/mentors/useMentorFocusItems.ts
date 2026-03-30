import type { PastorFocusItem, PastorFocusSection } from "@/components/sheets/PastorFocusBottomSheet";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useAuthStore } from "@/stores";
import { assessmentService } from "@/services/assessment.service";
import { roadmapService } from "@/services/roadmap.service";
import type { Appointment } from "@/types/appointment.types";
import { format } from "date-fns";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const MAX_ITEMS_PER_SECTION = 3;
const MAX_MENTEES_FOR_FOCUS = 5;
const MAX_ASSESSMENTS_PER_MENTEE_FOR_SURVEY = 3;
const MAX_ROADMAPS_PER_MENTEE_FOR_QUERIES = 4;
const MAX_ROADMAPS_FOR_QUERIES_TOTAL = 10;

const toEpochMs = (value?: string | null) => {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "dd MMM, h:mm a");
};

const toDateOnlyISO = () => {
  // Using ISO for consistent "today" comparisons with appointment.meetingDate.split("T")[0]
  return new Date().toISOString().split("T")[0];
};

const clampByLimit = <T,>(arr: T[], limit: number) => arr.slice(0, Math.max(0, limit));

type MentorFocusResult = {
  pastorQueries: PastorFocusItem[];
  surveySubmissions: PastorFocusItem[];
};

export const useMentorFocusItems = () => {
  const { user } = useAuthStore();

  const mentorId = user?.id;
  const todayISO = useMemo(() => toDateOnlyISO(), []);

  const {
    appointments,
    isLoading: isLoadingAppointments,
    getAppointmentsByDate,
    getUpcomingAppointments,
  } = useAppointments({ mentorId });

  // Assigned mentees (these are the "Pastors" the mentor supports)
  const {
    data: menteesData,
    isLoading: isLoadingMentees,
  } = useMentees(MAX_MENTEES_FOR_FOCUS, mentorId);

  const allRoadmapsQuery = useAllRoadmaps();
  const { data: assessments, isLoading: isLoadingAssessments } = useAssessments();

  const mentees = useMemo(() => {
    const pages = menteesData?.pages ?? [];
    const all = pages.flatMap((p) => p.mentees ?? []);
    return all;
  }, [menteesData]);

  const menteeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of mentees as any[]) {
      if (!m?.id) continue;
      const name = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim();
      map.set(String(m.id), name || "Pastor");
    }
    return map;
  }, [mentees]);

  const roadmaps = allRoadmapsQuery.data ?? [];
  const roadmapNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of roadmaps as any[]) {
      if (!r?._id) continue;
      map.set(String(r._id), String(r.name ?? "Roadmap"));
    }
    return map;
  }, [roadmaps]);

  const assessmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    (assessments ?? []).forEach((a: any) => {
      if (!a?._id) return;
      map.set(String(a._id), String(a.name ?? a.title ?? "Survey"));
    });
    return map;
  }, [assessments]);

  const mentorshipSessionsToday = useMemo(() => {
    if (!appointments?.length) return [];
    const todays = getAppointmentsByDate(todayISO).sort((a, b) => toEpochMs(a.meetingDate) - toEpochMs(b.meetingDate));
    return clampByLimit(
      todays.map((apt: Appointment) => {
        const pastorName = menteeNameById.get(apt.userId) ?? "Pastor";
        return {
          id: `mentor-today-session-${apt.id}`,
          title: "Mentorship session",
          description: `Meeting starts ${formatDateTime(apt.meetingDate)}.`,
          meta: `${pastorName} • ${apt.platform}`,
          accentColor: "#38BDF8",
          route: {
            pathname: "/appointments",
            params: {},
          },
        } as PastorFocusItem;
      }),
      MAX_ITEMS_PER_SECTION,
    );
  }, [appointments, getAppointmentsByDate, todayISO, menteeNameById]);

  const otherMeetings = useMemo(() => {
    if (!appointments?.length) return [];
    const upcoming = getUpcomingAppointments()
      .filter((apt: Appointment) => apt.meetingDate?.split("T")?.[0] !== todayISO)
      .sort((a, b) => toEpochMs(a.meetingDate) - toEpochMs(b.meetingDate));

    return clampByLimit(
      upcoming.map((apt: Appointment) => {
        const pastorName = menteeNameById.get(apt.userId) ?? "Pastor";
        return {
          id: `mentor-other-meeting-${apt.id}`,
          title: "Upcoming meeting",
          description: `Meeting starts ${formatDateTime(apt.meetingDate)}.`,
          meta: `${pastorName} • ${apt.platform}`,
          accentColor: "#22C55E",
          route: {
            pathname: "/appointments",
            params: {},
          },
        } as PastorFocusItem;
      }),
      MAX_ITEMS_PER_SECTION,
    );
  }, [appointments, getUpcomingAppointments, todayISO, menteeNameById]);

  const { data: focusResult, isLoading: isLoadingFocusResult } = useQuery<MentorFocusResult>({
    queryKey: [
      "mentor-focus",
      mentorId ?? "",
      mentees.map((m: any) => m.id).join(","),
      roadmaps.map((r: any) => r._id).slice(0, 20).join(","),
    ],
    enabled:
      !!mentorId && mentees.length > 0 && !allRoadmapsQuery.isLoading && !isLoadingAssessments,
    staleTime: 0,
    retry: 1,
    queryFn: async () => {
      // Pre-limit roadmaps to reduce nested calls.
      const uniqueRoadmapIds: string[] = [];
      const seenRoadmaps = new Set<string>();

      for (const m of mentees as any[]) {
        const ids: string[] = (m.assignedRoadmapIds ?? []).map((x: any) => String(x));
        const limited = clampByLimit(ids, MAX_ROADMAPS_PER_MENTEE_FOR_QUERIES);
        for (const rid of limited) {
          if (seenRoadmaps.has(rid)) continue;
          seenRoadmaps.add(rid);
          uniqueRoadmapIds.push(rid);
          if (uniqueRoadmapIds.length >= MAX_ROADMAPS_FOR_QUERIES_TOTAL) break;
        }
        if (uniqueRoadmapIds.length >= MAX_ROADMAPS_FOR_QUERIES_TOTAL) break;
      }

      // 1) Pastor queries
      const pastorQueryTemp: { item: PastorFocusItem; sortAtMs: number }[] = [];
      const seenQueryIds = new Set<string>();

      await Promise.all(
        (mentees as any[]).map(async (mentee: any) => {
          const pastorId = String(mentee.id);
          const pastorName = menteeNameById.get(pastorId) ?? "Pastor";

          for (const rid of uniqueRoadmapIds) {
            try {
              const threads = await roadmapService.getRoadmapQueries(rid, pastorId);
              const roadmapName = roadmapNameById.get(rid) ?? "Roadmap";

              const pending = (threads ?? [])
                .flatMap((t: any) => t?.queries ?? [])
                .filter((q: any) => q?.status === "pending");

              for (const q of pending) {
                const qid = String(q._id ?? q.id);
                if (!qid || seenQueryIds.has(qid)) continue;
                seenQueryIds.add(qid);

                const createdAt = q.createdDate ?? q.created_at ?? null;
              const createdAtMs = toEpochMs(createdAt);
              const createdAtFormatted = formatDateTime(createdAt);

              pastorQueryTemp.push({
                item: {
                  id: `pastor-query-${qid}`,
                  title: "Pastor query",
                  description:
                    String(q.actualQueryText ?? "").slice(0, 140) ||
                    "Query needs response.",
                  meta: `${roadmapName} • ${createdAtFormatted}`,
                  accentColor: "#FB7185",
                  route: {
                    pathname: "/(mentor)/roadmap/queries",
                    params: {
                      roadmapId: rid,
                      userId: pastorId,
                      menteeName: pastorName,
                    },
                  },
                },
                sortAtMs: createdAtMs,
              });
              }
            } catch {
              // Swallow per-roadmap errors so the home screen still renders.
              continue;
            }
          }
        }),
      );

      pastorQueryTemp.sort((a, b) => b.sortAtMs - a.sortAtMs);
      const pastorQueries = clampByLimit(
        pastorQueryTemp.map((x) => x.item),
        MAX_ITEMS_PER_SECTION,
      );

      // 2) Survey submissions (pastor -> mentor review)
      const surveySubmissionTemp: { item: PastorFocusItem; sortAtMs: number }[] = [];
      const seenSubmissionKeys = new Set<string>();

      // Candidate assessments per pastor to keep API calls bounded.
      await Promise.all(
        (mentees as any[]).map(async (mentee: any) => {
          const pastorId = String(mentee.id);
          const pastorName = menteeNameById.get(pastorId) ?? "Pastor";

          const assessmentIds: string[] = (mentee.assignedAssessmentIds ?? []).map((x: any) => String(x));
          const limitedAssessmentIds = clampByLimit(assessmentIds, MAX_ASSESSMENTS_PER_MENTEE_FOR_SURVEY);

          for (const aid of limitedAssessmentIds) {
            try {
              const res = await assessmentService.fetchAnswers(aid, pastorId);
              if (!res?.success || !res?.data) continue;

              const answers = res.data;
              const hasSections = Array.isArray(answers.sections) && answers.sections.length > 0;
              const hasPreSurvey = !!answers.preSurveySubmittedAt;

              if (!hasSections && !hasPreSurvey) continue;

              const submittedAt = answers.preSurveySubmittedAt ?? answers.createdAt;
              const recommendationsSentByMentor = answers.recommendationsSentByMentor;

              // Mentor should focus on ones that are not yet recommended/sent by mentor.
              if (recommendationsSentByMentor === true) continue;

              const key = `${aid}-${pastorId}`;
              if (seenSubmissionKeys.has(key)) continue;
              seenSubmissionKeys.add(key);

              const assessmentTitle = assessmentNameById.get(aid) ?? "Survey submission";

              const preSurveyFlag = answers.preSurveySubmittedAt ? "true" : "false";

              const submittedAtMs = toEpochMs(submittedAt);

              surveySubmissionTemp.push({
                item: {
                  id: `survey-${key}`,
                  title: assessmentTitle,
                  description:
                    "Survey submitted and awaiting your recommendation.",
                  meta: `${pastorName} • ${formatDateTime(submittedAt)}`,
                  accentColor: "#A78BFA",
                  route: {
                    pathname: "/(mentor)/assessments/answer-questions",
                    params: {
                      assessmentId: aid,
                      viewMode: "true",
                      targetUserId: pastorId,
                      hasPreSurvey: preSurveyFlag,
                      scheduleMeeting: "false",
                    },
                  },
                },
                sortAtMs: submittedAtMs,
              });
            } catch {
              continue;
            }
          }
        }),
      );

      // Time order: oldest first (more urgent items first).
      surveySubmissionTemp.sort((a, b) => a.sortAtMs - b.sortAtMs);
      const surveySubmissions = clampByLimit(
        surveySubmissionTemp.map((x) => x.item),
        MAX_ITEMS_PER_SECTION,
      );

      return { pastorQueries, surveySubmissions };
    },
  });

  const sections: PastorFocusSection[] = useMemo(() => {
    const pastorQueries = focusResult?.pastorQueries ?? [];
    const surveySubmissions = focusResult?.surveySubmissions ?? [];

    return [
      {
        id: "mentorship-sessions-today",
        title: "Today's Mentorship Sessions",
        emptyMessage: "No mentorship sessions today.",
        items: mentorshipSessionsToday,
      },
      {
        id: "other-meetings",
        title: "Other Meetings",
        emptyMessage: "No other meetings coming up.",
        items: otherMeetings,
      },
      {
        id: "pastor-queries",
        title: "Pastor Queries",
        emptyMessage: "No pending pastor queries right now.",
        items: pastorQueries,
      },
      {
        id: "survey-submissions",
        title: "Survey Submissions (in time order)",
        emptyMessage: "No survey submissions pending review.",
        items: surveySubmissions,
      },
    ];
  }, [focusResult?.pastorQueries, focusResult?.surveySubmissions, mentorshipSessionsToday, otherMeetings]);

  const isLoading =
    isLoadingAppointments ||
    isLoadingMentees ||
    allRoadmapsQuery.isLoading ||
    isLoadingAssessments ||
    isLoadingFocusResult ||
    false;

  return { sections, isLoading };
};

