import { ApiNote, NotesService } from "@/services/notes.service"
import { Ionicons } from "@expo/vector-icons"
import AppGradientBackground from "@/components/layout/AppGradientBackground"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function MentorNotes() {
  const { user } = useAuthStore()
  const menteeId = user?.id
  const menteeName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || undefined
  const [activeTab, setActiveTab] = useState<"new" | "previous">("previous")

  // Notes state (fetched from backend)
  interface UINote {
    id: string
    content: string
    date: string
    time: string
    preview: string
  }
  const [notes, setNotes] = useState<UINote[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!menteeId) return
    let mounted = true
    const fetchNotes = async () => {
      setLoading(true)
      try {
        const apiNotes = await NotesService.getNotes(menteeId)
        if (!mounted) return
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
    fetchNotes()
    return () => {
      mounted = false
    }
  }, [menteeId])

  const handleNotePress = (note: UINote) => {
    router.push({
      pathname: "/(mentor)/notes/note-detail" as any,
      params: {
        noteId: note.id,
        menteeId: menteeId,
        menteeName: menteeName,
      },
    })
  }

  const handleNewNote = () => {
    router.push({
      pathname: "/(mentor)/notes/new-note" as any,
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

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
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

          <View style={styles.titleSection}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            <Text style={styles.title}>Notes</Text>
          </View>
          <Text style={styles.subtitle}>{menteeName}</Text>
        </View>

        {/* Tab Buttons */}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  profileBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 16,
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
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
    fontSize: 16,
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  noteContent: {
    flex: 1,
  },
  notePreview: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  noteDate: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "500",
  },
  noteTime: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 8,
  },
})

