import MentorCard from "@/components/director/MentorCard";
import MentorProfileSwiper from "@/components/director/MentorProfileSwiper";
import TopBar from "@/components/director/TopBar";
import { Mentor as MentorPayload } from "@/hooks/mentors/useMentors";
import { Mentor, useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { Ionicons } from "@expo/vector-icons";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { router } from "expo-router";
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
import { useAuthStore } from "@/stores";

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export default function MyMentorsScreen() {
  const [listToggle, setListToggle] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { user } = useAuthStore();
  const { mentors, isLoading, isError } = useAssignedMentors(user?.id ?? null);

  // Filter mentors based on search text
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

  const handleCardPress = (mentor: Mentor) => {
    router.push({
      pathname: "/(pastor)/(tabs)/mentors/schedule-meeting",
      params: { mentorData: JSON.stringify(mentor as unknown as MentorPayload) },
    });
  };

  const handleCall = (mentor: Mentor) => {
    console.log("Calling", mentor.name);
    return Alert.alert("Phone number not available");
  };

  const handleChat = (mentor: Mentor) => {
    console.log("Chatting with", mentor.name);
    return Alert.alert("Phone number not available");
  };

  const handleMail = (mentor: Mentor) => {
    console.log("Emailing", mentor.name);
    // Implement email functionality
    if (mentor.email) {
      // Compose an email to the mentor's address
      try {
        if (typeof Linking !== "undefined" && Linking.openURL) {
          Linking.openURL(`mailto:${mentor.email}`);
        } else {
          console.warn("Linking not available for email:", mentor.email);
        }
      } catch (err) {
        console.error("Failed to initiate email for:", mentor.email, err);
      }
    } else {
      console.warn("No email available for mentor:", mentor.name);
    }
  };

  const handleWhatsApp = (mentor: Mentor) => {
    console.log("WhatsApp", mentor.name);
    return Alert.alert("Phone number not available");
  };

  if (isLoading) {
    return (
      <AppGradientBackground>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </AppGradientBackground>
    );
  }

  if (isError) {
    return (
      <AppGradientBackground>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text className="text-white text-center">Failed to load mentors. Please try again.</Text>
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <>
      <AppGradientBackground>
        <View style={styles.screen}>
          <View style={styles.topBarWrap}>
            <TopBar role="pastor" showUserName />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Row */}
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

            {/* Search */}
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

            {/* Quick access */}
            <View style={styles.quickAccessWrap}>
              <MentorProfileSwiper
                mentors={filteredMentors.slice(0, 8)}
                onMentorPress={(m) => handleCardPress(m as Mentor)}
              />
            </View>

            {/* Mentors */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mentors</Text>
              <View style={listToggle ? styles.mentorList : styles.mentorGrid}>
                {filteredMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    layout={listToggle ? "list" : "card"}
                    appearance="frosted"
                    onCall={() => handleCall(mentor)}
                    onChat={() => handleChat(mentor)}
                    onMail={() => handleMail(mentor)}
                    onWhatsApp={() => handleWhatsApp(mentor)}
                    onPress={() => handleCardPress(mentor)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
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
