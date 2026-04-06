import type { MentorshipInsightsPayload } from "@/types/mentorshipInsights.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmotionalTrendBars } from "./EmotionalTrendBars";
import { mentorSessionPremium as T } from "./mentorSessionTheme";

type Props = {
  data: MentorshipInsightsPayload;
};

function InsightCard({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={T.icon} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <Text style={styles.emptyInline}>No items yet.</Text>;
  }
  return (
    <View style={styles.bullets}>
      {items.map((line, i) => (
        <View key={`${i}-${line}`} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>{"\u2022"}</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export function MentorshipInsightsBody({ data }: Props) {
  const hasAnything =
    data.challenges.length > 0 ||
    data.emotionalTrend.length > 0 ||
    (data.emotionalTrendNarrative?.length ?? 0) > 0 ||
    data.growthSignals.length > 0;

  if (!hasAnything) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="analytics-outline" size={32} color={T.iconSoft} />
        </View>
        <Text style={styles.emptyTitle}>Insights will appear after sessions</Text>
        <Text style={styles.emptySub}>
          When your mentorship data is available, recurring themes, emotional
          signals, and growth highlights will show here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <InsightCard icon="layers-outline" title="Top recurring challenges">
        <BulletList items={data.challenges} />
      </InsightCard>

      <InsightCard icon="pulse-outline" title="Emotional trend">
        {(data.emotionalTrendNarrative?.length ?? 0) > 0 ? (
          <View style={styles.narrativeStack}>
            {(data.emotionalTrendNarrative ?? []).map((line, i) => (
              <Text key={`${i}-${line.slice(0, 24)}`} style={styles.narrativeLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : data.emotionalTrend.length > 0 ? (
          <EmotionalTrendBars points={data.emotionalTrend} />
        ) : (
          <Text style={styles.emptyInline}>No trend data yet.</Text>
        )}
      </InsightCard>

      <InsightCard icon="trending-up-outline" title="Positive growth signals">
        <BulletList items={data.growthSignals} />
      </InsightCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    backgroundColor: T.glassHi,
    borderWidth: 1,
    borderColor: T.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.border,
  },
  cardTitle: {
    flex: 1,
    color: T.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  bullets: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    color: T.textMuted,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "300",
    marginTop: -1,
    width: 12,
    textAlign: "center",
  },
  bulletText: {
    flex: 1,
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  emptyInline: {
    color: T.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  narrativeStack: {
    gap: 12,
  },
  narrativeLine: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  emptyCard: {
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 12,
    backgroundColor: T.glassHi,
    borderWidth: 1,
    borderColor: T.border,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.border,
  },
  emptyTitle: {
    color: T.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  emptySub: {
    color: T.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
