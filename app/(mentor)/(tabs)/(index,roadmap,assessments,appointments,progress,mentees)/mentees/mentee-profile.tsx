import { icons } from "@/constants/images"
import { useMenteeByEmail } from "@/hooks/mentees/useMenteeByEmail"
import { useMentees } from "@/hooks/mentees/useMentees"
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
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function MenteeProfileScreen() {
  const { menteeId, email: emailParam } = useLocalSearchParams<{ menteeId?: string; email?: string }>()

  // Get mentees list to look up email if needed
  const { data: menteesData } = useMentees()
  console.log(menteesData, "menteesData");
  // Get email from param or look it up from menteeId
  const email = useMemo(() => {
    if (emailParam) return emailParam
    if (menteeId) {
      // Look up email from mentees list across all paginated pages
      const mentee = menteesData?.pages
        .flatMap((page: any) => page.mentees)
        .find((m: any) => m.id === menteeId)
      return mentee?.email
    }
    return undefined
  }, [emailParam, menteeId, menteesData])
  console.log(email, "email", menteeId, "menteeId");
  // Fetch mentee data by email
  const { data: menteeData, isLoading, isError } = useMenteeByEmail(email)
  console.log(menteeData, "menteeData");
  console.log(email, "email", menteeId, "menteeId");
  // Map API data to UI structure
  const mentee = useMemo(() => {
    if (!menteeData) {
      return {
        name: "",
        firstName: "",
        lastName: "",
        role: "",
        email: email || "",
        phone: "",
        avatar: icons.myProfile,
        progress: {
          percent: 0,
          status: "in-progress" as const,
          updatedOn: "",
        },
        primaryChurch: {
          name: "",
          phone: "",
          website: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        secondaryChurch: {
          name: "",
          phone: "",
          website: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        otherInfo: {
          title: "",
          yearsInMinistry: "",
          conference: "",
        },
      }
    }

    const firstName = menteeData.firstName || ""
    const lastName = menteeData.lastName || ""
    const name = `${firstName} ${lastName}`.trim() || email || "Unknown"
    const churches = menteeData.churchDetails || []
    const primaryChurch = churches[0] || {}
    const secondaryChurch = churches[1] || {}

    return {
      id: menteeData.id,
      name,
      firstName,
      lastName,
      role: menteeData.role || "Pastor",
      email: menteeData.email || email || "",
      phone: "", // API doesn't provide phone
      avatar: menteeData.profilePicture ? { uri: menteeData.profilePicture } : icons.myProfile,
      progress: {
        percent: 0, // Will be updated from progress API if available
        status: "in-progress" as const,
        updatedOn: "",
      },
      primaryChurch: {
        name: primaryChurch.name || "",
        phone: primaryChurch.phone || "",
        website: primaryChurch.website || "",
        address: primaryChurch.address || "",
        city: primaryChurch.city || "",
        state: primaryChurch.state || "",
        zipCode: primaryChurch.zip || primaryChurch.zipCode || "",
        country: primaryChurch.country || "",
      },
      secondaryChurch: {
        name: secondaryChurch.name || "",
        phone: secondaryChurch.phone || "",
        website: secondaryChurch.website || "",
        address: secondaryChurch.address || "",
        city: secondaryChurch.city || "",
        state: secondaryChurch.state || "",
        zipCode: secondaryChurch.zip || secondaryChurch.zipCode || "",
        country: secondaryChurch.country || "",
      },
      otherInfo: {
        title: "", // API doesn't provide title
        yearsInMinistry: "", // API doesn't provide yearsInMinistry
        conference: menteeData.conference || "",
      },
    }
  }, [menteeData, email])

  const isComplete = mentee.progress.percent >= 100

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#0D588E", "#0D4578", "#0E3563"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (isError || !menteeData) {
    return (
      <LinearGradient
        colors={["#0D588E", "#0D4578", "#0E3563"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: "center" }}>
            Failed to load mentee profile. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 20, padding: 12, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8 }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    )
  }

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
              <Text style={styles.namePillText}>John Doe</Text>
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
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.profileButton}
              >
                <Image source={icons.profileTabIcon} style={{ width: 28, height: 28, tintColor: "#FFFFFF" }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Header with Back Button */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{mentee.name}</Text>
              <Text style={styles.headerBreadcrumb}>My Mentee › Profile</Text>
            </View>
            <TouchableOpacity activeOpacity={0.8}>
              <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image source={mentee.avatar} style={styles.avatar} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{mentee.name}</Text>
                <Text style={styles.profileRole}>{mentee.role}</Text>
                <View style={styles.contactIcons}>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Ionicons name="call" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Ionicons name="chatbubble" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Ionicons name="mail" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>
                  {mentee.progress.percent}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${mentee.progress.percent}%` },
                  ]}
                />
              </View>
              {isComplete && (
                <LinearGradient
                  colors={["#FFD700", "#4CAF50"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.completeBtn}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.completeBtnInner}
                  >
                    <Text style={styles.completeBtnText}>Mark as Complete</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#0D588E"
                    />
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </View>

            {/* Documents Button */}
            <LinearGradient
              colors={["#2B5A8F", "#1E4068"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.documentsButtonGradient}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.documentsButton}
                onPress={() =>
                  router.push({
                    pathname: "/(mentor)/mentees/mentee-documents" as any,
                    params: { menteeId: mentee.id || menteeId },
                  })
                }
              >
                <Image source={icons.documentsIcon} style={{ width: 20, height: 20 }} />
                <Text style={styles.documentsButtonText}>Documents</Text>
                <View style={styles.documentsBadge}>
                  <Text style={styles.documentsBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoGrid}>
              {renderInfoPill("First Name", mentee.firstName || "N/A", "personal-first")}
              {renderInfoPill("Last Name", mentee.lastName || "N/A", "personal-last")}
              {renderInfoPill("Phone Number", mentee.phone || "N/A", "personal-phone")}
              {renderInfoPill("Email", mentee.email || "N/A", "personal-email")}
            </View>
          </View>

          {mentee.primaryChurch.name && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>
                Current Church - 1 Information
              </Text>
              <View style={styles.infoGrid}>
                {renderInfoPill(
                  "Current Church",
                  mentee.primaryChurch.name || "N/A",
                  "church1-name"
                )}
                {renderInfoPill(
                  "Church Phone",
                  mentee.primaryChurch.phone || "N/A",
                  "church1-phone"
                )}
                {renderInfoPill(
                  "Church Website",
                  mentee.primaryChurch.website || "N/A",
                  "church1-website"
                )}
                {renderInfoPill(
                  "Church Address",
                  mentee.primaryChurch.address || "N/A",
                  "church1-address"
                )}
                {renderInfoPill(
                  "City",
                  mentee.primaryChurch.city || "N/A",
                  "church1-city"
                )}
                {renderInfoPill(
                  "State",
                  mentee.primaryChurch.state || "N/A",
                  "church1-state"
                )}
                {renderInfoPill(
                  "Zip Code",
                  mentee.primaryChurch.zipCode || "N/A",
                  "church1-zip"
                )}
                {renderInfoPill(
                  "Country",
                  mentee.primaryChurch.country || "N/A",
                  "church1-country"
                )}
              </View>
            </View>
          )}

          {mentee.secondaryChurch.name && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>
                Current Church - 2 Information
              </Text>
              <View style={styles.infoGrid}>
                {renderInfoPill(
                  "Current Church",
                  mentee.secondaryChurch.name || "N/A",
                  "church2-name"
                )}
                {renderInfoPill(
                  "Church Phone",
                  mentee.secondaryChurch.phone || "N/A",
                  "church2-phone"
                )}
                {renderInfoPill(
                  "Church Website",
                  mentee.secondaryChurch.website || "N/A",
                  "church2-website"
                )}
                {renderInfoPill(
                  "Church Address",
                  mentee.secondaryChurch.address || "N/A",
                  "church2-address"
                )}
                {renderInfoPill(
                  "City",
                  mentee.secondaryChurch.city || "N/A",
                  "church2-city"
                )}
                {renderInfoPill(
                  "State",
                  mentee.secondaryChurch.state || "N/A",
                  "church2-state"
                )}
                {renderInfoPill(
                  "Zip Code",
                  mentee.secondaryChurch.zipCode || "N/A",
                  "church2-zip"
                )}
                {renderInfoPill(
                  "Country",
                  mentee.secondaryChurch.country || "N/A",
                  "church2-country"
                )}
              </View>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Other Information</Text>
            <View style={styles.infoGrid}>
              {renderInfoPill("Title", mentee.otherInfo.title || "N/A", "other-title")}
              {renderInfoPill(
                "Years in Ministry",
                mentee.otherInfo.yearsInMinistry || "N/A",
                "other-years"
              )}
              {renderInfoPill(
                "Conference",
                mentee.otherInfo.conference || "N/A",
                "other-conference"
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function renderInfoPill(label: string, value: string, key?: string) {
  return (
    <View key={key ?? `${label}-${value}`} style={styles.infoPill}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  profileCard: {
    backgroundColor: "rgba(13, 63, 105, 0.7)",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    gap: 18,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  profileRole: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  contactIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  progressSection: {
    gap: 12,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  progressValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  progressBar: {
    height: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#4A90E2",
  },
  completeBtn: {
    alignSelf: "flex-end",
    borderRadius: 20,
    overflow: "hidden",
  },
  completeBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  completeBtnText: {
    color: "#0D588E",
    fontWeight: "700",
    fontSize: 14,
  },
  documentsButtonGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  documentsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 12,
  },
  documentsButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  documentsBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  documentsBadgeText: {
    color: "#2B5A8F",
    fontSize: 12,
    fontWeight: "700",
  },
  infoSection: {
    backgroundColor: "rgba(13, 63, 105, 0.5)",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoPill: {
    width: "48%",
    minWidth: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  infoLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginBottom: 6,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
})
