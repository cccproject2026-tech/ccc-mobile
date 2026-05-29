import {
  sessionOrdinalLabel,
  sessionTopicLine,
} from "@/constants/sessionTitles";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedAssessments } from "@/hooks/assessments/useAssignedAssessments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorNewAssignmentsHome } from "@/hooks/pastor/usePastorNewAssignmentsHome";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { appointmentService } from "@/services/appointments.service";
import { roadmapService } from "@/services/roadmap.service";
import { useAuthStore } from "@/stores";
import { Assessment } from "@/types/assessment.types";
import { Appointment } from "@/types/appointment.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useMemo } from "react";
import {
  comparePastorPhasesForHome,
  getCompletionStats,
  getNestedTaskTitleById,
  getNextIncompleteNestedTaskId,
  isPastorPhaseInFocus,
  resolveRoadmapThreadId,
} from "@/lib/roadmap/helpers";
import {
  MentorInfo,
  Roadmap,
  RoadmapComment,
  RoadmapCommentAuthor,
  RoadmapQuery,
} from "@/lib/roadmap/types";
import type {
  PastorFocusItem,
  PastorFocusSection,
} from "@/components/sheets/PastorFocusBottomSheet";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";

const UPCOMING_DUE_WINDOW_DAYS = 7;
const MAX_ITEMS_PER_SECTION = 3;

const isCancelledAppointment = (appointment: Appointment) => {
  const status = String(appointment.status ?? "").trim().toLowerCase();
  return (
    status === "cancelled" ||
    status === "canceled" ||
    status.startsWith("cancel")
  );
};

const toTimestamp = (value?: string | null) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

const isWithinDays = (value: string | undefined, days: number) => {
  const timestamp = toTimestamp(value);
  const now = Date.now();
  return timestamp >= now && timestamp <= now + days * 24 * 60 * 60 * 1000;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "dd MMM, h:mm a");
};

const getMentorName = (mentor?: MentorInfo | string) => {
  if (!mentor || typeof mentor === "string") {
    return "Mentor";
  }
  return `${mentor.firstName} ${mentor.lastName}`.trim();
};

/** Exported for query invalidation when roadmap comments change. */
export const PASTOR_FOCUS_FEEDBACK_QUERY_KEY = "pastor-focus-feedback" as const;

/**
 * Show roadmap thread items that are mentor feedback for the pastor.
 * API sometimes sets mentorId._id equal to thread userId while role is still "mentor" — trust role in that case.
 */
const isCommentMentorFeedbackForPastor = (
  comment: RoadmapComment,
  pastorUserId?: string | null,
) => {
  const author = comment.mentorId as RoadmapCommentAuthor | string | null | undefined;

  if (author == null) return false;

  if (typeof author === "string") {
    const id = author.trim();
    if (!id) return false;
    if (pastorUserId && id === pastorUserId) return false;
    return true;
  }

  if (typeof author !== "object") return false;

  const r = String(author.role ?? "").toLowerCase().trim();
  if (r === "pastor" || r === "director") return false;

  const isMentorRole =
    r === "mentor" ||
    r === "field mentor" ||
    (r.length > 0 && /\bmentor\b/.test(r));
  if (isMentorRole) return true;

  const aid = String(author._id ?? "").trim();
  if (pastorUserId && aid === pastorUserId) return false;
  return true;
};

const toTitleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getSchedulerLabel = (
  appointment: Appointment,
  userId?: string,
  mentorNameById?: Map<string, string>,
): string => {
  const apt = appointment as Appointment & Record<string, any>;
  const source =
    apt.scheduledBy ??
    apt.createdBy ??
    apt.scheduler ??
    apt.bookedBy ??
    apt.createdByUser ??
    null;

  const roleRaw =
    apt.scheduledByRole ??
    apt.createdByRole ??
    (typeof source === "object" ? source?.role : source) ??
    "";

  const nameRaw =
    apt.scheduledByName ??
    apt.createdByName ??
    (typeof source === "object"
      ? source?.name ??
        `${source?.firstName ?? ""} ${source?.lastName ?? ""}`.trim()
      : "");

  const role = String(roleRaw || "").trim();
  const name = String(nameRaw || "").trim();
  if (!role && !name) {
    if (userId && appointment.userId === userId) {
      return "Scheduled by Pastor (You)";
    }
    const mentorName = mentorNameById?.get(appointment.mentorId);
    if (mentorName) {
      return `Scheduled by Mentor ${mentorName}`;
    }
    return "Scheduled by Mentor";
  }

  if (role && name) return `Scheduled by ${toTitleCase(role)} ${name}`;
  if (role) return `Scheduled by ${toTitleCase(role)}`;
  return `Scheduled by ${name}`;
};

