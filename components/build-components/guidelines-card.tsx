import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function GuidelinesCard({
  title = "Assessment Guidelines",
  subtitle = "173 x 22",
  guidelines = [],
  showSubtitle = true,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  guidelines?: string[] | undefined;
  showSubtitle?: boolean | undefined;
}) {
  const defaultGuidelines = [
    "Please complete the assessment in a single session without taking breaks.",
    "If there is a power outage or loss of internet connection, the assessment will restart from the beginning.",
    "You will not be able to return to previous sections.",
    "This assessment consists of 5 sections to complete.",
    "The assessment should take approximately 45 minutes to complete.",
  ];

  const guidelinesToShow =
    guidelines.length > 0 ? guidelines : defaultGuidelines;

  return (
    <View style={styles.wrap}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {showSubtitle && subtitle !== "173 x 22" && subtitle ? (
          <Text style={styles.subtitleHint}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        {guidelinesToShow.map((guideline, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.bulletWrap}>
              <View style={styles.bullet} />
            </View>
            <Text style={styles.body}>{guideline}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginTop: 12,
    paddingHorizontal: 0,
  },
  titleBlock: {
    marginBottom: 12,
    alignItems: "center",
  },
  title: {
    color: roadmapTheme.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  subtitleHint: {
    marginTop: 6,
    color: roadmapTheme.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  card: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletWrap: {
    paddingTop: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: roadmapTheme.textPrimary,
  },
  body: {
    flex: 1,
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
});
