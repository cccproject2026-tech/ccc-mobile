import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const profiles = [
  {
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/34.jpg",
  },
  {
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/35.jpg",
  },
  {
    name: "John Ross",
    image: "https://randomuser.me/api/portraits/men/36.jpg",
  },
];

export default function MentorProfileSwiper() {
  return (
    <View style={{ backgroundColor: "transparent" }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {profiles.map((profile, idx) => (
          <View style={styles.profileItem} key={idx}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profile.image }} style={styles.avatarImg} />
            </View>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile.name}
            </Text>
          </View>
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
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
