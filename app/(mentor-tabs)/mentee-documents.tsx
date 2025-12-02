import { icons } from "@/constants/images"
import { useMentees } from "@/hooks/mentees/useMentees"
import { useDocumentsByUserId } from "@/hooks/profile/useProfile"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useMemo } from "react"
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function MenteeDocumentsScreen() {
  const { menteeId } = useLocalSearchParams()
  const id = typeof menteeId === "string" ? menteeId : undefined

  // Fetch mentee data
  const { data: menteesData, isLoading: isLoadingMentees } = useMentees()
  const mentee = useMemo(() => {
    return menteesData?.mentees?.find((m) => m.id === id)
  }, [menteesData, id])

  // Fetch documents for the mentee
  const { data: documents, isLoading: isLoadingDocuments } = useDocumentsByUserId(id)

  // Format date for display (US format)
  const formatDocumentDate = React.useCallback((dateString?: string): string => {
    if (!dateString) return "Unknown date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  // Format documents for display
  const formattedDocuments = useMemo(() => {
    if (!documents || documents.length === 0) return { recentUploads: [], library: [] }

    // Sort by upload date (most recent first)
    const sorted = [...documents].sort((a, b) => {
      const dateA = new Date(a.uploadedAt || 0).getTime()
      const dateB = new Date(b.uploadedAt || 0).getTime()
      return dateB - dateA
    })

    // Recent uploads (last 5)
    const recentUploads = sorted.slice(0, 5).map((doc, index) => ({
      id: doc.id || index.toString(),
      title: doc.fileName || "Document",
      time: formatDocumentDate(doc.uploadedAt),
    }))

    // Library (all documents)
    const library = sorted.map((doc, index) => ({
      id: doc.id || index.toString(),
      title: doc.fileName || "Document",
      date: formatDocumentDate(doc.uploadedAt),
    }))

    return { recentUploads, library }
  }, [documents, formatDocumentDate])

  const isLoading = isLoadingMentees || isLoadingDocuments

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#0D588E", "#0D4578", "#0E3563"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: "white", fontSize: 18, marginTop: 16 }}>Loading documents...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (!mentee) {
    return (
      <LinearGradient
        colors={["#0D588E", "#0D4578", "#0E3563"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "white", fontSize: 18 }}>Mentee not found</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const menteeName = `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() || "Mentee"

  return (
    <LinearGradient
      colors={["#0D588E", "#0D4578", "#0E3563"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Top Navigation Bar */}
          <View style={styles.topNav}>
            <TouchableOpacity activeOpacity={0.8}>
              <Ionicons name="menu" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.namePill}>
              <Text style={styles.namePillText}>{menteeName}</Text>
            </View>
            <View style={styles.navActions}>
              <View style={styles.notificationBadge}>
                <TouchableOpacity activeOpacity={0.8}>
                  <Ionicons name="notifications" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.notificationDot}>
                  <Text style={styles.notificationCount}>3</Text>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.8} style={styles.profileButton}>
                <Ionicons name="person-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Header with Back Button */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backButton}
              onPress={() =>
                router.push({
                  pathname: "/(mentor-tabs)/mentee-profile",
                  params: { menteeId: mentee.id },
                })
              }
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Documents</Text>
              <Text style={styles.headerBreadcrumb}>
                My Mentee › {menteeName}
              </Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* New Documents Banner */}
          {formattedDocuments.recentUploads.length > 0 && (
            <TouchableOpacity activeOpacity={0.9} style={styles.uploadBanner}>
              <Text style={styles.uploadBannerText}>
                {formattedDocuments.recentUploads.length} New Documents Uploaded
              </Text>
              <Ionicons name="download-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Recent Uploads List */}
          {formattedDocuments.recentUploads.length > 0 && (
            <View style={styles.recentUploadsSection}>
              {formattedDocuments.recentUploads.map((doc) => (
                <View key={doc.id} style={styles.documentRow}>
                  <View style={styles.documentThumb}>
                    <Image
                      source={icons.document}
                      style={styles.documentThumbImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentTitle}>{doc.title}</Text>
                    <Text style={styles.documentMeta}>{doc.time}</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Ionicons name="download-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Document Library Banner */}
          <View style={styles.libraryBanner}>
            <Text style={styles.libraryBannerText}>
              Document Library • {menteeName}
            </Text>
          </View>

          {/* Document Library List */}
          <View style={styles.librarySection}>
            {formattedDocuments.library.length > 0 ? (
              formattedDocuments.library.map((doc) => (
                <View key={doc.id} style={styles.libraryRow}>
                  <View style={styles.libraryThumb}>
                    <Image
                      source={icons.document}
                      style={styles.libraryThumbImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.libraryInfo}>
                    <Text style={styles.libraryTitle}>{doc.title}</Text>
                    <Text style={styles.libraryMeta}>{doc.date}</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                  No documents available
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 0,
    paddingBottom: 60,
    gap: 0,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0D588E",
  },
  namePill: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(126, 87, 194, 0.6)",
  },
  namePillText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationBadge: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCount: {
    color: "#0D588E",
    fontSize: 11,
    fontWeight: "700",
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  headerBreadcrumb: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 2,
  },
  uploadBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
  },
  uploadBannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  recentUploadsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(13, 63, 105, 0.6)",
    borderRadius: 12,
  },
  documentThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#E8EFF5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  documentThumbImage: {
    width: "100%",
    height: "100%",
  },
  documentInfo: {
    flex: 1,
    gap: 4,
  },
  documentTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  documentMeta: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  libraryBanner: {
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
    alignItems: "center",
  },
  libraryBannerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  librarySection: {
    marginTop: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(13, 63, 105, 0.6)",
    borderRadius: 12,
  },
  libraryThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#E8EFF5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  libraryThumbImage: {
    width: "100%",
    height: "100%",
  },
  libraryInfo: {
    flex: 1,
    gap: 4,
  },
  libraryTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  libraryMeta: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
})
