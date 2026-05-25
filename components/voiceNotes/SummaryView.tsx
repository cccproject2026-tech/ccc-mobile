import type { VoiceNoteSummary } from "@/types/voiceNote.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface SummaryViewProps {
  summary: VoiceNoteSummary | undefined;
}

interface SectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  content?: string;
  items?: string[];
}

function SummarySection({ title, icon, color, content, items }: SectionProps) {
  if (!content && (!items || items.length === 0)) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {content && <Text style={styles.sectionContent}>{content}</Text>}
      {items && items.length > 0 && (
        <View style={styles.itemList}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={[styles.bullet, { backgroundColor: color }]} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function SummaryView({ summary }: SummaryViewProps) {
  if (!summary) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="sparkles-outline"
          size={48}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>AI Summary not available yet</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SummarySection
        title="Session Overview"
        icon="eye-outline"
        color="#4FC3F7"
        content={summary.sessionOverview}
      />
      <SummarySection
        title="Key Discussion Points"
        icon="chatbubbles-outline"
        color="#FFB74D"
        items={summary.keyDiscussionPoints}
      />
      <SummarySection
        title="Mentor Guidance"
        icon="compass-outline"
        color="#CE93D8"
        items={summary.mentorGuidance}
      />
      <SummarySection
        title="Action Items"
        icon="checkmark-circle-outline"
        color="#81C784"
        items={summary.actionItems}
      />
      <SummarySection
        title="Follow Up"
        icon="arrow-forward-circle-outline"
        color="#90CAF9"
        content={summary.followUp}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionContent: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 22,
  },
  itemList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  itemText: {
    flex: 1,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 21,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 60,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
});
