import { DetailedMentorCard, MentorCard } from "@/components/atom/cards";
import { MentorDetailedCard, MentorShortCard } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Mentor, useMentors } from "@/hooks/mentors/useMentors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppGradientBackground from "@/components/layout/AppGradientBackground";

export default function MyMentorsScreen() {
  const [listToggle, setListToggle] = useState(false);
  const [searchText, setSearchText] = useState("");
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

  const handleMenuPress = (mentor: Mentor) => {
    // router.push({
    //   pathname: "/(pastor-tabs)/(tabs)/schedule-meeting",
    //   params: { mentorData: JSON.stringify(mentor) },
    // });
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
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                height: "100%",
                width: "100%",
                flex: 1
              }}
            >
              <View>
                {/* Header Section */}
                <PastorNavigationHeader showNameTag />
                <View style={styles.headerContainer}>
                  <View style={styles.headerContent}>
                    <TouchableOpacity
                      onPress={() => router.back()}
                      style={styles.backButton}
                    >
                      <Image source={icons.forward} style={styles.backIcon} />
                      <Text className="text-white font-semibold text-[17px]">
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
                <View className="h-[0.5px] bg-white/30 mt-1" />

                {/* Search Section */}
                <View style={styles.searchContainer} className="mt-4">
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
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ ...styles.quickAccessScroll, gap: 10 }}
                  >
                    {filteredMentors.slice(0, 8).map((mentor) => (
                      <View key={mentor.id} style={{ alignItems: "center" }}>
                        <LinearGradient
                          colors={["#8B5CF6", "#3B82F6"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 1 }}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 48,
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10
                          }}
                        >
                          <View
                            style={{
                              width: "100%",
                              height: "100%",
                              // borderRadius: 20,
                              padding: 3,
                              alignItems: "center",
                              justifyContent: "center",

                            }}
                          >
                            <Image
                              source={icons.myProfile}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 44,
                              }}
                              resizeMode="cover"
                            />
                          </View>
                        </LinearGradient>
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "500",
                            fontSize: 12,
                            textAlign: "center",
                            marginTop: 8,
                          }}
                        >
                          {mentor.name}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                {/* Separator */}
                <View className="h-[0.5px] bg-white/20 mx-14" />

                {/* Mentors List */}
                <View style={styles.mentorsListContainer} className="mt-4">
                  <View style={styles.mentorsHeader}>
                    <Text className="text-white  font-medium text-[16px]">
                      Current Mentors
                    </Text>
                  </View>

                  <View
                    style={
                      listToggle ? styles.mentorsListView : styles.mentorsGrid
                    }
                  >
                    {filteredMentors.map((mentor) => (
                      <View
                        key={mentor.id}
                        style={
                          listToggle
                            ? styles.detailedMentorCard
                            : styles.mentorCard
                        }
                      >
                        {listToggle ? (
                          <MentorDetailedCard
                            data={{
                              ...mentor,
                              firstName: mentor.name.split(' ')[0],
                              lastName: mentor.name.split(' ').slice(1).join(' ') || '',
                            } as any}
                            key={mentor.id}
                            navigation={router}
                            onMenuPress={() => handleMenuPress(mentor)}
                          />
                        ) : (
                          <MentorShortCard
                            data={{
                              ...mentor,
                              firstName: mentor.name.split(' ')[0],
                              lastName: mentor.name.split(' ').slice(1).join(' ') || '',
                            } as any}
                            dataKey={mentor.id}
                            navigation={router}
                            onMenuPress={() => handleMenuPress(mentor)}
                          />
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Prior Mentors */}
                {/* Mentors List */}
                <View style={styles.mentorsListContainer} className="mt-4">
                  <View style={styles.mentorsHeader}>
                    <Text className="text-white  font-medium text-[16px]">
                      Prior Mentors
                    </Text>
                  </View>

                  <View
                    style={
                      listToggle ? styles.mentorsListView : styles.mentorsGrid
                    }
                  >
                    {filteredMentors.map((mentor) => (
                      <View
                        key={mentor.id}
                        style={
                          listToggle
                            ? styles.detailedMentorCard
                            : styles.mentorCard
                        }
                      >
                        {listToggle ? (
                          <DetailedMentorCard
                            data={mentor}
                            key={mentor.id}
                            navigation={router}
                            onMenuPress={() => handleMenuPress(mentor)}
                          />
                        ) : (
                          <MentorCard
                            data={mentor}
                            dataKey={mentor.id}
                            navigation={router}
                            onMenuPress={() => handleMenuPress(mentor)}
                          />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </AppGradientBackground>
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
    marginBottom: 20,
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
    marginHorizontal: 16,
    marginBottom: 20,
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
  },
  mentorsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mentorsGrid: {
    gap: 12,
  },
  mentorsListView: {
    gap: 16,
  },
  mentorCard: {
    marginBottom: 8,
  },
  detailedMentorCard: {
    marginBottom: 12,
  },
});
