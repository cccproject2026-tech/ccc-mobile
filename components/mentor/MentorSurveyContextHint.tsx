import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { getFontSize } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  isMentor: boolean;
  menteeId?: string;
  assessmentStatus?: string;
};

/**
 * Explains why "View survey" may be missing: library opens omit mentee context;
 * mentee-scoped opens may still be in progress.
 */
export function MentorSurveyContextHint({
  isMentor,
  menteeId,
  assessmentStatus,
}: Props) {
  if (!isMentor) return null;

  if (!menteeId) {
    return (
      <View style={styles.wrap}>
        <View style={styles.iconRow}>
          <Ionicons name="information-circle" size={22} color="#6FD4BE" />
          <Text style={styles.title}>Library: outline only</Text>
        </View>
        <Text style={styles.body}>
          This screen shows the shared template and instructions for every mentee.
          To open a pastor's answers, go back to Assessment, open Library, tap
          their photo in the row above the list, then open this assessment again
          when their status is Submitted or Completed.
        </Text>
      </View>
    );
  }

  const ready =
    assessmentStatus === "Submitted" || assessmentStatus === "Completed";
  if (ready) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.iconRow}>
        <Ionicons name="hourglass-outline" size={20} color="#E8C88A" />
        <Text style={styles.title}>Responses not available yet</Text>
      </View>
      <Text style={styles.body}>
        View survey appears after this mentee has submitted or completed this
        assessment. Their current status:{" "}
        <Text style={styles.emphasis}>{assessmentStatus ?? "Not started"}</Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: getFontSize(15),
    fontWeight: "700",
    flex: 1,
  },
  body: {
    color: "rgba(255,255,255,0.82)",
    fontSize: getFontSize(13.5),
    lineHeight: getFontSize(20),
    fontWeight: "500",
  },
  emphasis: {
    color: "#E8C88A",
    fontWeight: "700",
  },
});

const listHintStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(13, 76, 120, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.35)",
  },
  text: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: getFontSize(12.5),
    lineHeight: getFontSize(18),
    fontWeight: "600",
  },
});

/** Shown on Assessment Library when Library (all templates) is active and mentees exist. */
export function MentorLibraryStripHint({
  visible,
}: {
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <View style={listHintStyles.wrap}>
      <Ionicons name="people-outline" size={20} color="#6FD4BE" />
      <Text style={listHintStyles.text}>
        Tap a pastor above to see their assignments and status. Open the assessment
        again from that view to use View survey after they submit or complete.
      </Text>
    </View>
  );
}
