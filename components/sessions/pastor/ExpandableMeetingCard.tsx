import {
  NoteCard,
  formatSessionTime,
} from "@/components/sessions/SessionFlowShared";
import { SessionDetailContentTabs } from "@/components/sessions/SessionDetailContentTabs";
import { formatSessionDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import { MeetingAiSummary } from "./MeetingAiSummary";
import { MeetingTranscript } from "./MeetingTranscript";
import { MeetingStatusUi, PastorMeetingUi } from "./pastorSessionDetail.types";
import { usePastorMeetingLayout } from "./usePastorMeetingLayout";

const SP = 16;
const GAP_SECTION = 20;
const GAP_INNER = 12;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
      return { backgroundColor: "rgba(22, 163, 74, 0.2)" };
    case "CANCELLED":
      return { backgroundColor: "rgba(248, 113, 113, 0.22)" };
    case "RESCHEDULED":
      return { backgroundColor: "rgba(250, 204, 21, 0.22)" };
    case "SCHEDULED":
      return { backgroundColor: "rgba(37, 99, 235, 0.18)" };
    default:
      return { backgroundColor: "rgba(59, 130, 246, 0.18)" };
  }
}

type Props = {
  meeting: PastorMeetingUi;
  joinButton?: React.ReactNode;
};

/** Full session detail: header + notes / transcript / AI summary (segmented tabs) */
export function ExpandableMeetingCard({ meeting, joinButton }: Props) {
  const { horizontalPad: padH, cardRadius } = usePastorMeetingLayout();
  const [expanded, setExpanded] = useState(true);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((e) => !e);
  };

  return (
    <View
      style={[
        styles.block,
        {
          borderRadius: cardRadius,
          paddingHorizontal: padH,
        },
      ]}
    >
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [styles.headerPress, pressed && styles.headerPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel="Toggle session details"
      >
        <View style={styles.headerInner}>
          <View style={styles.headerMain}>
            <View style={styles.headerRow1}>
              <View style={styles.titleArea}>
                <View style={styles.titleRow}>
                  <View style={styles.titleTextWrap}>
                    <Text
                      style={styles.meetingTitle}
                      numberOfLines={3}
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
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={22}
            color="rgba(15, 23, 42, 0.45)"
            style={styles.chevron}
          />
        </View>
      </Pressable>

      <View style={styles.headerDivider} />

      {joinButton && meeting.isLatest ? (
        <View style={styles.joinSlot}>{joinButton}</View>
      ) : null}

      {expanded ? (
        <View style={styles.body}>
          <View style={styles.notesSection}>
            <Text style={styles.notesHeadline}>Notes</Text>
            <NoteCard
              surface="light"
              title="Pastor note"
              value={meeting.pastorNote}
            />
          </View>
          <SessionDetailContentTabs
            surface="light"
            transcriptSlot={
              <MeetingTranscript
                lines={meeting.transcript}
                hideSectionTitle
                surface="light"
              />
            }
            summarySlot={
              <MeetingAiSummary
                summary={meeting.aiSummary}
                hideHeadline
                surface="light"
              />
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "#F8FAFC",
    marginBottom: GAP_SECTION,
    overflow: "hidden",
    width: "100%",
    minWidth: 0,
    paddingTop: SP,
    paddingBottom: SP,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerPress: {
    width: "100%",
  },
  headerPressed: {
    opacity: 0.92,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: GAP_INNER,
    width: "100%",
    minWidth: 0,
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
    gap: GAP_INNER,
    width: "100%",
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    paddingRight: 2,
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
    flexShrink: 1,
  },
  meetingTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  redoPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(250, 204, 21, 0.2)",
    flexShrink: 0,
    marginTop: 1,
  },
  redoPillText: {
    color: "rgba(161, 98, 7, 0.98)",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateLine: {
    color: "rgba(15, 23, 42, 0.55)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    width: "100%",
    flexShrink: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  statusPillText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  chevron: {
    flexShrink: 0,
    marginTop: 2,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(15, 23, 42, 0.1)",
    marginTop: SP,
    marginBottom: 4,
    width: "100%",
  },
  joinSlot: {
    paddingBottom: GAP_INNER,
    paddingTop: 4,
    width: "100%",
    gap: GAP_INNER,
  },
  body: {
    paddingTop: GAP_INNER,
    width: "100%",
    minWidth: 0,
    gap: 18,
  },
  notesSection: {
    width: "100%",
    minWidth: 0,
    gap: 12,
  },
  notesHeadline: {
    color: "rgba(15, 23, 42, 0.55)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
