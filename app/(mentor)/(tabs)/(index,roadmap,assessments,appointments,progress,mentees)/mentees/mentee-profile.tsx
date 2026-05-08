import { icons } from "@/constants/images"
import { useMenteeByEmail } from "@/hooks/mentees/useMenteeByEmail"
import { useMentees } from "@/hooks/mentees/useMentees"
import { useAuthStore } from "@/stores/auth.store"
import { Ionicons } from "@expo/vector-icons"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useMemo } from "react"
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { CommonCard, GradientBackground, PrimaryButton, SectionHeader } from "@/components/ui/design-system"
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme"

export default function MenteeProfileScreen() {
  const { menteeId, email: emailParam } = useLocalSearchParams<{ menteeId?: string; email?: string }>()
  const { user } = useAuthStore()

  // Get assigned mentees list to look up email if needed
  const { data: menteesData } = useMentees(10, user?.id)
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
      <GradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.stateTitle}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  if (isError || !menteeData) {
    return (
      <GradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe} edges={["top"]}>
          <View style={styles.centerState}>
            <Ionicons name="cloud-offline-outline" size={40} color="rgba(255,255,255,0.35)" />
            <Text style={styles.stateTitle}>Failed to load mentee profile.</Text>
            <Text style={styles.stateSub}>Please try again.</Text>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
            >
              <Text style={styles.ghostBtnText}>Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

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
            title={mentee.name || "Mentee Profile"}
            subtitle="My Mentee · Profile"
            variant="compact"
          />

          <View style={styles.topRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>
          </View>

          <CommonCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarRing}>
                <Image source={mentee.avatar} style={styles.avatar} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {mentee.name}
                </Text>
                <Text style={styles.profileRole}>{mentee.role}</Text>
                <View style={styles.contactIcons}>
                  <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                    <Ionicons name="call" size={18} color="rgba(255,255,255,0.9)" />
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                    <Ionicons name="chatbubble" size={18} color="rgba(255,255,255,0.9)" />
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                    <Ionicons name="mail" size={18} color="rgba(255,255,255,0.9)" />
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
                    <Ionicons name="logo-whatsapp" size={18} color="rgba(255,255,255,0.9)" />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>{mentee.progress.percent}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${mentee.progress.percent}%` }]} />
              </View>
            </View>

            <View style={styles.actions}>
              {isComplete ? (
                <PrimaryButton
                  label="Mark as Complete"
                  onPress={() => {}}
                  leftIcon={
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  }
                  textColor="#FFFFFF"
                  style={styles.primaryAction}
                />
              ) : null}

              <PrimaryButton
                label="Documents"
                onPress={() =>
                  router.push({
                    pathname: "/(mentor)/mentees/mentee-documents" as any,
                    params: {
                      menteeId: mentee.id || menteeId,
                      menteeName: mentee.name,
                      email: mentee.email,
                    },
                  })
                }
                leftIcon={
                  <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                }
                textColor="#FFFFFF"
                style={styles.documentsAction}
              />
            </View>
          </CommonCard>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Personal information</Text>
            <CommonCard>
              <View style={styles.infoGrid}>
                {renderInfoPill("First Name", mentee.firstName || "N/A", "personal-first")}
                {renderInfoPill("Last Name", mentee.lastName || "N/A", "personal-last")}
                {renderInfoPill("Phone Number", mentee.phone || "N/A", "personal-phone")}
                {renderInfoPill("Email", mentee.email || "N/A", "personal-email")}
              </View>
            </CommonCard>
          </View>

          {mentee.primaryChurch.name && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Current church · 1</Text>
              <CommonCard>
                <View style={styles.infoGrid}>
                  {renderInfoPill("Current Church", mentee.primaryChurch.name || "N/A", "church1-name")}
                  {renderInfoPill("Church Phone", mentee.primaryChurch.phone || "N/A", "church1-phone")}
                  {renderInfoPill("Church Website", mentee.primaryChurch.website || "N/A", "church1-website")}
                  {renderInfoPill("Church Address", mentee.primaryChurch.address || "N/A", "church1-address")}
                  {renderInfoPill("City", mentee.primaryChurch.city || "N/A", "church1-city")}
                  {renderInfoPill("State", mentee.primaryChurch.state || "N/A", "church1-state")}
                  {renderInfoPill("Zip Code", mentee.primaryChurch.zipCode || "N/A", "church1-zip")}
                  {renderInfoPill("Country", mentee.primaryChurch.country || "N/A", "church1-country")}
                </View>
              </CommonCard>
            </View>
          )}

          {mentee.secondaryChurch.name && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Current church · 2</Text>
              <CommonCard>
                <View style={styles.infoGrid}>
                  {renderInfoPill("Current Church", mentee.secondaryChurch.name || "N/A", "church2-name")}
                  {renderInfoPill("Church Phone", mentee.secondaryChurch.phone || "N/A", "church2-phone")}
                  {renderInfoPill("Church Website", mentee.secondaryChurch.website || "N/A", "church2-website")}
                  {renderInfoPill("Church Address", mentee.secondaryChurch.address || "N/A", "church2-address")}
                  {renderInfoPill("City", mentee.secondaryChurch.city || "N/A", "church2-city")}
                  {renderInfoPill("State", mentee.secondaryChurch.state || "N/A", "church2-state")}
                  {renderInfoPill("Zip Code", mentee.secondaryChurch.zipCode || "N/A", "church2-zip")}
                  {renderInfoPill("Country", mentee.secondaryChurch.country || "N/A", "church2-country")}
                </View>
              </CommonCard>
            </View>
          )}

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>Other information</Text>
            <CommonCard>
              <View style={styles.infoGrid}>
                {renderInfoPill("Title", mentee.otherInfo.title || "N/A", "other-title")}
                {renderInfoPill("Years in Ministry", mentee.otherInfo.yearsInMinistry || "N/A", "other-years")}
                {renderInfoPill("Conference", mentee.otherInfo.conference || "N/A", "other-conference")}
              </View>
            </CommonCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
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
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: 36,
    paddingHorizontal: 16,
    gap: 12,
  },

  // Loading / error states
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
  stateSub: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  ghostBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  ghostBtnText: { color: roadmapTheme.textPrimary, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.88 },

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

  // Profile header card
  profileCard: { padding: 16 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  avatar: { width: "100%", height: "100%" },
  profileInfo: { flex: 1, minWidth: 0, gap: 6 },
  profileName: {
    color: roadmapTheme.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  profileRole: { color: "rgba(255,255,255,0.72)", fontSize: 13.5, fontWeight: "600" },
  contactIcons: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: roadmapTheme.divider, marginVertical: 14 },

  // Progress
  progressSection: { gap: 10 },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressLabel: { color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: "700" },
  progressValue: { color: roadmapTheme.textPrimary, fontSize: 13, fontWeight: "800" },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#38BDF8" },

  actions: { marginTop: 14, gap: 10 },
  primaryAction: {
    backgroundColor: "#22C55E",
    borderColor: "rgba(20,83,45,0.35)",
  },
  documentsAction: {
    backgroundColor: "#22C55E",
    borderColor: "rgba(20,83,45,0.35)",
  },

  // Sections
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
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  infoPill: {
    width: "48%",
    minWidth: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  infoValue: { color: roadmapTheme.textPrimary, fontSize: 14, fontWeight: "600" },
})
