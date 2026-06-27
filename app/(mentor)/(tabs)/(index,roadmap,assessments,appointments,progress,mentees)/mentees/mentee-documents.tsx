import { icons } from "@/constants/images"
import { useMentees } from "@/hooks/mentees/useMentees"
import { useDocumentsByUserId } from "@/hooks/profile/useProfile"
import type { Document } from "@/types/profile.types"
import { openUserDocument } from "@/utils/openUserDocument"
import { Ionicons } from "@expo/vector-icons"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useMemo, useState } from "react"
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { CommonCard, GradientBackground, SectionHeader } from "@/components/ui/design-system"
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme"

export default function MenteeDocumentsScreen() {
  const { menteeId, menteeName, email } = useLocalSearchParams<{
    menteeId?: string
    menteeName?: string
    email?: string
  }>()
  const id = typeof menteeId === "string" ? menteeId : undefined

  
  // Do not block document viewing on this, because `useMentees()` params/data-shape can differ
  
  const { data: menteesData, isLoading: isLoadingMentees } = useMentees()
  const mentee = useMemo(() => {
    return menteesData?.pages
      ?.flatMap((page: any) => page.mentees)
      ?.find((m: any) => m.id === id)
  }, [menteeId, menteesData, id])

  
  const { data: documents, isLoading: isLoadingDocuments } = useDocumentsByUserId(id)
  const [openingDocId, setOpeningDocId] = useState<string | null>(null)

  const handleOpenDocument = async (doc: Document) => {
    if (openingDocId) return
    setOpeningDocId(doc.docId)
    try {
      await openUserDocument(doc)
    } finally {
      setOpeningDocId(null)
    }
  }

  
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

  
  const formattedDocuments = useMemo(() => {
    if (!documents || documents.length === 0) return { recentUploads: [], library: [] }

    
    const sorted = [...documents].sort((a, b) => {
      const dateA = new Date(a.uploadedAt || 0).getTime()
      const dateB = new Date(b.uploadedAt || 0).getTime()
      return dateB - dateA
    })

    
    const recentUploads = sorted.slice(0, 5).map((doc, index) => ({
      id: doc.docId || index.toString(),
      title: doc.fileName || "Document",
      time: formatDocumentDate(doc.uploadedAt),
      original: doc,
    }))

    
    const library = sorted.map((doc, index) => ({
      id: doc.docId || index.toString(),
      title: doc.fileName || "Document",
      date: formatDocumentDate(doc.uploadedAt),
      original: doc,
    }))

    return { recentUploads, library }
  }, [documents, formatDocumentDate])

  const isLoading = isLoadingMentees || isLoadingDocuments

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.stateTitle}>Loading documents...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  if (!id) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.35)" />
            <Text style={styles.stateTitle}>Missing mentee id</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  const resolvedMenteeName =
    (typeof menteeName === "string" && menteeName.trim()) ||
    `${mentee?.firstName || ""} ${mentee?.lastName || ""}`.trim() ||
    (typeof email === "string" && email.trim()) ||
    "Mentee"

  return (
    <GradientBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader
            title="Documents"
            subtitle={`My Mentee · ${resolvedMenteeName}`}
            variant="compact"
            showBackButton
          />

          <View style={styles.topRow}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(mentor)/mentees/mentee-profile" as any,
                  params: {
                    menteeId: id,
                    email: typeof email === "string" ? email : undefined,
                  },
                })
              }
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back to mentee profile"
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>
          </View>

          {formattedDocuments.recentUploads.length > 0 ? (
            <CommonCard style={styles.bannerCard}>
              <View style={styles.bannerRow}>
                <Text style={styles.bannerText} numberOfLines={2}>
                  {formattedDocuments.recentUploads.length} new documents uploaded
                </Text>
                <View style={styles.bannerIconWrap}>
                  <Ionicons name="cloud-download-outline" size={18} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
            </CommonCard>
          ) : null}

          {formattedDocuments.recentUploads.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Recent uploads</Text>
              <CommonCard>
                <View style={styles.list}>
                  {formattedDocuments.recentUploads.map((doc, idx) => (
                    <Pressable
                      key={doc.id}
                      onPress={() => handleOpenDocument(doc.original)}
                      disabled={openingDocId === doc.original.docId}
                      style={({ pressed }) => [
                        styles.row,
                        idx > 0 && styles.rowBorder,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.rowLeft}>
                        <View style={styles.docThumb}>
                          <Image source={icons.document} style={styles.docThumbImg} resizeMode="contain" />
                        </View>
                        <View style={styles.rowText}>
                          <Text style={styles.rowTitle} numberOfLines={1}>{doc.title}</Text>
                          <Text style={styles.rowMeta} numberOfLines={1}>{doc.time}</Text>
                        </View>
                      </View>
                      {openingDocId === doc.original.docId ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.9)" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </CommonCard>
            </View>
          ) : null}

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Document library</Text>
            <CommonCard>
              {formattedDocuments.library.length > 0 ? (
                <View style={styles.list}>
                  {formattedDocuments.library.map((doc, idx) => (
                    <Pressable
                      key={doc.id}
                      onPress={() => handleOpenDocument(doc.original)}
                      disabled={openingDocId === doc.original.docId}
                      style={({ pressed }) => [
                        styles.row,
                        idx > 0 && styles.rowBorder,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.rowLeft}>
                        <View style={styles.docThumb}>
                          <Image source={icons.document} style={styles.docThumbImg} resizeMode="contain" />
                        </View>
                        <View style={styles.rowText}>
                          <Text style={styles.rowTitle} numberOfLines={1}>{doc.title}</Text>
                          <Text style={styles.rowMeta} numberOfLines={1}>{doc.date}</Text>
                        </View>
                      </View>
                      {openingDocId === doc.original.docId ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
                      )}
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBlock}>
                  <Ionicons name="document-outline" size={26} color="rgba(255,255,255,0.28)" />
                  <Text style={styles.emptyText}>No documents available</Text>
                </View>
              )}
            </CommonCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 36,
    paddingHorizontal: 16,
    gap: 12,
  },

  topRow: { marginTop: 2, marginBottom: 4, flexDirection: "row" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  backBtnText: {
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: { opacity: 0.88 },

  bannerCard: { padding: 14 },
  bannerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  bannerText: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "700", flex: 1 },
  bannerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionBlock: { gap: 8 },
  sectionLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 6,
    paddingHorizontal: 2,
  },

  list: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: roadmapTheme.divider,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  docThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  docThumbImg: { width: 22, height: 22, tintColor: "rgba(255,255,255,0.9)" },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { color: roadmapTheme.textPrimary, fontSize: 14, fontWeight: "700" },
  rowMeta: { color: roadmapTheme.textMuted, fontSize: 12.5, fontWeight: "500" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  emptyBlock: { paddingVertical: 22, alignItems: "center", gap: 8 },
  emptyText: { color: roadmapTheme.textMuted, fontSize: 13, fontWeight: "600" },

  centerState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 10 },
  stateTitle: { color: roadmapTheme.textPrimary, fontSize: 15, fontWeight: "700", textAlign: "center" },
})
