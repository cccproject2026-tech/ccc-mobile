import { ApiNote, NotesService } from "@/services/notes.service";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import {
  CommonCard,
  GradientBackground,
  RoadmapNavRow,
  RoadmapTabStrip,
  SectionHeader,
} from "@/components/ui/design-system";

export default function PastorNotes() {
  const { user } = useAuthStore();
  const menteeId = user?.id;
  const menteeName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || undefined;
  const [activeTab, setActiveTab] = useState<"new" | "previous">("previous");

  interface UINote {
    id: string;
    content: string;
    date: string;
    time: string;
    preview: string;
  }

  const [notes, setNotes] = useState<UINote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      if (!menteeId) return;
      const apiNotes: ApiNote[] = await NotesService.getNotes(menteeId);
      const mapped = apiNotes.map((n) => {
        const created = n.createdAt ? new Date(n.createdAt) : new Date();
        const date = created.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        });
        const time = created.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const preview = (n.content || "")
          .replace(/<(.|\n)*?>/g, "")
          .substring(0, 200);
        return {
          id: n._id,
          content: n.content,
          date,
          time,
          preview,
        } as UINote;
      });
      setNotes(mapped);
    } catch (err) {
      console.warn("Failed to fetch pastor notes", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes();
    }, [menteeId])
  );

  const handleNotePress = (note: UINote) => {
    router.push({
      pathname: "/(pastor)/(tabs)/profile/note-detail",
      params: {
        noteId: note.id,
        menteeId: menteeId,
        menteeName: menteeName,
      },
    });
  };

  const handleNewNote = () => {
    router.push({
      pathname: "/(pastor)/(tabs)/profile/new-note",
      params: {
        menteeName: menteeName,
        menteeId: menteeId,
      },
    });
  };

  return (
    <GradientBackground style={styles.container} decorativeOrbs>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.chrome}>
          <RoadmapNavRow
            onBack={() => router.back()}
            pillLabel={menteeName || "Notes"}
            rightSlot={
              <View style={styles.rightActions}>
                <TouchableOpacity activeOpacity={0.7} style={styles.iconButton}>
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>3</Text>
                  </View>
                  <Ionicons name="notifications" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={styles.iconButton}>
                  <Ionicons name="share-social" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            }
          />
          <SectionHeader title="Notes" subtitle="Capture thoughts and revisit them anytime." showDivider />
        </View>

        <View style={styles.tabStripWrap}>
          <RoadmapTabStrip
            tabs={[
              { key: "new", label: "New" },
              { key: "previous", label: "Previous" },
            ]}
            activeKey={activeTab}
            onChange={(k) => (k === "new" ? handleNewNote() : setActiveTab("previous"))}
          />
        </View>

        {/* Notes List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              activeOpacity={0.85}
              onPress={() => handleNotePress(note)}
            >
              <CommonCard style={styles.noteCard}>
                <View style={styles.noteRow}>
                  <View style={styles.noteContent}>
                    <Text style={styles.notePreview} numberOfLines={3}>
                      {note.preview}
                    </Text>
                    <View style={styles.noteFooter}>
                      <Text style={styles.noteDate}>{note.date}</Text>
                      <Text style={styles.noteTime}>{note.time}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="rgba(255,255,255,0.65)"
                    style={styles.chevron}
                  />
                </View>
              </CommonCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  chrome: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 1,
    right: 1,
    backgroundColor: "#FFD700",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  notificationCount: {
    color: "#1A3A6B",
    fontSize: 10,
    fontWeight: "700",
  },
  tabStripWrap: {
    paddingHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 10,
  },
  noteCard: {
    padding: 14,
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noteContent: {
    flex: 1,
  },
  notePreview: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noteDate: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontWeight: "500",
  },
  noteTime: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 0,
  },
});

