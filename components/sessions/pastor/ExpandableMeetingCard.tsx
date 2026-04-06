import {
  NoteCard,
  formatSessionTime,
} from "@/components/sessions/SessionFlowShared";
import { formatSessionDate } from "@/utils/date";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { MeetingAiSummary } from "./MeetingAiSummary";
import { MeetingTranscript } from "./MeetingTranscript";
import { MeetingStatusUi, PastorMeetingUi } from "./pastorSessionDetail.types";
import { usePastorMeetingLayout } from "./usePastorMeetingLayout";

const SP = 16;

function statusLabel(status: MeetingStatusUi): string {
  switch (status) {
    case "SCHEDULED":
      return "Scheduled";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "RESCHEDULED":
      return "Rescheduled";
    default:
      return status;
  }
}

function statusBadgeStyle(status: MeetingStatusUi): ViewStyle {
  switch (status) {
    case "COMPLETED":
      return { backgroundColor: "rgba(22, 163, 74, 0.35)" };
    case "CANCELLED":
      return { backgroundColor: "rgba(248, 113, 113, 0.25)" };
    case "RESCHEDULED":
      return { backgroundColor: "rgba(250, 204, 21, 0.22)" };
    default:
      return { backgroundColor: "rgba(59, 130, 246, 0.28)" };
  }
}

type Props = {
  meeting: PastorMeetingUi;
  joinButton?: React.ReactNode;
};

/** Full session detail (no accordion): header + notes + transcript + AI summary */
export function ExpandableMeetingCard({ meeting, joinButton }: Props) {
  const { horizontalPad: padH, cardRadius } = usePastorMeetingLayout();

  return (
    <View style={[styles.block, { borderRadius: cardRadius }]}>
      <View style={[styles.header, { paddingHorizontal: padH }]}>
        {/* <View style={styles.meetingNumWrap}>
          <Text style={styles.meetingNum}>{meeting.meetingNumber}</Text>
        </View> */}

        <View style={styles.headerMain}>
          <View style={styles.headerRow1}>
            <View style={styles.titleArea}>
              <View style={styles.titleRow}>
                <View style={styles.titleTextWrap}>
                  <Text
                    style={styles.meetingTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {meeting.title}
                  </Text>
                </View>
                {meeting.isRedo ? (
                  <View style={styles.redoPill}>
                    <Text style={styles.redoPillText}>Redo</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={[styles.statusPill, statusBadgeStyle(meeting.status)]}>
              <Text style={styles.statusPillText}>
                {statusLabel(meeting.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.dateLine}>
            {formatSessionDate(meeting.scheduledDate)} ·{" "}
            {formatSessionTime(meeting.scheduledDate) || "Time TBD"}
          </Text>
        </View>
      </View>

      {joinButton && meeting.isLatest ? (
        <View style={[styles.joinSlot, { paddingHorizontal: padH }]}>
          {joinButton}
        </View>
      ) : null}

      <View style={[styles.body, { paddingHorizontal: padH }]}>
        <NotesSectionLocal meeting={meeting} />
        <MeetingTranscript lines={meeting.transcript} />
        <MeetingAiSummary summary={meeting.aiSummary} />
      </View>
    </View>
  );
}

function NotesSectionLocal({ meeting }: { meeting: PastorMeetingUi }) {
  return (
    <View style={styles.notesSection}>
      <Text style={styles.notesHeadline}>Notes</Text>
      <View style={styles.notesGap}>
        <NoteCard title="Pastor note" value={meeting.pastorNote} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: SP + 4,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  headerRow1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
    paddingRight: 2,
  },
  meetingNumWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  meetingNum: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    flexWrap: "wrap",
  },
  titleTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  meetingTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  redoPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(250, 204, 21, 0.18)",
    flexShrink: 0,
    marginTop: 1,
  },
  redoPillText: {
    color: "rgba(250, 204, 21, 0.95)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateLine: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    width: "100%",
    paddingRight: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    flexShrink: 0,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  joinSlot: {
    paddingBottom: 12,
    paddingTop: 2,
  },
  body: {
    paddingBottom: SP + 4,
    paddingTop: SP,
  },
  notesSection: { marginBottom: 8 },
  notesHeadline: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  notesGap: { gap: 12 },
});
