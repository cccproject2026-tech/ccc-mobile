import MentorCard, { MentorData } from "@/components/director/MentorCard";
import MentorProfileSwiper from "@/components/director/MentorProfileSwiper";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useMentors } from "@/hooks/mentors/useMentors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function MyMentorsScreen() {
  const [listToggle, setListToggle] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const { mentors, isLoading, isError } = useMentors();

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

  const [selectedMentor, setSelectedMentor] = useState<MentorData | null>(null);

  const handleCardPress = (mentor: MentorData) => {
    router.push({
      pathname: "/(pastor)/(tabs)/mentors/schedule-meeting",
      params: { mentorData: JSON.stringify(mentor) },
    });
  };

  const handleCall = (mentor: MentorData) => {
    console.log("Calling", mentor.name);
    // Implement call functionality
  };

  const handleChat = (mentor: MentorData) => {
    console.log("Chatting with", mentor.name);
    // Implement chat functionality
  };

  const handleMail = (mentor: MentorData) => {
    console.log("Emailing", mentor.name);
    // Implement email functionality
  };

  const handleWhatsApp = (mentor: MentorData) => {
    console.log("WhatsApp", mentor.name);
    // Implement WhatsApp functionality
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  if (isError) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text className="text-white text-center">Failed to load mentors. Please try again.</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <>
          <View style={{ paddingBottom: 10 }}>
            <TopBar role="pastor" userName="John Ross" showUserName />
          </View>
          <View style={{ flex: 1 }}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Image source={icons.forward} style={styles.backIcon} />
                  <Text style={styles.myMentorsText}>
                    My Mentors
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setListToggle(!listToggle)}
                  style={styles.toggleButton}
                >
                  <Image
                    source={listToggle ? icons.list : icons.grid}
                    style={styles.toggleIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Separator */}
            <View style={styles.dividerLine} />

            {/* Search Section */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor="white"
                  value={searchText}
                  onChangeText={setSearchText}
                />
                <Ionicons
                  name="search"
                  size={20}
                  color="rgba(255, 255, 255, 0.6)"
                  style={styles.searchIcon}
                />
              </View>
            </View>

            {/* Quick Access Mentors */}
            <View style={styles.quickAccessContainer}>
              <MentorProfileSwiper />
            </View>

            {/* Mentors List */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.mentorsListContainer}>
                <View style={styles.mentorsHeader}>
                  <Text style={styles.mentorTabText}>
                    Current Mentors
                  </Text>
                </View>

                <View
                  style={
                    listToggle ? styles.mentorsListView : styles.mentorsGrid
                  }
                >
                  {filteredMentors.map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor as MentorData}
                      layout={listToggle ? 'list' : 'card'}
                      onCall={() => handleCall(mentor as MentorData)}
                      onChat={() => handleChat(mentor as MentorData)}
                      onMail={() => handleMail(mentor as MentorData)}
                      onWhatsApp={() => handleWhatsApp(mentor as MentorData)}
                      onPress={() => handleCardPress(mentor as MentorData)}
                    />
                  ))}
                </View>
              </View>

              {/* Prior Mentors */}
              <View style={styles.mentorsListContainer}>
                <View style={styles.mentorsHeader}>
                  <Text style={styles.mentorTabText}>
                    Prior Mentors
                  </Text>
                </View>

                <View
                  style={
                    listToggle ? styles.mentorsListView : styles.mentorsGrid
                  }
                >
                  {filteredMentors.map((mentor) => (
                    <MentorCard
                      key={mentor.id}
                      mentor={mentor as MentorData}
                      layout={listToggle ? 'list' : 'card'}
                      onCall={() => handleCall(mentor as MentorData)}
                      onChat={() => handleChat(mentor as MentorData)}
                      onMail={() => handleMail(mentor as MentorData)}
                      onWhatsApp={() => handleWhatsApp(mentor as MentorData)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    alignItems: "center",
  },
  headerContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backIcon: {
    width: 18,
    height: 18,
    transform: [{ scaleX: -1 }],
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  toggleIcon: {
    width: 22,
    height: 22,
    tintColor: "white",
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
    marginVertical: 4,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 16,
  },
  searchBox: {
    backgroundColor: "#14517D",
    borderRadius: 10,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
  quickAccessContainer: {
    // marginHorizontal: 16,
    // marginBottom: 20,
  },
  quickAccessScroll: {
    paddingRight: 20,
  },
  quickAccessItem: {
    alignItems: "center",
    minWidth: 80,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  mentorsListContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 16,
  },
  mentorsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mentorsGrid: {
    gap: 0,
  },
  mentorsListView: {
    gap: 0,
  },
  myMentorsText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  dividerLine: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 4,
  },
  mentorTabText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
});
