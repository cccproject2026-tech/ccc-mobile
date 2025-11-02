import { menteeProfiles } from "@/constants/mockMentees"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useMemo } from "react"
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function MenteeProfileScreen() {
  const { menteeId } = useLocalSearchParams()
  const mentee = useMemo(() => {
    const id = typeof menteeId === "string" ? menteeId : undefined
    return menteeProfiles[id ?? "john-ross"] ?? menteeProfiles["john-ross"]
  }, [menteeId])

  const isComplete = mentee.progress.percent >= 100

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
                <Text style={styles.progressValue}>{mentee.progress.percent}%</Text>
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
                  <TouchableOpacity activeOpacity={0.85} style={styles.completeBtnInner}>
                    <Text style={styles.completeBtnText}>Mark as Complete</Text>
                    <Ionicons name="chevron-forward" size={16} color="#0D588E" />
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
                    pathname: "/(mentor-tabs)/mentee-documents",
                    params: { menteeId: mentee.id },
                  })
                }
              >
                <Ionicons name="document-text" size={20} color="#FFFFFF" />
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
              {renderInfoPill("First Name", mentee.firstName, "personal-first")}
              {renderInfoPill("Last Name", mentee.lastName, "personal-last")}
              {renderInfoPill("Phone Number", mentee.phone, "personal-phone")}
              {renderInfoPill("Email", mentee.email, "personal-email")}
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Current Church - 1 Information</Text>
            <View style={styles.infoGrid}>
              {renderInfoPill(
                "Current Church",
                mentee.primaryChurch.name,
                "church1-name",
              )}
              {renderInfoPill(
                "Church Phone",
                mentee.primaryChurch.phone,
                "church1-phone",
              )}
              {renderInfoPill(
                "Church Website",
                mentee.primaryChurch.website,
                "church1-website",
              )}
              {renderInfoPill(
                "Church Address",
                mentee.primaryChurch.address,
                "church1-address",
              )}
              {renderInfoPill("City", mentee.primaryChurch.city, "church1-city")}
              {renderInfoPill("State", mentee.primaryChurch.state, "church1-state")}
              {renderInfoPill(
                "Zip Code",
                mentee.primaryChurch.zipCode,
                "church1-zip",
              )}
              {renderInfoPill(
                "Country",
                mentee.primaryChurch.country,
                "church1-country",
              )}
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Current Church - 2 Information</Text>
            <View style={styles.infoGrid}>
              {renderInfoPill(
                "Current Church",
                mentee.secondaryChurch.name,
                "church2-name",
              )}
              {renderInfoPill(
                "Church Phone",
                mentee.secondaryChurch.phone,
                "church2-phone",
              )}
              {renderInfoPill(
                "Church Website",
                mentee.secondaryChurch.website,
                "church2-website",
              )}
              {renderInfoPill(
                "Church Address",
                mentee.secondaryChurch.address,
                "church2-address",
              )}
              {renderInfoPill("City", mentee.secondaryChurch.city, "church2-city")}
              {renderInfoPill("State", mentee.secondaryChurch.state, "church2-state")}
              {renderInfoPill(
                "Zip Code",
                mentee.secondaryChurch.zipCode,
                "church2-zip",
              )}
              {renderInfoPill(
                "Country",
                mentee.secondaryChurch.country,
                "church2-country",
              )}
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Other Information</Text>
            <View style={styles.infoGrid}>
              {renderInfoPill("Title", mentee.otherInfo.title, "other-title")}
              {renderInfoPill(
                "Years in Ministry",
                mentee.otherInfo.yearsInMinistry,
                "other-years",
              )}
              {renderInfoPill(
                "Conference",
                mentee.otherInfo.conference,
                "other-conference",
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
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

