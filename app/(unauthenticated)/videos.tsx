// app/(login)/video-player.tsx
import { IconSymbol } from "@/components/ui/IconSymbol";
import { getFontSize, getSpacing } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function VideoPlayerScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { videoId, title, description, videoUrl, duration } = useLocalSearchParams();
    const VIDEO_URL = "https://video.wixstatic.com/video/028ec0_fb53758a493446ac8d797bcfbc533399/1080p/mp4/file.mp4";
    const currentVideoUrl = useMemo(
        () => (typeof videoUrl === "string" && videoUrl.length > 0 ? videoUrl : VIDEO_URL),
        [VIDEO_URL, videoUrl]
    );

    const html = useMemo(() => {
        return `
<!doctype html>
<html>
  <body style="margin:0;background:#000;">
    <video
      id="video"
      src="${currentVideoUrl}"
      style="width:100%;height:100%;"
      playsinline
      webkit-playsinline
      autoplay
      muted
      preload="metadata"
      controls
      controlslist="nodownload"
    ></video>
  </body>
</html>
        `;
    }, [currentVideoUrl]);

    // Related/More videos
    const relatedVideos = [
        {
            id: "related-1",
            title: "Center for Community Change",
            description: "Interested in receiving mentoring in community engagement",
            duration: "11:00",
            image: require("@/assets/images/roadmap.jpg"),
        },
        {
            id: "related-2",
            title: "Center for Community Change",
            description: "Interested in receiving mentoring in community engagement",
            duration: "11:00",
            image: require("@/assets/images/jumpstart.png"),
        },
    ];

    const handleVideoPress = (video: any) => {
        // router.replace({
        //     pathname: "/(login)/video-player",
        //     params: {
        //         videoId: video.id,
        //         title: video.title,
        //         description: video.description,
        //         videoUrl: video.videoUrl,
        //         duration: video.duration,
        //     },
        // });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <LinearGradient
                    colors={["#176192", "#1D548D", "#264387"]}
                    style={styles.container}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: bottom + 20 },
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Video Player Section */}
                        <View style={styles.videoSection}>
                            <View style={styles.videoContainer}>
                                {/* Video Player */}
                                <WebView
                                    key={currentVideoUrl}
                                    source={{ html }}
                                    style={styles.videoImage}
                                    allowsInlineMediaPlayback
                                    mediaPlaybackRequiresUserAction={false}
                                    allowsFullscreenVideo
                                    javaScriptEnabled
                                    scrollEnabled={false}
                                />

                                {/* Overlay Controls Container - Absolute */}
                                <View style={styles.overlayContainer}>
                                    {/* Back Button - Top Left */}
                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        style={styles.backButton}
                                        activeOpacity={0.8}
                                    >
                                        <IconSymbol
                                            name="chevron.left"
                                            size={getFontSize(20)}
                                            color="#FFFFFF"
                                        />
                                        <Text style={styles.backButtonText}>Back</Text>
                                    </TouchableOpacity>

                                    {/* Logo - Top Right */}
                                    <View style={styles.logoContainer}>
                                        <View style={styles.logoCircle}>
                                            <Image
                                                source={require("@/assets/logos/CCClogo.png")}
                                                style={styles.logoImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    </View>
                                </View>

                            </View>

                            {/* Video Info - Blue Background */}
                            <View style={styles.videoInfoContainer}>
                                <Text style={styles.videoTitle}>
                                    {title || "Center for Community Change"}
                                </Text>
                                <Text style={styles.videoDescription}>
                                    {description || "Interested in receiving mentoring in community engagement"}
                                </Text>
                            </View>
                        </View>

                        {/* Related Videos Section */}
                        {relatedVideos.map((video, index) => (
                            <View key={index} style={styles.relatedVideoSection}>
                                <TouchableOpacity
                                    onPress={() => handleVideoPress(video)}
                                    activeOpacity={0.95}
                                >
                                    <View style={styles.relatedVideoContainer}>
                                        <Image
                                            source={video.image}
                                            style={styles.relatedVideoImage}
                                            resizeMode="cover"
                                        />

                 
                                        {/* Duration Badge */}
                                        <View style={styles.durationBadge}>
                                            <Text style={styles.durationText}>{video.duration}</Text>
                                        </View>
                                    </View>

                                    {/* Video Info - Blue Background */}
                                    <View style={styles.videoInfoContainer}>
                                        <Text style={styles.videoTitle}>
                                            {video.title}
                                        </Text>
                                        <Text style={styles.videoDescription}>
                                            {video.description}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </LinearGradient>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#176192',
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },

    // Video Section
    videoSection: {
        marginBottom: 0,
    },
    videoContainer: {
        position: "relative",
        width: SCREEN_WIDTH,
        aspectRatio: 16 / 9,
        backgroundColor: "#000",
    },
    videoImage: {
        width: "100%",
        height: "100%",
    },

    // Overlay Container - Contains back button and logo
    overlayContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: getSpacing(20),
        paddingTop: getSpacing(12),
        zIndex: 10,
    },

    // Back Button
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(53, 40, 40, 0.6)",
        paddingVertical: getSpacing(8),
        paddingHorizontal: getSpacing(16),
        borderRadius: 8,
        gap: getSpacing(4),
    },
    backButtonText: {
        fontSize: getFontSize(16),
        fontWeight: "500",
        color: "#FFFFFF",
    },

    // Logo Container
    logoContainer: {
        // No absolute positioning needed, it's in the flex row
    },
    logoCircle: {
        width: getSpacing(44),
        height: getSpacing(44),
        borderRadius: getSpacing(22),
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    logoImage: {
        width: "70%",
        height: "70%",
    },

    // Video Controls (Center)
    videoControlsCenter: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: getSpacing(40),
    },
    controlButton: {
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 999,
        width: getSpacing(64),
        height: getSpacing(64),
        justifyContent: "center",
        alignItems: "center",
    },
    controlIcon: {
        width: getSpacing(40),
        height: getSpacing(40),
    },

    // Progress Bar (Bottom)
    progressBarWrap: {
        position: "absolute",
        bottom: getSpacing(16),
        left: getSpacing(16),
        right: getSpacing(16),
        height: getSpacing(20),
        justifyContent: "center",
    },
    progressBarTrack: {
        position: "absolute",
        left: 0,
        right: 0,
        top: getSpacing(8),
        height: 4,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    progressBarFill: {
        position: "absolute",
        left: 0,
        top: getSpacing(8),
        height: 4,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.9)",
    },
    progressTimeText: {
        position: "absolute",
        bottom: -getSpacing(2),
        alignSelf: "center",
        color: "rgba(255,255,255,0.9)",
        fontSize: getFontSize(11),
        fontWeight: "600",
    },

    // Video Info Container (Blue Background)
    videoInfoContainer: {
        backgroundColor: "#1e5a8e",
        paddingVertical: getSpacing(16),
        paddingHorizontal: getSpacing(16),
    },
    videoTitle: {
        fontSize: getFontSize(22),
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: getSpacing(6),
        lineHeight: getFontSize(28),
    },
    videoDescription: {
        fontSize: getFontSize(14),
        fontWeight: "400",
        color: "rgba(255, 255, 255, 0.9)",
        lineHeight: getFontSize(20),
    },

    // Related Videos Section
    relatedVideoSection: {
        marginTop: 0,
    },
    relatedVideoContainer: {
        position: "relative",
        width: SCREEN_WIDTH,
        aspectRatio: 16 / 9,
        backgroundColor: "#000",
    },
    relatedVideoImage: {
        width: "100%",
        height: "100%",
    },

    // Play Icon Overlay (for related videos)
    playIconOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    playIconCircle: {
        width: getSpacing(56),
        height: getSpacing(56),
        borderRadius: getSpacing(28),
        backgroundColor: "rgba(30, 90, 142, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.8)",
    },

    // Duration Badge
    durationBadge: {
        position: "absolute",
        bottom: getSpacing(12),
        right: getSpacing(12),
        backgroundColor: "rgba(53, 40, 40, 0.8)",
        paddingVertical: getSpacing(4),
        paddingHorizontal: getSpacing(12),
        borderRadius: 6,
    },
    durationText: {
        fontSize: getFontSize(13),
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
