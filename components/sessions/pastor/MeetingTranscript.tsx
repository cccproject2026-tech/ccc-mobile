import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { TranscriptLineUi } from "./pastorSessionDetail.types";

const SP = 16;

type Props = {
  lines: TranscriptLineUi[];
  /** Hide duplicate heading when used inside segmented tabs */
  hideSectionTitle?: boolean;
  surface?: "dark" | "light";
};

export function MeetingTranscript({
  lines,
  hideSectionTitle,
  surface = "dark",
}: Props) {
  const { width, height: screenHeight } = useWindowDimensions();
  const transcriptMaxHeight = useMemo(() => {
    const byWidth = width * 0.55;
    const byHeight = screenHeight * 0.36;
    return Math.min(480, Math.max(220, Math.max(byWidth, byHeight)));
  }, [width, screenHeight]);
  const inTabMode = !!hideSectionTitle;
  const hasContent = lines.some((l) => l.text.trim().length > 0);
  if (!hasContent) {
    const emptyInner = (
      <>
        <Ionicons
          name="chatbubbles-outline"
          size={22}
          color={
            surface === "light"
              ? "rgba(15, 23, 42, 0.35)"
              : "rgba(255,255,255,0.45)"
          }
        />
        {!hideSectionTitle ? (
          <Text
            style={[
              styles.emptyTitle,
              surface === "light" && stylesLight.emptyTitle,
            ]}
          >
            Transcript
          </Text>
        ) : null}
        <Text
          style={[styles.emptySub, surface === "light" && stylesLight.emptySub]}
        >
          No transcript is available for this meeting yet.
        </Text>
      </>
    );
    if (inTabMode) {
      return (
        <View
          style={[
            styles.section,
            surface === "light" && stylesLight.section,
            styles.sectionInTab,
          ]}
        >
          <View
            style={[
              styles.transcriptBorderBox,
              surface === "light" && stylesLight.transcriptBorderBox,
            ]}
          >
            <View
              style={[
                styles.emptyWrap,
                surface === "light" && stylesLight.emptyWrap,
                styles.emptyWrapInBox,
              ]}
            >
              {emptyInner}
            </View>
          </View>
        </View>
      );
    }
    return (
      <View
        style={[styles.emptyWrap, surface === "light" && stylesLight.emptyWrap]}
      >
        {emptyInner}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.section,
        surface === "light" && stylesLight.section,
        inTabMode && styles.sectionInTab,
      ]}
    >
      {hideSectionTitle ? null : (
        <Text
          style={[
            styles.sectionTitle,
            surface === "light" && stylesLight.sectionTitle,
          ]}
        >
          Transcript
        </Text>
      )}
      {inTabMode ? (
        <View
          style={[
            styles.transcriptBorderBox,
            surface === "light" && stylesLight.transcriptBorderBox,
          ]}
        >
          <ScrollView
            style={[styles.scroll, { maxHeight: transcriptMaxHeight }]}
            contentContainerStyle={[
              styles.scrollContent,
              styles.scrollContentTab,
            ]}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            {lines.map((line, i) => {
              const isMentor = line.role === "mentor";
              return (
                <View
                  key={`${i}-${line.role}`}
                  style={[styles.bubbleRow, styles.bubbleRowTab]}
                >
                  <View
                    style={[
                      styles.bubble,
                      styles.bubbleTab,
                      isMentor ? styles.bubbleMentor : styles.bubblePastor,
                      isMentor
                        ? styles.bubbleMentorTab
                        : styles.bubblePastorTab,
                      surface === "light" &&
                        (isMentor
                          ? stylesLight.bubbleMentor
                          : stylesLight.bubblePastor),
                      surface === "light" &&
                        (isMentor
                          ? stylesLight.bubbleMentorTab
                          : stylesLight.bubblePastorTab),
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleRole,
                        surface === "light" && stylesLight.bubbleRole,
                      ]}
                    >
                      {isMentor ? "Mentor" : "Pastor"}
                    </Text>
                    <Text
                      style={[
                        styles.bubbleText,
                        styles.bubbleTextTab,
                        surface === "light" && stylesLight.bubbleText,
                        surface === "light" && stylesLight.bubbleTextTab,
                      ]}
                    >
                      {line.text.trim()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          style={[styles.scroll, { maxHeight: transcriptMaxHeight }]}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {lines.map((line, i) => {
            const isMentor = line.role === "mentor";
            return (
              <View
                key={`${i}-${line.role}`}
                style={[
                  styles.bubbleRow,
                  isMentor ? styles.bubbleRowMentor : styles.bubbleRowPastor,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isMentor ? styles.bubbleMentor : styles.bubblePastor,
                    surface === "light" &&
                      (isMentor
                        ? stylesLight.bubbleMentor
                        : stylesLight.bubblePastor),
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleRole,
                      surface === "light" && stylesLight.bubbleRole,
                    ]}
                  >
                    {isMentor ? "Mentor" : "Pastor"}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleText,
                      surface === "light" && stylesLight.bubbleText,
                    ]}
                  >
                    {line.text.trim()}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: SP },
  sectionInTab: {
    marginTop: 0,
    width: "100%",
    alignSelf: "stretch",
  },
  transcriptBorderBox: {
    width: "100%",
    alignSelf: "stretch",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
    overflow: "hidden",
  },
  emptyWrapInBox: {
    marginTop: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  scroll: {
    width: "100%",
    alignSelf: "stretch",
  },
  scrollContent: { paddingBottom: 6, gap: 10 },
  scrollContentTab: {
    paddingBottom: 20,
    paddingTop: 6,
    gap: 12,
  },
  bubbleRow: { width: "100%" },
  bubbleRowMentor: { alignItems: "flex-end" },
  bubbleRowPastor: { alignItems: "flex-start" },
  bubbleRowTab: {
    alignItems: "stretch",
    width: "100%",
  },
  bubble: {
    maxWidth: "70%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleTab: {
    maxWidth: "100%",
    width: "100%",
    alignSelf: "stretch",
  },
  bubbleMentor: {
    backgroundColor: "rgba(125, 211, 252, 0.16)",
  },
  bubblePastor: {
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  bubbleMentorTab: {
    borderLeftWidth: 4,
    borderLeftColor: "rgba(56, 189, 248, 0.85)",
  },
  bubblePastorTab: {
    borderLeftWidth: 4,
    borderLeftColor: "rgba(255,255,255,0.35)",
  },
  bubbleRole: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bubbleText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    lineHeight: 21,
    flexShrink: 1,
  },
  bubbleTextTab: {
    lineHeight: 24,
    fontSize: 15,
  },
  emptyWrap: {
    marginTop: SP,
    padding: SP,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    fontSize: 15,
  },
  emptySub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    flexShrink: 1,
  },
});

const stylesLight = StyleSheet.create({
  transcriptBorderBox: {
    borderColor: "rgba(15, 23, 42, 0.12)",
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  section: { marginTop: 0 },
  sectionTitle: {
    color: "rgba(15, 23, 42, 0.55)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  bubbleMentor: {
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.2)",
  },
  bubblePastor: {
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  bubbleRole: {
    color: "rgba(15, 23, 42, 0.45)",
  },
  bubbleText: {
    color: "#0F172A",
  },
  bubbleMentorTab: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },
  bubblePastorTab: {
    borderLeftWidth: 4,
    borderLeftColor: "rgba(15, 23, 42, 0.35)",
  },
  bubbleTextTab: {
    lineHeight: 24,
    fontSize: 15,
  },
  emptyWrap: {
    marginTop: 0,
    backgroundColor: "rgba(15, 23, 42, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  emptyTitle: {
    color: "#0F172A",
  },
  emptySub: {
    color: "rgba(15, 23, 42, 0.55)",
  },
});
