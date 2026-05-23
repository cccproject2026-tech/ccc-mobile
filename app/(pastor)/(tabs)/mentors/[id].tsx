import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { icons } from "@/constants/images";
import { Mentor, useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { useMentorByEmail } from "@/hooks/mentors/useMentorByEmail";
import { openScheduleMeeting } from "@/lib/scheduling/scheduleMeetingNavigation";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={3}>
        {value || "—"}
      </Text>
    </View>
  );
}

export default function PastorMentorProfileScreen() {
  const { id, email: emailParam } = useLocalSearchParams<{
    id?: string;
    email?: string;
  }>();
  const { bottom } = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { mentors } = useAssignedMentors(user?.id ?? null);

  const assignedMentor = useMemo(
    () => mentors.find((m) => m.id === id),
    [mentors, id],
  );

  const email = emailParam || assignedMentor?.email;
  const { data: mentorData, isLoading, isError } = useMentorByEmail(email);

  const display = useMemo(() => {
    if (mentorData) {
      const firstName = mentorData.firstName || "";
      const lastName = mentorData.lastName || "";
      const name = `${firstName} ${lastName}`.trim() || assignedMentor?.name || "Mentor";
      const churches = mentorData.churchDetails || [];
      return {
        name,
        role: mentorData.role || assignedMentor?.role || "Mentor",
        email: mentorData.email || email || "",
        profileInfo: mentorData.profileInfo || assignedMentor?.profileInfo || "",
        conference: mentorData.conference || "",
        avatar: assignedMentor?.profilePicture
          ? { uri: assignedMentor.profilePicture }
          : icons.myProfile,
        churches: churches.map((church: Record<string, string>, index: number) => ({
          key: `church-${index}`,
          name: church.churchName || church.name || "",
          phone: church.churchPhone || church.phone || "",
          website: church.churchWebsite || church.website || "",
          address: church.churchAddress || church.address || "",
          city: church.city || "",
          state: church.state || "",
          zip: church.zip || church.zipCode || "",
          country: church.country || "",
        })),
      };
    }

    if (assignedMentor) {
      return {
        name: assignedMentor.name,
        role: assignedMentor.role,
        email: assignedMentor.email || "",
        profileInfo: assignedMentor.profileInfo || "",
        conference: "",
        avatar: assignedMentor.profilePicture
          ? { uri: assignedMentor.profilePicture }
          : icons.myProfile,
        churches: [] as {
          key: string;
          name: string;
          phone: string;
          website: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          country: string;
        }[],
      };
    }

    return null;
  }, [mentorData, assignedMentor, email]);

  const handleMail = () => {
    if (!display?.email) return Alert.alert("Email not available");
    Linking.openURL(`mailto:${display.email}`);
  };

  const handleSchedule = () => {
    const mentor: Mentor | undefined =
      assignedMentor ??
      (mentorData
        ? {
            id: mentorData.id,
            name: display?.name ?? "Mentor",
            role: display?.role ?? "Mentor",
            email: display?.email,
            profileInfo: display?.profileInfo,
          }
        : undefined);

    if (!mentor) return;
    openScheduleMeeting(router, user?.role, {
      mode: "schedule",
      personData: JSON.stringify(mentor),
    });
  };

  if (isLoading && !display) {
    return (
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </AppGradientBackground>
    );
  }

  if ((isError && !assignedMentor) || !display) {
    return (
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load mentor profile.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <AppGradientBackground>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <TopBar role="pastor" showUserName />

        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
            <Text style={styles.headerBackText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {display.name}
            </Text>
            <Text style={styles.headerBreadcrumb}>My Mentors › Profile</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.06)"]}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrap}>
                <Image source={display.avatar} style={styles.avatar} />
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.profileName}>{display.name}</Text>
                <Text style={styles.profileRole}>{display.role}</Text>
                <View style={styles.contactRow}>
                  <TouchableOpacity style={styles.contactBtn} onPress={handleMail}>
                    <Ionicons name="mail-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.scheduleBtn}
              onPress={handleSchedule}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={18} color="#0D4578" />
              <Text style={styles.scheduleBtnText}>Schedule Appointment</Text>
            </TouchableOpacity>
          </LinearGradient>

          {display.profileInfo ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              <View style={styles.profileInfoBox}>
                <Text style={styles.profileInfoText}>{display.profileInfo}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoGrid}>
              <InfoPill label="Email" value={display.email} />
              {display.conference ? (
                <InfoPill label="Conference" value={display.conference} />
              ) : null}
            </View>
          </View>

          {display.churches.map((church, index) =>
            church.name ? (
              <View key={church.key} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {display.churches.length > 1
                    ? `Church ${index + 1} Information`
                    : "Church Information"}
                </Text>
                <View style={styles.infoGrid}>
                  <InfoPill label="Church Name" value={church.name} />
                  <InfoPill label="Phone" value={church.phone} />
                  <InfoPill label="Website" value={church.website} />
                  <InfoPill label="Address" value={church.address} />
                  <InfoPill label="City" value={church.city} />
                  <InfoPill label="State" value={church.state} />
                  <InfoPill label="Zip Code" value={church.zip} />
                  <InfoPill label="Country" value={church.country} />
                </View>
              </View>
            ) : null,
          )}
        </ScrollView>
      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  backBtnText: { color: "#fff", fontWeight: "600" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerBackText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  headerTitles: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerBreadcrumb: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    gap: 14,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatar: { width: "100%", height: "100%" },
  profileMeta: { flex: 1, gap: 6 },
  profileName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  profileRole: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  contactRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
  },
  scheduleBtnText: { color: "#0D4578", fontWeight: "700", fontSize: 14 },
  section: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 12,
  },
  sectionTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  profileInfoBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 14,
  },
  profileInfoText: { color: "#fff", fontSize: 14, lineHeight: 22 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoPill: {
    width: "48%",
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  infoLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: { color: "#fff", fontSize: 13, fontWeight: "500" },
});