const getWithWhomLabel = (
  appointment: Appointment,
  mentorNameById?: Map<string, string>,
): string => {
  const mentorName = mentorNameById?.get(appointment.mentorId);
  if (mentorName) return `With Mentor ${mentorName}`;
  return "With Mentor";
};

export const usePastorFocusItems = () => {
  const { user } = useAuthStore();
  const pastorId = user?.id;
  const {
    appointments,
    isLoading: isAppointmentsLoading,
    getUpcomingAppointments,
  } = useAppointments({
    userId: pastorId,
    futureOnly: false,
  });
  const { data: mentorshipSessions = [], isLoading: isSessionsLoading } =
    usePastorSessions(pastorId);
  const { mentors } = useAssignedMentors(pastorId ?? null);
  const { data: roadmaps = [], isLoading: isRoadmapsLoading } = useRoadmaps(
    "pastor",
    user?.id,
  );
  const { data: assessments = [], isLoading: isAssessmentsLoading } =
    useAssignedAssessments(user?.id);
  const { visibleItems: newAssignmentHomeItems } = usePastorNewAssignmentsHome(
    user?.id,
    roadmaps,
    assessments,
  );

  const feedbackQuery = useQuery({
    queryKey: [PASTOR_FOCUS_FEEDBACK_QUERY_KEY, user?.id, roadmaps.map((r) => r._id).join(",")],
    enabled: !!user?.id && roadmaps.length > 0,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const uid = user!.id;
      const feedback = await Promise.all(
        roadmaps.flatMap((roadmap) => {
          const nestedTasks = (roadmap.roadmaps ?? []).filter(Boolean);
          const threadTargets =
            nestedTasks.length > 0
              ? nestedTasks.map((task) => ({
                  threadId: resolveRoadmapThreadId(task._id, roadmap._id)!,
                  label: `${roadmap.name} • ${task.name}`,
                }))
              : [
                  {
                    threadId: resolveRoadmapThreadId(undefined, roadmap._id)!,
                    label: roadmap.name,
                  },
                ];

          return threadTargets.map(async ({ threadId, label }) => {
            try {
              const [commentsThread, queries] = await Promise.all([
                roadmapService.getRoadmapComments(threadId, uid),
                roadmapService.getRoadmapQueries(threadId, uid),
              ]);

              const raw = commentsThread as { comments?: RoadmapComment[]; Comments?: RoadmapComment[] };
              const comments =
                (Array.isArray(raw.comments) && raw.comments) ||
                (Array.isArray(raw.Comments) && raw.Comments) ||
                [];

              const flatQueries = (Array.isArray(queries) ? queries : []).flatMap((thread) =>
                (thread.queries || []).map((query) => ({
                  ...query,
                  roadmapId: threadId,
                  roadmapName: label,
                })),
              );

              return {
                roadmapId: threadId,
                roadmapName: label,
                comments,
                queries: flatQueries,
              };
            } catch {
              return {
                roadmapId: threadId,
                roadmapName: label,
                comments: [] as RoadmapComment[],
                queries: [] as (RoadmapQuery & { roadmapId: string; roadmapName: string })[],
              };
            }
          });
        }),
      );

      return feedback;
    },
  });

  const startOfTodayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const mentorshipAppointmentIds = useMemo(() => {
    const ids = new Set<string>();
    for (const session of mentorshipSessions) {
      if (
        session.appointmentId &&
        String(session.status).toUpperCase() === "SCHEDULED"
      ) {
        ids.add(String(session.appointmentId));
      }
    }
    return ids;
  }, [mentorshipSessions]);

  const isMentorshipAppointment = useCallback(
    (appointment: Appointment) =>
      mentorshipAppointmentIds.has(String(appointment.id)),
    [mentorshipAppointmentIds],
  );

  const sections = useMemo<PastorFocusSection[]>(() => {
    const mentorNameById = new Map(
      (mentors || []).map((mentor) => [mentor.id, mentor.name]),
    );

    const appointmentById = new Map(
      (appointments || []).map((apt) => [String(apt.id), apt]),
    );

    const toMentorshipSessionItem = (
      session: (typeof mentorshipSessions)[number],
    ): PastorFocusItem => {
      const apt = session.appointmentId
        ? appointmentById.get(String(session.appointmentId))
        : undefined;
      const joinUrl = getAppointmentJoinUrl(apt) ?? session.meetingLink ?? null;
      const when = formatDateTime(session.scheduledDate);

      return {
        id: `mentorship-session-${session.id}`,
        title: sessionTopicLine(session.sessionNumber),
        description: when
          ? `Starts ${when}`
          : "Scheduled mentorship session",
        meta: joinUrl
          ? `${sessionOrdinalLabel(session.sessionNumber)} • Join link ready`
          : `${sessionOrdinalLabel(session.sessionNumber)} • Link pending`,
        accentColor: "#38BDF8",
        route: session.appointmentId
          ? {
              pathname: "/appointments/meeting-details",
              params: { appointmentId: String(session.appointmentId) },
            }
          : {
              pathname: `/(pastor)/(tabs)/sessions/${session.id}`,
            },
      };
    };

    const dayEnd = startOfTodayLocal.getTime() + 24 * 60 * 60 * 1000;
    const scheduledSessions = (mentorshipSessions || []).filter(
      (s) => String(s.status).toUpperCase() === "SCHEDULED",
    );

    const mentorshipTodayItems: PastorFocusItem[] = scheduledSessions
      .filter((session) => {
        const date = new Date(session.scheduledDate);
        if (Number.isNaN(date.getTime())) return false;
        return date.toDateString() === startOfTodayLocal.toDateString();
      })
      .sort(
        (a, b) =>
          toTimestamp(a.scheduledDate) - toTimestamp(b.scheduledDate),
      )
      .map(toMentorshipSessionItem)
      .slice(0, MAX_ITEMS_PER_SECTION);

    const mentorshipUpcomingItems: PastorFocusItem[] = scheduledSessions
      .filter((session) => {
        const date = new Date(session.scheduledDate);
        if (Number.isNaN(date.getTime())) return false;
        return date.getTime() > dayEnd;
      })
      .sort(
        (a, b) =>
          toTimestamp(a.scheduledDate) - toTimestamp(b.scheduledDate),
      )
      .map(toMentorshipSessionItem)
      .slice(0, MAX_ITEMS_PER_SECTION);

    const newAssignmentItems: PastorFocusItem[] = newAssignmentHomeItems.map(
      (item) => {
        if (item.kind === "roadmap" && item.roadmap) {
          const roadmap = item.roadmap;
          return {
            id: `new-assignment-roadmap-${item.id}`,
            title: item.title,
            description: "A new roadmap phase has been assigned to you.",
            meta: item.assignedLabel
              ? `Assigned ${item.assignedLabel}`
              : "Newly assigned",
            accentColor: "#FBBF24",
            route: {
              pathname: `/roadmap/${roadmap._id}`,
            },
          };
        }

        return {
          id: `new-assignment-assessment-${item.id}`,
          title: item.title,
          description: "A new assessment has been assigned to you.",
          meta: item.assignedLabel
            ? `Assigned ${item.assignedLabel}`
            : "Newly assigned",
          accentColor: "#A78BFA",
          route: {
            pathname: "/assessments/survey-guidelines",
            params: { assessmentId: item.id },
          },
        };
      },
    );

    const newAssignmentRoadmapIds = new Set(
      newAssignmentHomeItems
        .filter((i) => i.kind === "roadmap")
        .map((i) => i.id),
    );

    const roadmapItems: PastorFocusItem[] = roadmaps
      .filter((roadmap) => isPastorPhaseInFocus(roadmap))
      .filter((roadmap) => !newAssignmentRoadmapIds.has(String(roadmap._id)))
      .sort(comparePastorPhasesForHome)
      .slice(0, MAX_ITEMS_PER_SECTION)
      .map((roadmap) => {
        const { completed, total } = getCompletionStats(roadmap);
        const nextTaskId = getNextIncompleteNestedTaskId(roadmap);
        const nextTaskName = getNestedTaskTitleById(roadmap, nextTaskId);
        const meta = `In progress • ${completed} of ${total} tasks`;

        return {
          id: `roadmap-phase-${roadmap._id}`,
          title: roadmap.name || "Roadmap phase",
          description: nextTaskName
            ? `Next: ${nextTaskName}`
            : "Continue your revitalization journey.",
          meta,
          accentColor: "#22C55E",
          route: nextTaskId
            ? {
                pathname: `/roadmap/${roadmap._id}/${nextTaskId}`,
              }
            : {
                pathname: `/roadmap/${roadmap._id}`,
              },
        };
      });

    const otherMeetingItems: PastorFocusItem[] = getUpcomingAppointments()
      .filter((appointment: Appointment) => !isMentorshipAppointment(appointment))
      .filter((appointment: Appointment) => !isCancelledAppointment(appointment))
      .filter((appointment: Appointment) =>
        appointmentService.isUpcoming(appointment.meetingDate),
      )
      .sort(
        (a: Appointment, b: Appointment) =>
          toTimestamp(a.meetingDate) - toTimestamp(b.meetingDate),
      )
      .slice(0, MAX_ITEMS_PER_SECTION)
      .map((appointment: Appointment) => {
        const scheduler = getSchedulerLabel(appointment, user?.id, mentorNameById);
        const withWhom = getWithWhomLabel(appointment, mentorNameById);
        const mentorName = mentorNameById.get(appointment.mentorId);
        return {
          id: `other-meeting-${appointment.id}`,
          title: mentorName ? `Meeting with ${mentorName}` : "Upcoming meeting",
          description: `Starts ${formatDateTime(appointment.meetingDate)}.`,
          meta: `${scheduler} • ${withWhom}`,
          accentColor: "#22C55E",
          route: {
            pathname: "/appointments/meeting-details",
            params: { appointmentId: String(appointment.id) },
          },
        };
      });

    const assessmentItems: PastorFocusItem[] = (assessments || [])
      .filter((assessment: Assessment) => {
        if (
          assessment.status === "Completed" ||
          assessment.status === "Submitted"
        ) {
          return false;
        }
        return true;
      })
      .sort((a: Assessment, b: Assessment) => {
        return toTimestamp(a.dueDate) - toTimestamp(b.dueDate);
      })
      .slice(0, MAX_ITEMS_PER_SECTION)
      .map((assessment: Assessment) => {
        return {
          id: `assessment-${assessment.id}`,
          title: assessment.title,
          description: assessment.description,
          meta: assessment.dueDate
            ? `Due ${formatDateTime(assessment.dueDate)}`
            : "Assessment pending",
          accentColor: "#A78BFA",
          route: {
            pathname: "/assessments/survey-guidelines",
            params: { assessmentId: assessment.id },
          },
        };
      });

    const threadRouteParams = (threadId: string) => ({
      roadmapId: threadId,
      taskId: threadId,
    });

    const mentorCommentItems: PastorFocusItem[] = (feedbackQuery.data || [])
      .flatMap((entry) =>
        (entry.comments || [])
          .filter((comment: RoadmapComment) =>
            isCommentMentorFeedbackForPastor(comment, user?.id),
          )
          .map((comment: RoadmapComment) => {
            const author = comment.mentorId as RoadmapCommentAuthor | string | undefined;
            const title =
              typeof author === "object" && author
                ? `${author.firstName?.trim() || "Mentor"} commented`
                : "Mentor commented";
            return {
              id: `comment-${comment._id}`,
              title,
              description: comment.text,
              meta: `${entry.roadmapName} • ${formatDateTime(comment.addedDate)}`,
              accentColor: "#F472B6",
              sortKey: comment.addedDate,
              route: {
                pathname: "/roadmap/comments",
                params: threadRouteParams(entry.roadmapId),
              },
            };
          }),
      )
      .sort((a: any, b: any) => toTimestamp(b.sortKey) - toTimestamp(a.sortKey))
      .slice(0, MAX_ITEMS_PER_SECTION);

    const mentorQueryReplyItems: PastorFocusItem[] = (feedbackQuery.data || [])
      .flatMap((entry) =>
        (entry.queries || [])
          .filter(
            (query: RoadmapQuery & { roadmapId: string; roadmapName: string }) =>
              query.status === "answered" && !!query.repliedAnswer,
          )
          .map((query: RoadmapQuery & { roadmapId: string; roadmapName: string }) => ({
            id: `query-${query._id}`,
            title: `${getMentorName(query.repliedMentorId)} replied`,
            description: query.repliedAnswer || query.actualQueryText,
            meta: `${query.roadmapName} • ${formatDateTime(query.repliedDate || query.createdDate)}`,
            accentColor: "#FB7185",
            sortKey: query.repliedDate || query.createdDate,
            route: {
              pathname: "/roadmap/queries",
              params: { ...threadRouteParams(query.roadmapId), tab: "ANSWERED" },
            },
          })),
      )
      .sort((a: any, b: any) => toTimestamp(b.sortKey) - toTimestamp(a.sortKey))
      .slice(0, MAX_ITEMS_PER_SECTION);

    return [
      {
        id: "new-assignments",
        title: "New assignments",
        emptyMessage:
          "No new assignments right now. New roadmaps and assessments will appear here when assigned.",
        items: newAssignmentItems,
      },
      {
        id: "roadmaps",
        title: "Work on your roadmap",
        emptyMessage: "No roadmap phases assigned right now.",
        items: roadmapItems,
      },
      {
        id: "mentorship-sessions",
        title: "Today's session",
        emptyMessage: "No mentorship sessions scheduled for today.",
        items: mentorshipTodayItems,
      },
      {
        id: "mentorship-sessions-upcoming",
        title: "Upcoming sessions",
        emptyMessage: "No upcoming mentorship sessions.",
        items: mentorshipUpcomingItems,
      },
      {
        id: "other-meetings",
        title: "Upcoming",
        emptyMessage:
          "No other meetings scheduled. Extra mentor meetings (outside the mentorship program) appear here. Program sessions are under Mentorship Session.",
        items: otherMeetingItems,
      },
      {
        id: "assessments",
        title: "Complete assessments",
        emptyMessage: "You're all caught up on assessments.",
        items: assessmentItems,
      },
      {
        id: "mentor-comments",
        title: "Mentor comments",
        emptyMessage:
          "No new mentor comments right now. When your mentor comments on a roadmap task, it will appear here.",
        items: mentorCommentItems,
      },
      {
        id: "mentor-query-replies",
        title: "Answered queries",
        emptyMessage:
          "No answered queries yet. When your mentor replies to a question you submitted, it will appear here.",
        items: mentorQueryReplyItems,
      },
    ];
  }, [
    appointments,
    assessments,
    feedbackQuery.data,
    getUpcomingAppointments,
    isMentorshipAppointment,
    mentorshipSessions,
    mentors,
    newAssignmentHomeItems,
    roadmaps,
    startOfTodayLocal,
    user?.id,
  ]);

  return {
    sections,
    isLoading:
      isAppointmentsLoading ||
      isSessionsLoading ||
      isRoadmapsLoading ||
      isAssessmentsLoading ||
      feedbackQuery.isLoading,
  };
};
