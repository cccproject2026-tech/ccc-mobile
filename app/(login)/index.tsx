// import {
//   Button,
//   ContactInformationCard,
//   ScreenLayout,
//   VideoCard,
// } from "@/components/build-components";
// import Separator from "@/components/build-components/separator";
// import { IconSymbol } from "@/components/ui/IconSymbol";
// import { icons } from "@/constants/images";
// import { LinearGradient } from "expo-linear-gradient";
// import { router, Stack, useLocalSearchParams } from "expo-router";
// import React from "react";

// import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

// export default function Login() {
//   const [tabs, setTabs] = React.useState("All");
//   const { flag } = useLocalSearchParams();

//   const dummyRoadMaps = [
//     {
//       title: "Jump-start",
//       description: "Attend a two-day revitalization jump-start session",
//       time: "Completion Time Months 1 - 2",
//       type: "course",
//       read: false,
//       sessionDate: "10 / 11 / 24",
//       status: "Not Started",
//       completionDate: "20 Oct 2024",
//       taskStatus: {
//         notStarted: true,
//         started: false,
//         inProgress: 0,
//         toComplete: 0,
//         completed: false,
//       },
//       image: require("@/assets/images/jumpstart.png"),
//     },
//     {
//       title: "Self Revitalization Phase",
//       description:
//         "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
//       time: "Completion Time Months 1 - 2",
//       type: "note",
//       read: false,
//       subPhase: true,
//       status: "Not Started",
//       taskStatus: {
//         notStarted: true,
//         started: false,
//         inProgress: 0,
//         toComplete: 8,
//         completed: false,
//       },
//       image: require("@/assets/images/roadmap.jpg"),
//       phase: "Phase 1",
//     },
//   ];

//   const filteredRoadMaps = dummyRoadMaps.filter((item) => {
//     if (tabs === "All") return true;
//     return item.status === tabs;
//   });
//   return (
//     <>
//       <Stack.Screen options={{ headerShown: false }} />
//       <ScreenLayout showDrawer={false}>
//           {flag !== "waiting-approval" ? (
//           <ContactInformationCard
//             phone="269-471-6159"
//             email="communitychange@andrews.edu"
//             phoneIcon={icons.phone}
//             messageIcon={icons.message}
//             forwardIcon={icons.forward}
//             flag={flag === "interest-form" ? true : false}
//           />
//         ) : (
//           <LinearGradient
//             colors={["#B83AF3", "#21B6E9"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={{
//               borderTopLeftRadius: 8,
//               borderBottomLeftRadius: 8,
//               paddingVertical: 2,
//               paddingLeft:2,
//               marginVertical: 12,
//               width: 300,
//               alignSelf: "flex-end",
//             }}
//           >
//             <TouchableOpacity
//               style={{
//                 backgroundColor: "#176192",
//                 borderTopLeftRadius: 8,
//                 borderBottomLeftRadius: 8,
//                 alignItems: "center",
//                 paddingVertical: 7,
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 paddingHorizontal: 10,
//                 alignContent: "center",
//               }}
//             >
//               <Image source={icons.loader} style={{ width: 42, height: 26 }} />
//               <Text className="font-medium text-[16px] leading-[22px] text-white">
//                 Waiting for Approval
//               </Text>
//               <IconSymbol
//                 name="chevron.right"
//                 size={15}
//                 weight="medium"
//                 color={"#FFFFFFCC"}
//               />
//             </TouchableOpacity>
//           </LinearGradient>
//         )}
//         <View>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             className="w-full"
//             contentContainerStyle={{
//               paddingHorizontal: 20,
//               gap: 16,
//               paddingVertical: 10,
//               marginTop: 8,
//             }}
//           >
//             <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden relative">
//               <Image
//                 source={icons.video}
//                 className="w-full h-full rounded-[25px]"
//                 resizeMode="cover"
//               />
//               <View className="absolute z-50 bottom-5 left-5">
//                 <Text className="text-[24px] text-white font-extrabold leading-[22px]">
//                   Welcome !
//                 </Text>
//                 <Text className="text-base font-medium text-white">
//                   Learn more about CCC
//                 </Text>
//               </View>
//             </View>

