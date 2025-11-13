import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Mock data as fallback
const mockProfiles = [
  {
    id: "mock-1",
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "mock-2",
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: "mock-3",
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/34.jpg",
  },
  {
    id: "mock-4",
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/35.jpg",
  },
  {
    id: "mock-5",
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/36.jpg",
  },
];

interface MentorProfile {
  id: string;
  name: string;
  profileImage?: string;
  email?: string;
}

interface MentorProfileSwiperProps {
  mentors?: MentorProfile[];
  onMentorPress?: (mentor: MentorProfile) => void;
}

export default function MentorProfileSwiper({
  mentors,
  onMentorPress
}: MentorProfileSwiperProps) {
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  // Use provided mentors or fall back to mock data
  const displayProfiles = React.useMemo(() => {
    if (mentors && mentors.length > 0) {
      return mentors.map(mentor => ({
        id: mentor.id,
        name: mentor.name,
        image: mentor.profileImage,
        mentorData: mentor,
      }));
    }
    return mockProfiles.map(profile => ({
      ...profile,
      mentorData: null,
    }));
  }, [mentors]);

  const handleImageError = (profileId: string) => {
    setImageErrors(prev => ({ ...prev, [profileId]: true }));
  };

  const handlePress = (profile: typeof displayProfiles[0]) => {
    if (onMentorPress && profile.mentorData) {
      onMentorPress(profile.mentorData);
    }
  };

  return (
    <View style={{ backgroundColor: "transparent" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayProfiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={styles.profileItem}
            onPress={() => handlePress(profile)}
            activeOpacity={onMentorPress ? 0.7 : 1}
          >
            <View style={styles.avatarContainer}>
              {profile.image && !imageErrors[profile.id] ? (
                <Image
                  source={{ uri: profile.image }}
                  style={styles.avatarImg}
                  onError={() => handleImageError(profile.id)}
                />
              ) : (
                <View style={styles.iconPlaceholder}>
                  <Ionicons name="person-outline" size={28} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* thin divider */}
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  profileItem: {
    alignItems: "center",
    marginRight: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 80,
  },
  divider: {
    marginTop: 8,
    marginHorizontal: 16,
    borderBottomColor: "rgba(255,255,255,0.2)",
    borderBottomWidth: 1,
  },
});
