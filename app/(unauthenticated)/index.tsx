import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useCheckApprovalStatus } from "@/hooks/onboarding/useOnboarding";
import { useAuthStore, useOnboardingStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WELCOME_VIDEOS = [
    {
        id: 'welcome-1',
        title: 'Welcome!',
        subtitle: 'Learn more about CCC',
        duration: '11:00',
        image: icons.video,
    },
    {
        id: 'welcome-2',
        title: 'Welcome!',
        subtitle: 'Learn more about CCC',
        duration: '11:00',
        image: icons.video,
    },
];

const MORE_VIDEOS = [
    {
        id: 'intro-1',
        title: 'Introduction • 11 Minutes',
        heading: 'Center for Community Change',
        description: 'Interested in receiving mentoring in community engagement',
        duration: '11:00',
        image: require('@/assets/images/jumpstart.png'),
    },
    {
        id: 'intro-2',
        title: 'Introduction • 11 Minutes',
        heading: 'Center for Community Change',
        description: 'Interested in receiving mentoring in community engagement',
        duration: '11:00',
        image: require('@/assets/images/roadmap.jpg'),
    },
];
export default function LoginScreen() {
    const { bottom } = useSafeAreaInsets();
    const { interestStatus, userId, interestData } = useOnboardingStore();
    const { user } = useAuthStore();
    const { role: roleParam } = useLocalSearchParams<{ role?: string }>();

    // State to toggle status panel visibility
    const [isStatusExpanded, setIsStatusExpanded] = useState(false);

    // Check if user is pending approval
    const isPending =
        interestStatus === 'pending' || interestStatus === 'new';

    const mentorshipRole =
        (interestData?.title || '').trim() ||
        (roleParam === 'pastor'
            ? 'Pastor'
            : roleParam === 'layleader'
              ? 'Lay Leader'
              : roleParam === 'seminarian'
                ? 'Seminarian'
                : roleParam === 'mentor'
                  ? 'Mentor'
                  : roleParam === 'fieldmentor'
                    ? 'Field Mentor'
                    : roleParam === 'director'
                      ? 'Director'
                      : '') ||
        (user?.role === 'pastor'
            ? 'Pastor'
            : user?.role === 'mentor'
              ? 'Mentor'
              : user?.role === 'director'
                ? 'Director'
                : '') ||
        'Pastor';

    // Check approval status periodically when pending
    const { isLoading: isCheckingStatus, refetch, isFetching } = useCheckApprovalStatus(isPending);

    console.log('📊 Interest Status:', interestStatus);
    console.log('👤 User ID:', userId);
    console.log('⏳ Is Pending:', isPending);
    console.log('🔍 Checking Status:', isCheckingStatus);

    // If the Director accepts the request, take the Pastor to email verification.
    useEffect(() => {
        if (interestStatus === "accepted") {
            router.replace("/(unauthenticated)/set-password");
        }
    }, [interestStatus]);

    // Handle status button click - toggle and refetch
    const handleStatusPress = useCallback(async () => {
        console.log('→ Handling status press');
        
        // Always refetch if pending to get latest status
        if (isPending) {
            console.log('🔄 Manually checking approval status...');
            await refetch();
        }
        
        // Toggle expansion
        setIsStatusExpanded(prev => !prev);
    }, [isPending, refetch]);

    // Navigate to login or password setup
    const handleLoginClick = useCallback(() => {
        if (interestStatus === 'accepted') {
            // User has been approved - go to set password
            console.log('→ Navigating to set password');
            router.push('/(unauthenticated)/set-password');
        } else {
            // Go to normal login
            console.log('→ Navigating to login form');
            router.push('/(unauthenticated)/login-form');
        }
    }, [interestStatus]);

    // Navigate to videos
    const handleVideoPress = useCallback(() => {
        console.log('→ Navigating to videos');
        router.push('/(unauthenticated)/videos');
    }, []);

    // Navigate to interest form
    const handleInterestFormPress = useCallback(() => {
        console.log('→ Navigating to interest form');
        router.push('/(unauthenticated)/interest-form');
    }, []);

    // Navigate to mentor onboarding (3-step journey)
    const handleMentorJourneyPress = useCallback(() => {
        router.push({
            pathname: "/(unauthenticated)/mentor-start-journey/[role]",
            params: { role: "mentor" },
        });
    }, [router]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                locations={[0, 0.5, 1]}
                style={styles.container}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: bottom + 20 },
                    ]}
                >
                    <TopBar showDrawer={false} showNotifications={false} />

                    {!isPending && (
                        <View style={styles.joinSection}>
                            <View style={styles.joinCard}>
                                <Text style={styles.joinCardTitle}>
                                    Join the CCC {mentorshipRole} Mentorship Program.
                                </Text>
                                <Text style={styles.joinCardSubtitle}>
                                    Submit your interest form today.
                                </Text>
                            </View>

                            <View style={styles.joinActions}>
                                <LinearGradient
                                    colors={['#7C3AED', '#3B82F6', '#1E40AF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.joinSubmitGradient}
                                >
                                    <TouchableOpacity
                                        onPress={handleInterestFormPress}
                                        activeOpacity={0.8}
                                        style={styles.joinSubmitTouchable}
                                    >
                                        <Text style={styles.joinSubmitText}>
                                             Submit Interest 
                                        </Text>
                                    </TouchableOpacity>
                                </LinearGradient>

                                {roleParam === "mentor" && (
                                    <TouchableOpacity
                                        style={styles.joinJourneyButton}
                                        onPress={handleMentorJourneyPress}
                                    >
                                        <Text style={styles.joinJourneyButtonText}>
                                            Start your mentor journey →
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.joinLoginButton}
                                    onPress={handleLoginClick}
                                >
                                    <Text style={styles.joinLoginButtonText}>
                                        Already applied ? Log in →
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {isPending && (
                        <View style={styles.topSection}>
                            <View style={styles.topSectionRow}>
                                {/* Status Button - Always visible when pending */}
                                <View
                                    style={{
                                        flex: !isStatusExpanded ? 0 : 1,
                                        alignItems: "flex-end",
                                    }}
                                >
                                    {isStatusExpanded ? (
                                        <View style={styles.approvalBadgeWrapper}>
                                            <TouchableOpacity
                                                style={styles.approvalBadgeWrapper}
                                                activeOpacity={0.8}
                                                onPress={handleStatusPress}
                                            >
                                                <LinearGradient
                                                    colors={['#B83AF3', '#21B6E9']}
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
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.statusButtonWrapper}
                                            activeOpacity={0.8}
                                            onPress={handleStatusPress}
                                        >
                                            <LinearGradient
                                                colors={['#B83AF3', '#21B6E9']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.statusButtonGradient}
                                            >
                                                <View style={styles.statusButtonContent}>
                                                    <Ionicons
                                                        name={
                                                            isStatusExpanded
                                                                ? "chevron-forward"
                                                                : "chevron-back"
                                                        }
                                                        size={16}
                                                        color="rgba(255,255,255,0.9)"
                                                    />
                                                    <Text style={styles.statusButtonText}>Status</Text>
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {isPending && (
                        <View style={styles.pendingMessageContainer}>
                            <Ionicons
                                name="time-outline"
                                size={48}
                                color="rgba(255,255,255,0.7)"
                            />
                            <Text style={styles.pendingMessageTitle}>
                              Your Application Under Review
                            </Text>
                            <Text style={styles.pendingMessageText}>
                            {"Thank you for your submission \n"}
                            {"Your application is under review.\n"}
                            {"We will notify you soon. God bless you!"}
                            </Text>

                            {isCheckingStatus && (
                                <View style={styles.checkingContainer}>
                                    <ActivityIndicator
                                        color="rgba(255,255,255,0.7)"
                                        size="small"
                                    />
                                    <Text style={styles.checkingText}>
                                        Checking approval status...
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Welcome Videos Carousel */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.videoScrollContent}
                    >
                        {WELCOME_VIDEOS.map((video) => (
                            <TouchableOpacity
                                key={video.id}
                                style={styles.welcomeVideoCard}
                                onPress={handleVideoPress}
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
                                    <Text style={styles.welcomeSubtitle}>
                                        {video.subtitle}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.divider} />

                    {/* More Videos Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>More Videos</Text>
                        <TouchableOpacity onPress={handleVideoPress}>
                            <Text style={styles.showAllText}>Show all</Text>
                        </TouchableOpacity>
                    </View>

                    {MORE_VIDEOS.map((video, index) => (
                        <React.Fragment key={video.id}>
                            <TouchableOpacity
                                style={styles.videoListItem}
                                onPress={handleVideoPress}
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={video.image}
                                    style={styles.videoThumbnail}
                                />
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
                                    <Text
                                        style={styles.videoDescription}
                                        numberOfLines={2}
                                    >
                                        {video.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {index < MORE_VIDEOS.length - 1 && (
                                <View style={styles.listDivider} />
                            )}
                        </React.Fragment>
                    ))}

                    <View style={styles.divider} />

                    {/* Contact Information - moved below the submit flow */}
                    <View style={{ marginTop: 16 }}>
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
                    </View>

                    {/* University Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={icons.universityIcon}
                            style={styles.logoImage}
                        />
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
    topSectionRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
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
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        padding: 18,
    },
    contactCardWithStatus: {
        flex: 1,
        marginRight: 12,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 10,
    },
    contactRow: {
        paddingVertical: 2,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    contactText: {
        color: "#fff",
        fontSize: 14,
        marginLeft: 8,
    },

    // Status Button (collapsed state)
    statusButtonWrapper: {
        alignSelf: "flex-start",
        // borderRadius: 8,
        marginTop: 12,
        overflow: "hidden",
    },
    statusButtonGradient: {
        // borderRadius: 8,
        // padding: 2,
    },
    statusButtonContent: {
        // backgroundColor: "#176192",
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        
        paddingHorizontal: 12,
        gap: 6,
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },

    // Approval Panel (expanded state)
    approvalPanelExpanded: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        padding: 16,
        marginRight: 12,
    },
    approvalPanelContent: {
        alignItems: "center",
    },
    approvalPanelText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginTop: 8,
        textAlign: "center",
    },
    approvalPanelSubtext: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
        marginTop: 6,
        textAlign: "center",
        lineHeight: 18,
    },

    // Legacy: Waiting for Approval Badge (keeping for backward compatibility)
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
        justifyContent: "center",
        alignItems: "center",
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
        marginVertical: 18,
    },

    // Section Header
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#fff",
    },
    showAllText: {
        fontSize: 14,
        fontWeight: "700",
        color: "rgba(255,255,255,0.95)",
    },

    // Video List Item
    videoListItem: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.11)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        padding: 14,
        position: "relative",
    },
    videoThumbnail: {
        width: 100,
        height: 100,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 14,
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
        marginVertical: 14,
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

    // Join Program (top block before videos/contact)
    joinSection: {
        marginTop: 16,
        marginBottom: 16,
    },
    joinCard: {
        width: "100%",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginBottom: 12,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
    },
    joinCardTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 22,
        textAlign: "center",
    },
    joinCardSubtitle: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 13,
        fontWeight: "400",
        textAlign: "center",
        marginTop: 4,
    },
    joinActions: {
        width: "100%",
        alignItems: "stretch",
    },
    joinSubmitGradient: {
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
    },
    joinSubmitTouchable: {
        width: "100%",
        paddingVertical: 12,
        alignItems: "center",
    },
    joinSubmitText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "400",
    },

    joinLoginButton: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.5)",
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 10,
    },
    joinLoginButtonText: {
        color: "#1A5490",
        fontSize: 14,
        fontWeight: "400",
    },

    joinJourneyButton: {
        width: "100%",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.45)",
        backgroundColor: "rgba(255,255,255,0.08)",
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 10,
    },
    joinJourneyButtonText: {
        color: "#6FD4BE",
        fontSize: 14,
        fontWeight: "500",
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
        marginTop: 14,
        marginBottom: 18,
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

    checkingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
    },
    checkingText: {
        color: 'rgba(255, 255, 255, 0.9)',
        marginLeft: 12,
        fontSize: 14,
    },
});
