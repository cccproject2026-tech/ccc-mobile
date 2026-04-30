import { NotesService } from "@/services/notes.service"
import { Ionicons } from "@expo/vector-icons"
import AppGradientBackground from "@/components/layout/AppGradientBackground"
import { router, Stack, useLocalSearchParams, useFocusEffect } from "expo-router"
import React from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function NoteDetail() {
  const params = useLocalSearchParams()
  const noteId = params.noteId as string
  const menteeId = (params.menteeId as string) || undefined
  const menteeName = (params.menteeName as string) || undefined

  // Get the specific note
  const [note, setNote] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true
      const fetch = async () => {
        setLoading(true)
        try {
          if (!menteeId) return
          const api = await NotesService.getNotes(menteeId)
          if (!mounted) return
          const found = api.find((n: any) => n._id === noteId) || api[0]
          if (found) {
            setNote({
              id: found._id,
              content: found.content,
              date: found.createdAt ? new Date(found.createdAt).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }) : '',
              time: found.createdAt ? new Date(found.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : '',
            })
          }
        } catch (err) {
          console.warn("Failed to load note", err)
        } finally {
          setLoading(false)
        }
      }
      fetch()
      return () => {
        mounted = false
      }
    }, [menteeId, noteId])
  )

  const handleEdit = () => {
    router.push({
      pathname: "/(mentor)/notes/new-note" as any,
      params: {
        menteeName: menteeName,
        menteeId: menteeId,
        noteId: noteId,
        isEdit: "true",
        content: note?.content || "",
      },
    })
  }

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!menteeId) {
            Alert.alert("Error", "Missing mentee id.")
            return
          }
          try {
            await NotesService.deleteNote(menteeId, noteId)
            router.back()
          } catch (err) {
            console.warn("Failed to delete note", err)
            Alert.alert("Error", "Failed to delete note.")
          }
        },
      },
    ])
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
              <TouchableOpacity activeOpacity={0.7} style={styles.iconButton}>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.iconButton}>
                <Ionicons name="share-social" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            <Text style={styles.title}>Notes</Text>
          </View>
          <Text style={styles.subtitle}>{menteeName} ›</Text>
        </View>

        {/* Date/Time Badge */}
        <View style={styles.dateContainer}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {note?.date} - {note?.time}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionButton}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Note Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>{note?.content}</Text>
          </View>
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
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 24,
  },
  contentText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 26,
  },
})

