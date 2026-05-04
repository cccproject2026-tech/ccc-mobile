import MentorCard from "@/components/director/MentorCard";
import MentorProfileSwiper from "@/components/director/MentorProfileSwiper";
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import type { Mentor as MentorCardMentor } from "@/hooks/mentors/useGetAssignedMentors";
import { Mentor, useMentors } from "@/hooks/mentors/useMentors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

function toMentorCardModel(mentor: Mentor): MentorCardMentor {
  return {
    id: mentor.id,
    name: mentor.name,
    role: mentor.role,
    description: mentor.description,
    email: mentor.email,
    username: mentor.username,
    menteesCount: mentor.menteesCount,
    profilePicture: mentor.profilePicture ?? mentor.profileImage,
    profileInfo: undefined,
    status: mentor.status,
  };
}

export default function MyMentorsScreen() {
  const [listToggle, setListToggle] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { mentors, isLoading, isError } = useMentors();

  const filteredMentors = useMemo(() => {
    if (!mentors) return [];
    if (!searchText.trim()) return mentors;
    const searchLower = searchText.toLowerCase();
    return mentors.filter(
      (mentor) =>
        mentor.name.toLowerCase().includes(searchLower) ||
        mentor.role.toLowerCase().includes(searchLower) ||
        mentor.email?.toLowerCase().includes(searchLower)
    );
  }, [mentors, searchText]);

  const handleCall = (mentor: Mentor) => {
    const raw = mentor.phoneNumber?.replace(/\D/g, "");
    if (!raw) {
      Alert.alert("Phone number not available");
      return;
    }
    Linking.openURL(`tel:${raw}`).catch(() => Alert.alert("Could not start call"));
  };

  const handleChat = (mentor: Mentor) => {
    const raw = mentor.phoneNumber?.replace(/\D/g, "");
    if (!raw) {
      Alert.alert("Phone number not available");
      return;
    }
    Linking.openURL(`sms:${raw}`).catch(() => Alert.alert("Could not open messages"));
  };

  const handleMail = (mentor: Mentor) => {
    if (mentor.email) {
      Linking.openURL(`mailto:${mentor.email}`).catch(() =>
        Alert.alert("Could not open email")
      );
    } else {
      Alert.alert("Email not available");
    }
  };

  const handleWhatsApp = (mentor: Mentor) => {
    const raw = mentor.phoneNumber?.replace(/\D/g, "");
    if (!raw) {
      Alert.alert("Phone number not available");
      return;
    }
    const url = `https://wa.me/${raw}`;
    Linking.openURL(url).catch(() => Alert.alert("Could not open WhatsApp"));
  };

  if (isLoading) {
    return (
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  if (isError) {
    return (
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text className="text-white text-center">Failed to load mentors. Please try again.</Text>
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  return (
    <>
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.screen}>
            <View style={styles.topBarWrap}>
              <TopBar role="mentor" showUserName />
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.titleRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backPill} activeOpacity={0.85}>
                  <Ionicons name="chevron-back" size={20} color="#fff" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.screenTitle} numberOfLines={1}>
                  My Mentors
                </Text>

                <TouchableOpacity
                  onPress={() => setListToggle(!listToggle)}
                  style={styles.viewTogglePill}
                  activeOpacity={0.85}
                >
                  <Ionicons name={listToggle ? "list" : "grid"} size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="rgba(255,255,255,0.55)" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search mentors"
                  placeholderTextColor="rgba(255,255,255,0.55)"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              <View style={styles.quickAccessWrap}>
                <MentorProfileSwiper mentors={filteredMentors.slice(0, 8).map(toMentorCardModel)} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mentors</Text>
                <View style={listToggle ? styles.mentorList : styles.mentorGrid}>
                  {filteredMentors.map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={toMentorCardModel(mentor)}
                      layout={listToggle ? "list" : "card"}
                      appearance="frosted"
                      onCall={() => handleCall(mentor)}
                      onChat={() => handleChat(mentor)}
                      onMail={() => handleMail(mentor)}
                      onWhatsApp={() => handleWhatsApp(mentor)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </AppGradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBarWrap: { paddingBottom: 6 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.lg,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  backPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },
  backText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  screenTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  viewTogglePill: {
    width: 44,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: SPACING.lg,
    minHeight: 46,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 10,
  },

  quickAccessWrap: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },

  section: { gap: SPACING.md },
  sectionTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  mentorGrid: { gap: 0 },
  mentorList: { gap: 0 },
});
