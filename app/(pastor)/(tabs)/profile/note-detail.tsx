import { NotesService } from "@/services/notes.service";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { SquircleIconButton } from "@/components/ui/design-system/SquircleIconButton";

export default function PastorNoteDetail() {
  const params = useLocalSearchParams();
  const noteId = params.noteId as string;
  const menteeId = (params.menteeId as string) || undefined;
  const menteeName = (params.menteeName as string) || undefined;

  const [note, setNote] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      const fetch = async () => {
        setLoading(true);
        try {
          if (!menteeId) return;
          const api = await NotesService.getNotes(menteeId);
          if (!mounted) return;
          const found = api.find((n: any) => n._id === noteId) || api[0];
          if (found) {
            setNote({
              id: found._id,
              content: found.content,
              date: found.createdAt
                ? new Date(found.createdAt).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "2-digit",
                  })
                : "",
              time: found.createdAt
                ? new Date(found.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
            });
          }
        } catch (err) {
          console.warn("Failed to load pastor note", err);
        } finally {
          setLoading(false);
        }
      };
      fetch();
      return () => {
        mounted = false;
      };
    }, [menteeId, noteId])
  );

  const handleEdit = () => {
    router.push({
      pathname: "/(pastor)/(tabs)/profile/new-note",
      params: {
        menteeName: menteeName,
        menteeId: menteeId,
        noteId: noteId,
        isEdit: "true",
        content: note?.content || "",
      },
    });
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { NotesService } = await import("@/services/notes.service");
            await NotesService.deleteNote(menteeId as string, noteId);
            router.back();
          } catch (err) {
            console.warn("Failed to delete pastor note", err);
            Alert.alert("Error", "Failed to delete note.");
          }
        },
      },
    ]);
  };

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

          <View style={styles.contextRow}>
            <Text style={styles.contextHint} numberOfLines={1}>
              Saved note
            </Text>
          </View>
        </View>

        {}
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

        {}
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
  );
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
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 18,
  },
  contentText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 22,
  },
});

