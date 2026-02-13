import { icons } from "@/constants/images"
import { useDocuments, useProfile } from "@/hooks/profile/useProfile"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack } from "expo-router"
import React, { useMemo } from "react"
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function MentorDocumentsScreen() {
  // Fetch profile to get user name
  const { data: profileData } = useProfile()
  const user = profileData?.user
  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "Me"

  // Fetch documents for the current mentor
  const { data: documents, isLoading, refetch } = useDocuments()

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
    // defined as uploaded in the last 7 days for example? Or just top 5?
    // The original code took top 5.
    const recentUploads = sorted.slice(0, 5).map((doc, index) => ({
      id: doc.id || index.toString(),
      title: doc.fileName || "Document",
      time: formatDocumentDate(doc.uploadedAt),
      original: doc
    }))

    // Library (all documents)
    const library = sorted.map((doc, index) => ({
      id: doc.id || index.toString(),
      title: doc.fileName || "Document",
      date: formatDocumentDate(doc.uploadedAt),
      original: doc
    }))

    return { recentUploads, library }
  }, [documents, formatDocumentDate])


  if (isLoading) {
    return (
      <LinearGradient
        colors={["#0D588E", "#0D4578", "#0E3563"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: "white", fontSize: 18, marginTop: 16 }}>Loading documents...</Text>
      </LinearGradient>
    )
  }

  const renderRecentUploads = () => {
      if (formattedDocuments.recentUploads.length === 0) return null;
      return (
          <View style={styles.recentUploadsSection}>
              <Text style={styles.sectionHeader}>Recent Uploads</Text>
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
      )
  }
    
  // Using FlatList for the main library list to be "pagination ready"
  // Header component for FlatList includes top nav, breadcrumbs, recent uploads
  const ListHeader = () => (
      <View>
          {/* Top Navigation Bar - simplified compared to mentee screen which had specific mentee actions */}
           <View style={styles.topNav}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </TouchableOpacity>
             <View style={styles.namePill}>
                 <Text style={styles.namePillText}>{userName}</Text>
             </View>
             {/* Placeholder for right side to balance */}
             <View style={{width: 26}} />
           </View>

          {/* Header */}
          <View style={styles.headerRow}>
             <View style={styles.headerTextContainer}>
               <Text style={styles.headerTitle}>My Documents</Text>
               <Text style={styles.headerBreadcrumb}>
                 My Profile › Documents
               </Text>
             </View>
          </View>

          {/* Recent Uploads */}
          {renderRecentUploads()}
          
          {/* Library Header */}
           <View style={styles.libraryBanner}>
            <Text style={styles.libraryBannerText}>
              Document Library
            </Text>
          </View>
          
      </View>
  )
    
  // Using FlatList for performance and future pagination
  return (
    <LinearGradient
      colors={["#0D588E", "#0D4578", "#0E3563"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
            data={formattedDocuments.library}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fff" />
            }
            ListEmptyComponent={
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                      No documents available
                    </Text>
               </View>
            }
            renderItem={({ item: doc }) => (
                <View style={styles.libraryRow}>
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
                   {/* Maybe allow delete here if it's their own doc? The useDeleteDocument hook exists. */}
                   {/* For now keeping it consistent with mentee screen: Trash icon if they can delete, Download if not? */}
                   {/* Mentee screen had trash icon in library list. I'll stick with that. */}
                   <TouchableOpacity activeOpacity={0.8}>
                     <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                   </TouchableOpacity>
                 </View>
            )}
        />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
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
  sectionHeader: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
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
    marginBottom: 16,
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
  libraryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
