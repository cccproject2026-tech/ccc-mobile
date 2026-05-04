import { Ionicons } from "@expo/vector-icons"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState, useEffect } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuthStore } from "@/stores/auth.store"
import AppGradientBackground from "@/components/layout/AppGradientBackground"

type FormatOption =
  | "font-size"
  | "bold"
  | "underline"
  | "bullet-list"
  | "numbered-list"
  | "align-left"
  | "align-center"
  | "align-right"
  | "justify"

export default function NewNote() {
  const params = useLocalSearchParams()
  const { user } = useAuthStore()
  const menteeId = user?.id
  const menteeName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || undefined
  const noteId = (params.noteId as string) || undefined
  const isEdit = (params.isEdit as string) === "true"
  const [noteContent, setNoteContent] = useState("")
  const [activeFormats, setActiveFormats] = useState<FormatOption[]>([])
  const [saving, setSaving] = useState(false)
  const [initializedFromParams, setInitializedFromParams] = useState(false)

  useEffect(() => {
    if (!isEdit || initializedFromParams) return
    const contentFromParams = (params.content as string) || ""
    if (contentFromParams) {
      setNoteContent(contentFromParams)
      setInitializedFromParams(true)
    }
  }, [isEdit, params.content, initializedFromParams])

  // Ensure fresh empty editor whenever we are NOT in edit mode
  useEffect(() => {
    if (!isEdit) {
      setNoteContent("")
      setInitializedFromParams(false)
    }
  }, [isEdit])

  const toggleFormat = (format: FormatOption) => {
    if (activeFormats.includes(format)) {
      setActiveFormats(activeFormats.filter((f) => f !== format))
    } else {
      // For alignment options, only one can be active at a time
      if (
        ["align-left", "align-center", "align-right", "justify"].includes(
          format
        )
      ) {
        setActiveFormats([
          ...activeFormats.filter(
            (f) =>
              !["align-left", "align-center", "align-right", "justify"].includes(
                f
              )
          ),
          format,
        ])
      } else {
        setActiveFormats([...activeFormats, format])
      }
    }
  }

  const handleSave = () => {
    if (!menteeId) {
      Alert.alert("Error", "Missing mentee id.")
      return
    }
    if (!noteContent.trim()) {
      Alert.alert("Error", "Please enter some content before saving.")
      return
    }
    ;(async () => {
      try {
        setSaving(true)
        const { NotesService } = await import('@/services/notes.service')
        if (isEdit && noteId) {
          await NotesService.updateNote(menteeId, noteId, noteContent)
          Alert.alert("Success", "Note updated successfully!", [{ text: "OK", onPress: () => router.back() }])
        } else {
          await NotesService.createNote(menteeId, noteContent)
          Alert.alert("Success", "Note saved successfully!", [{ text: "OK", onPress: () => router.back() }])
        }
      } catch (err) {
        console.warn("Save note failed", err)
        Alert.alert("Error", "Failed to save note.")
      } finally {
        setSaving(false)
      }
    })()
  }

  const FormatButton = ({
    icon,
    format,
    onPress,
  }: {
    icon: string
    format?: FormatOption
    onPress?: () => void
  }) => {
    const isActive = format ? activeFormats.includes(format) : false
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.formatButton, isActive && styles.formatButtonActive]}
        onPress={onPress || (format ? () => toggleFormat(format) : undefined)}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={isActive ? "#1A3A6B" : "#FFFFFF"}
        />
      </TouchableOpacity>
    )
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
          <Text style={styles.subtitle}>{menteeName}</Text>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabButton, styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, styles.tabTextActive]}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabButton, styles.tabButtonInactive]}
            onPress={() => router.back()}
          >
            <Text style={[styles.tabText, styles.tabTextInactive]}>
              Previous
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formatting Toolbar */}
        <View style={styles.toolbarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbar}
          >
            <FormatButton icon="text" format="font-size" />
            <FormatButton icon="document-text" format="bold" />
            <FormatButton icon="remove-outline" format="underline" />
            <FormatButton icon="list" format="bullet-list" />
            <FormatButton icon="list-outline" format="numbered-list" />
            <FormatButton icon="align-horizontal-left" format="align-left" />
            <FormatButton icon="align-horizontal-center" format="align-center" />
            <FormatButton icon="align-horizontal-right" format="align-right" />
            <FormatButton icon="reorder-four" format="justify" />
          </ScrollView>
        </View>

        {/* Note Content Area */}
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write the Notes here..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            multiline
            textAlignVertical="top"
            value={noteContent}
            onChangeText={setNoteContent}
          />
        </View>

        {/* Save Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
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
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
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
  toolbarContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toolbar: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 6,
  },
  formatButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  formatButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
  },
  textInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  saveButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#1A3A6B",
    fontSize: 16,
    fontWeight: "700",
  },
})

