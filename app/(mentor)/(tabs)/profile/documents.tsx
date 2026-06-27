import { icons } from "@/constants/images"
import { useDocuments, useProfile } from "@/hooks/profile/useProfile"
import type { Document } from "@/types/profile.types"
import { openUserDocument } from "@/utils/openUserDocument"
import { Ionicons } from "@expo/vector-icons"
import { Stack } from "expo-router"
import React, { useMemo, useState } from "react"
import {
    ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { CommonCard, GradientBackground, SectionHeader } from "@/components/ui/design-system"
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme"

export default function MentorDocumentsScreen() {
  
  const { data: profileData } = useProfile()
  const user = profileData?.user
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "Me"

  
  const { data: documents, isLoading, refetch } = useDocuments()
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

    
    // defined as uploaded in the last 7 days for example? Or just top 5?
    
    const recentUploads = sorted.slice(0, 5).map((doc, index) => ({
      id: doc.docId || index.toString(),
      title: doc.fileName || "Document",
      time: formatDocumentDate(doc.uploadedAt),
      original: doc
    }))

    
    const library = sorted.map((doc, index) => ({
      id: doc.docId || index.toString(),
      title: doc.fileName || "Document",
      date: formatDocumentDate(doc.uploadedAt),
      original: doc
    }))

    return { recentUploads, library }
  }, [documents, formatDocumentDate])

  if (isLoading) {
    return (
      <GradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.stateTitle}>Loading documents...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  const renderRecentUploads = () => {
      if (formattedDocuments.recentUploads.length === 0) return null;
      return (
          <View style={styles.recentUploadsSection}>
              <Text style={styles.recentTitle}>Recent uploads</Text>
              <CommonCard style={styles.rowCard}>
                <View>
                  {formattedDocuments.recentUploads.map((doc, idx) => (
                    <Pressable
                      key={doc.id}
                      onPress={() => handleOpenDocument(doc.original)}
                      disabled={openingDocId === doc.original.docId}
                      style={({ pressed }) => [
                        styles.row,
                        idx > 0 ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: roadmapTheme.divider } : null,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.rowLeft}>
                        <View style={styles.docThumb}>
                          <Image
                            source={icons.document}
                            style={styles.docThumbImg}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.rowText}>
                          <Text style={styles.rowTitle} numberOfLines={1}>{doc.title}</Text>
                          <Text style={styles.rowMeta} numberOfLines={1}>{doc.time}</Text>
                        </View>
                      </View>
                      <Pressable
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                        onPress={() => handleOpenDocument(doc.original)}
                        disabled={openingDocId === doc.original.docId}
                      >
                        {openingDocId === doc.original.docId ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.9)" />
                        )}
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </CommonCard>
          </View>
      )
  }
    
  // Using FlatList for the main library list to be "pagination ready"
  
  const ListHeader = () => (
    <View>
      <SectionHeader
        title="My Documents"
        subtitle={`My Profile · ${userName}`}
        variant="compact"
        showBackButton
      />

      {}
      {renderRecentUploads()}

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>Document library</Text>
      </View>
    </View>
  )
    
  
  return (
    <GradientBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <FlatList
          data={formattedDocuments.library}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fff" />
          }
          ListEmptyComponent={
            <CommonCard style={styles.emptyCard}>
              <Ionicons name="document-outline" size={26} color="rgba(255,255,255,0.28)" />
              <Text style={styles.emptyText}>No documents available</Text>
            </CommonCard>
          }
          renderItem={({ item: doc, index }) => (
            <CommonCard style={[styles.rowCard, index === 0 ? null : styles.rowCardSpacing]}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => handleOpenDocument(doc.original)}
                disabled={openingDocId === doc.original.docId}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.docThumb}>
                    <Image
                      source={icons.document}
                      style={styles.docThumbImg}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{doc.title}</Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>{doc.date}</Text>
                    <Text style={styles.openHint}>Tap to view</Text>
                  </View>
                </View>
                {openingDocId === doc.original.docId ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
                )}
              </Pressable>
            </CommonCard>
          )}
        />
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  stateTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  pressed: { opacity: 0.88 },

  listContent: { paddingBottom: 36, paddingHorizontal: 16, gap: 12 },

  sectionBlock: { paddingHorizontal: 16, marginTop: 10, marginBottom: 8 },
  sectionLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 2,
  },

  recentUploadsSection: {
    marginTop: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  recentTitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
    paddingHorizontal: 2,
  },

  rowCard: { padding: 0 },
  rowCardSpacing: { marginTop: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
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
  openHint: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
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

  emptyCard: { marginTop: 12, paddingVertical: 22, alignItems: "center", gap: 8 },
  emptyText: { color: roadmapTheme.textMuted, fontSize: 13, fontWeight: "600" },
})
