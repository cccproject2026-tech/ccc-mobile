import { ApiNote, NotesService } from "@/services/notes.service"
import { Ionicons } from "@expo/vector-icons"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState, useEffect } from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect } from "expo-router"
import { useAuthStore } from "@/stores/auth.store"
import AppGradientBackground from "@/components/layout/AppGradientBackground"
import { SquircleIconButton } from "@/components/ui/design-system/SquircleIconButton"

export default function MentorNotes() {
  const { user } = useAuthStore()
  const menteeId = user?.id
  const menteeName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || undefined
  const [activeTab, setActiveTab] = useState<"new" | "previous">("previous")
  interface UINote {
    id: string
    content: string
    date: string
    time: string
    preview: string
  }
  const [notes, setNotes] = useState<UINote[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotes = async () => {
    setLoading(true)
    try {
      if (!menteeId) return
      const apiNotes = await NotesService.getNotes(menteeId)
      const mapped = apiNotes.map((n) => {
        const created = n.createdAt ? new Date(n.createdAt) : new Date()
        const date = created.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        })
        const time = created.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
        const preview = (n.content || "").replace(/<(.|\n)*?>/g, "").substring(0, 200)
        return {
          id: n._id,
          content: n.content,
          date,
          time,
          preview,
        } as UINote
      })
      setNotes(mapped)
    } catch (err) {
      console.warn("Failed to fetch notes", err)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchNotes()
    }, [menteeId])
  )

  const handleNotePress = (note: any) => {
    router.push({
      pathname: "/(mentor-tabs)/note-detail",
      params: {
        noteId: note.id,
        menteeId: menteeId,
        menteeName: menteeName,
      },
    })
  }

  const handleNewNote = () => {
    router.push({
      pathname: "/(mentor-tabs)/new-note",
      params: {
        menteeName: menteeName,
        menteeId: menteeId,
      },
    })
  }

  return (
    <AppGradientBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Stack.Screen options={{ headerShown: false }} />

        {}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <SquircleIconButton
              icon="chevron-back"
              accessibilityLabel="Go back"
              prominent
              onPress={() => router.back()}
            />
            
            <View style={styles.headerCenter}>
              <View style={styles.profileBadge}>
                <Text style={styles.profileName}>{menteeName}</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.iconButton}
              >
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.iconButton}
              >
                <Ionicons name="share-social" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contextRow}>
            <Text style={styles.contextHint} numberOfLines={1}>
              Notes
            </Text>
          </View>
        </View>

        {}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "new"
                ? styles.tabButtonActive
                : styles.tabButtonInactive,
            ]}
            onPress={handleNewNote}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "new"
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              New
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.tabButton,
              activeTab === "previous"
                ? styles.tabButtonActive
                : styles.tabButtonInactive,
            ]}
            onPress={() => setActiveTab("previous")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "previous"
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>
        </View>

        {}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              activeOpacity={0.85}
              style={styles.noteCard}
              onPress={() => handleNotePress(note)}
            >
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
                size={24}
                color="rgba(255,255,255,0.6)"
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </AppGradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  contextRow: {
    alignItems: "center",
    paddingTop: 2,
    paddingBottom: 2,
  },
  contextHint: {
    color: "rgba(255, 255, 255, 0.58)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  profileBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  notificationCount: {
    color: "#1A3A6B",
    fontSize: 12,
    fontWeight: "700",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabButtonInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#1A3A6B",
  },
  tabTextInactive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    marginBottom: 12,
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
    marginLeft: 8,
  },
})