//             <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden">
//               <Image
//                 source={icons.video}
//                 className="w-full h-full rounded-[25px]"
//                 resizeMode="cover"
//               />
//               <View className="absolute z-50 bottom-5 left-5">
//                 <Text className="text-[24px] text-white font-extrabold leading-[22px]">
//                   Welcome !
//                 </Text>
//                 <Text className="text-base font-medium text-white">
//                   Learn more about CCC
//                 </Text>
//               </View>
//             </View>

//             <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden">
//               <Image
//                 source={icons.video}
//                 className="w-full h-full rounded-[25px]"
//                 resizeMode="cover"
//               />
//               <View className="absolute z-50 bottom-5 left-5">
//                 <Text className="text-[24px] text-white font-extrabold leading-[22px]">
//                   Welcome !
//                 </Text>
//                 <Text className="text-base font-medium text-white">
//                   Learn more about CCC
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//         </View>

//         <Separator />

//         <View className="flex-row items-center justify-between mx-6">
//           <Text className="text-white text-base  leading-[22px] font-semibold">
//             More Videos
//           </Text>
//           <TouchableOpacity>
//             <Text className="text-white text-base leading-[22px] font-semibold">
//               Show all
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {filteredRoadMaps.map((e, i) => (
//           <React.Fragment key={i}>
//             <VideoCard data={e} navigation={router} />
//             {i < filteredRoadMaps.length - 1 && (
//               <View className="h-[0.5px] bg-white/30 my-4" />
//             )}
//           </React.Fragment>
//         ))}

//         <Separator />

//         <Button
//           onPress={() => {
//             flag === "interest-form"
//               ? router.push("/(login)/approval")
//               : router.push("/(login)/interest-form");
//           }}
//           variant="secondary"
//           buttonStyle={{
//             maxWidth: "95%",
//             marginHorizontal:"auto"
//           }}
//         >
//           Log In
//         </Button>

//         <Separator />

//         <View className="max-w-[95%] mt-12 w-full mx-auto rounded-[10px] border border-white">
//           <View className="overflow-hidden rounded-2xl">
//             <LinearGradient
//               colors={["#7C3AED", "#3B82F6", "#1E40AF"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: 23,
//               }}
//               className="rounded-[20px] border h-full border-white"
//             >
//               <TouchableOpacity onPress={()=> router.push("/(login)/password")} activeOpacity={0.8}>
//                 <Text className="text-base leading-[22px] font-medium text-white py-3">
//                   New User {">>"}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => {
//                     router.push("/(login)/approval");
//                 }}
//                 activeOpacity={0.8}
//               >
//                 <Text className="text-base leading-[22px] font-medium text-white py-3">
//                   Submit Interest
//                 </Text>
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>
//         </View>

//         <View className="mx-auto mt-12">
//           <Image className="w-auto mt-auto" source={icons.universityIcon} />
//         </View>
//       </ScreenLayout>

//       {/* Modals */}
//       {/* <ConfirmationModal
//           isVisible={showConfirmation}
//           onClose={() => setShowConfirmation(false)}
//           onConfirm={handleConfirmSave}
//         />

//         <SuccessToast
//           isVisible={showSuccessToast}
//           onClose={() => setShowSuccessToast(false)}
//         /> */}
//     </>
//   );
// }


// app/(login)/index.tsx
import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { login, isLoading, error, interestStatus, mockApproveInterest, passwordSet } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Mock video data with IDs
  const welcomeVideos = [
    {
      id: "welcome-1",
      title: "Welcome!",
      subtitle: "Learn more about CCC",
      duration: "11:00",
      videoUrl: "https://example.com/video1.mp4", // Replace with actual URL
      image: icons.video,
    },
    {
      id: "welcome-2",
      title: "Welcome!",
      subtitle: "Learn more about CCC",
      duration: "11:00",
      videoUrl: "https://example.com/video2.mp4", // Replace with actual URL
      image: icons.video,
    },
  ];

  const videoData = [
    {
      id: "intro-1",
      title: "Introduction • 11 Minutes",
      heading: "Center for Community Change",
      description: "Interested in receiving mentoring in community engagement",
      duration: "11:00",
      videoUrl: "https://example.com/video3.mp4", // Replace with actual URL
      image: require("@/assets/images/jumpstart.png"),
    },
    {
      id: "intro-2",
      title: "Introduction • 11 Minutes",
      heading: "Center for Community Change",
      description: "Interested in receiving mentoring in community engagement",
      duration: "11:00",
      videoUrl: "https://example.com/video4.mp4", // Replace with actual URL
      image: require("@/assets/images/roadmap.jpg"),
    },
  ];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      Alert.alert("Login Failed", error || "Invalid credentials");
    }
  };

  const handleLoginClick = () => {
    console.log("Login button clicked - Status:", interestStatus, "Password Set:", passwordSet);

    if (interestStatus === "approved" && !passwordSet) {
      console.log("Redirecting to set-password");
      router.push("/(login)/set-password");
    } else {
      console.log("Redirecting to login-form");
      router.push("/(login)/login-form");
    }
  };

  // Handle video navigation
  const handleVideoPress = (video: any) => {
    // router.push({
    //   pathname: "/(login)/video-player",
    //   params: {
    //     videoId: video.id,
    //     title: video.heading || video.title,
    //     description: video.description || video.subtitle,
    //     videoUrl: video.videoUrl,
    //     duration: video.duration,
    //   },
    // });
    router.push("/(login)/videos");

  };

  // Handle show all videos
  const handleShowAllVideos = () => {
    router.push("/(login)/videos");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#176192", "#1D548D", "#264387"]}
        style={[styles.container]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom + 20 },
          ]}
        >
          <TopBar showDrawer={false} showNotifications={false} />

          {/* Top Section - User Icon and Contact/Status Card */}
          <View style={styles.topSection}>
            {interestStatus === "pending" ? (
              <TouchableOpacity style={styles.approvalBadgeWrapper}>
                <LinearGradient
                  colors={["#B83AF3", "#21B6E9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.approvalBadgeGradient}
                >
                  <View style={styles.approvalBadgeContent}>
                    <View style={styles.loaderIconContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                    <Text style={styles.approvalBadgeText}>
                      Waiting for Approval
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="rgba(255,255,255,0.8)"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.contactCard}>
                <Text style={styles.contactTitle}>Contact Information</Text>
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={16} color="#fff" />
                  <Text style={styles.contactText}>: 269-471-6159</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={16} color="#fff" />
                  <Text style={styles.contactText}>
                    : communitychange@andrews.edu
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Welcome Video - Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoScrollContent}
          >
            {welcomeVideos.map((video, index) => (
              <TouchableOpacity
                key={index}
                style={styles.welcomeVideoCard}
                onPress={() => handleVideoPress(video)}
                activeOpacity={0.9}
              >
                <Image
                  source={video.image}
                  style={styles.videoImage}
                  resizeMode="cover"
                />
                <View style={styles.playButton}>
                  <Ionicons
                    name="play-circle"
                    size={64}
                    color="rgba(255,255,255,0.9)"
                  />
                </View>
                <View style={styles.videoTextOverlay}>
                  <Text style={styles.welcomeTitle}>{video.title}</Text>
                  <Text style={styles.welcomeSubtitle}>{video.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* More Videos Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>More Videos</Text>
            <TouchableOpacity onPress={handleShowAllVideos}>
              <Text style={styles.showAllText}>Show all</Text>
            </TouchableOpacity>
          </View>

          {/* Video List */}
          {videoData.map((video, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.videoListItem}
                onPress={() => handleVideoPress(video)}
                activeOpacity={0.9}
              >
                <Image source={video.image} style={styles.videoThumbnail} />
                <View style={styles.videoListPlayButton}>
                  <Ionicons
                    name="play-circle"
                    size={48}
                    color="rgba(255,255,255,0.9)"
                  />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoLabel}>{video.title}</Text>
                  <Text style={styles.videoHeading}>{video.heading}</Text>
                  <Text style={styles.videoDescription} numberOfLines={2}>
                    {video.description}
                  </Text>
                </View>
              </TouchableOpacity>
              {index < videoData.length - 1 && (
                <View style={styles.listDivider} />
              )}
            </React.Fragment>
          ))}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Login Button/Form */}
          {interestStatus !== "pending" && (
            <>
              <TouchableOpacity
                style={styles.logInButton}
                onPress={handleLoginClick}
              >
                <Text style={styles.logInButtonText}>Log in</Text>
              </TouchableOpacity>

              <View style={styles.divider} />
            </>
          )}

          {/* New User / Submit Interest */}
          {interestStatus !== "pending" && (
            <View style={styles.actionButtonWrapper}>
              <LinearGradient
                colors={["#7C3AED", "#3B82F6", "#1E40AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientContainer}
              >
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    onPress={() => router.push("/(login)/interest-form")}
                    style={styles.actionButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>
                      New User {">>"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.verticalDivider} />

                  <TouchableOpacity
                    onPress={() => router.push("/(login)/interest-form")}
                    style={styles.actionButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>
                      Submit Interest
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Message for pending users */}
          {interestStatus === "pending" && (
            <View style={styles.pendingMessageContainer}>
              <Ionicons name="time-outline" size={48} color="rgba(255,255,255,0.7)" />
              <Text style={styles.pendingMessageTitle}>
                Application Under Review
              </Text>
              <Text style={styles.pendingMessageText}>
                Thank you for submitting your interest! Your application is currently
                being reviewed by our team. You will receive an email notification once
                your account has been approved.
              </Text>

              <TouchableOpacity
                style={styles.mockApproveButton}
                onPress={mockApproveInterest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.mockApproveButtonText}>
                      Mock Approve (Testing)
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.testingNote}>
                👆 This button simulates director approval for testing purposes only
              </Text>
            </View>
          )}

          {/* Andrews University Logo */}
          <View style={styles.logoContainer}>
            <Image source={icons.universityIcon} style={styles.logoImage} />
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // Top Section
  topSection: {
    position: "relative",
    marginTop: 16,
    marginBottom: 16,
  },
  userIconButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  userIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Contact Card
  contactCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    padding: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
  },

  // Waiting for Approval Badge
  approvalBadgeWrapper: {
    alignSelf: "flex-end",
    marginRight: 0,
  },
  approvalBadgeGradient: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 2,
  },
  approvalBadgeContent: {
    backgroundColor: "#176192",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  loaderIconContainer: {
    width: 24,
    height: 24,
  },
  approvalBadgeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },

  // Welcome Video
  videoScrollContent: {
    paddingRight: 16,
    gap: 16,
  },
  welcomeVideoCard: {
    width: 313,
    height: 183,
    borderRadius: 25,
    overflow: "hidden",
    position: "relative",
  },
  videoImage: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -32,
    marginLeft: -32,
  },
  videoTextOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 20,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  showAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  // Video List Item
  videoListItem: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 12,
    position: "relative",
  },
  videoThumbnail: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    marginRight: 12,
  },
  videoListPlayButton: {
    position: "absolute",
    left: 38,
    top: 38,
  },
  videoInfo: {
    flex: 1,
    justifyContent: "center",
  },
  videoLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  videoHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
  },
  videoDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
  listDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 16,
  },

  // Log In Button
  logInButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginVertical: 8,
  },
  logInButtonText: {
    color: "#1A5490",
    fontSize: 16,
    fontWeight: "600",
  },

  // Action Buttons
  actionButtonWrapper: {
    marginTop: 48,
    marginBottom: 24,
  },
  gradientContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
    overflow: "hidden",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  verticalDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  // Pending Message
  pendingMessageContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  pendingMessageTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  pendingMessageText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 22,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 40,
    resizeMode: "contain",
  },

  mockApproveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mockApproveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testingNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
