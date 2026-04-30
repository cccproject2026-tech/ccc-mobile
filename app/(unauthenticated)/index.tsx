import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useCheckApprovalStatus } from "@/hooks/onboarding/useOnboarding";
import { useAuthStore, useOnboardingStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.28)",
    tealDeep: "#0E5A62",
};
export default function LoginScreen() {
    const { bottom } = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();
    const { interestStatus, userId, interestData, applicationId, setInterestStatus } =
        useOnboardingStore();
    const { user } = useAuthStore();
    const { role: roleParam } = useLocalSearchParams<{ role?: string }>();

    const [lastChecked, setLastChecked] = useState<Date | null>(null);

    // Check if user is pending approval
    const isPending =
        interestStatus === 'pending' || interestStatus === 'new';
    const hasSubmittedApplication =
        !!userId && (!!applicationId || !!interestData);

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
    const {
        isLoading: isCheckingStatus,
        isFetching,
        isSuccess: isStatusSuccess,
        data: approvalStatusData,
        refetch,
    } = useCheckApprovalStatus(isPending);

    console.log('📊 Interest Status:', interestStatus);
    console.log('👤 User ID:', userId);
    console.log('⏳ Is Pending:', isPending);
    console.log('🔍 Checking Status:', isCheckingStatus);

    useEffect(() => {
        if (isStatusSuccess) setLastChecked(new Date());
    }, [isStatusSuccess, approvalStatusData]);

    const handleCheckStatusPress = useCallback(async () => {
        if (!isPending || isFetching) return;
        console.log("🔄 Manually checking approval status...");
        await refetch();
    }, [isPending, isFetching, refetch]);

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

    const pageSidePadding = windowWidth >= 430 ? 24 : 16;

    // Keep original behavior: once accepted, take user to set-password flow.
    useEffect(() => {
        if (interestStatus === "accepted") {
            router.replace("/(unauthenticated)/set-password");
        }
    }, [interestStatus]);

    const formatLastChecked = (d: Date | null): string => {
        if (!d) return "Last checked: —";
        const diffMs = Date.now() - d.getTime();
        const mins = Math.max(0, Math.floor(diffMs / 60000));
        if (mins <= 0) return "Last checked: just now";
        if (mins === 1) return "Last checked: 1 min ago";
        return `Last checked: ${mins} mins ago`;
    };

    const StepRow = ({
        label,
        state,
        isLast,
    }: {
        label: string;
        state: "done" | "active" | "pending";
        isLast?: boolean;
    }) => {
        const dot =
            state === "done"
                ? {
                      name: "checkmark" as const,
                      bg: "rgba(52, 211, 153, 0.22)",
                      border: "rgba(52, 211, 153, 0.42)",
                      fg: "#34D399",
                  }
                : state === "active"
                  ? {
                        name: "time" as const,
                        bg: "rgba(251, 191, 36, 0.20)",
                        border: "rgba(251, 191, 36, 0.40)",
                        fg: "#FBBF24",
                    }
                  : {
                        name: "ellipse" as const,
                        bg: "rgba(255,255,255,0.10)",
                        border: "rgba(255,255,255,0.18)",
                        fg: "rgba(255,255,255,0.55)",
                    };

        const hint =
            state === "active"
                ? "We’re reviewing your application details"
                : state === "pending"
                  ? "You’ll be able to set your password"
                  : "Received successfully";

        return (
            <View style={styles.stepRow}>
                <View style={styles.stepRail}>
                    <View
                        style={[
                            styles.stepDot,
                            { backgroundColor: dot.bg, borderColor: dot.border },
                        ]}
                    >
                        <Ionicons name={dot.name} size={14} color={dot.fg} />
                    </View>
                    {!isLast ? <View style={styles.stepLine} /> : null}
                </View>

                <View style={styles.stepTextWrap}>
                    <Text
                        style={[
                            styles.stepText,
                            state === "active" ? styles.stepTextActive : null,
                        ]}
                    >
                        {label}
                    </Text>
                    <Text style={styles.stepHint}>{hint}</Text>
                </View>
            </View>
        );
    };

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
                        {
                            paddingBottom: bottom + 24,
                            paddingHorizontal: pageSidePadding,
                        },
                    ]}
                >
                    <View style={styles.contentWrap}>
                        <TopBar showDrawer={false} showNotifications={false} />

                        <View style={styles.bgGlowOne} pointerEvents="none" />
                        <View style={styles.bgGlowTwo} pointerEvents="none" />

                        {isPending && (
                            <View style={styles.pendingWrap}>
                                <View style={styles.pill}>
                                    <View style={styles.pillDots}>
                                        <View style={styles.pillDot} />
                                        <View style={styles.pillDotGold} />
                                    </View>
                                    <Text style={styles.pillText}>Center for Community Change</Text>
                                </View>

                                <View style={styles.pendingHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.pendingTitle}>Your application is under review</Text>
                                        <Text style={styles.pendingSubtitle}>
                                            We’ve received your request. Our team is reviewing it now.
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.dividerRow}>
                                    <View style={styles.dividerLineSoft} />
                                    <Ionicons name="leaf-outline" size={14} color={accent.mint} />
                                    <View style={styles.dividerLineSoft} />
                                </View>

                                <View style={styles.pendingCard}>
                                    <LinearGradient
                                        colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.06)"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.pendingCardInner}
                                    >
                                        <View style={styles.stepsBox}>
                                            <View style={styles.stepsHeaderRow}>
                                                <Text style={styles.stepsTitle}>Application Progress</Text>
                                                <Pressable
                                                    onPress={handleCheckStatusPress}
                                                    disabled={isFetching || isCheckingStatus}
                                                    style={({ pressed }: { pressed: boolean }) => [
                                                        styles.checkStatusInline,
                                                        (isFetching || isCheckingStatus) ? styles.checkButtonDisabled : null,
                                                        pressed && !(isFetching || isCheckingStatus) ? styles.checkStatusInlinePressed : null,
                                                    ]}
                                                >
                                                    <View style={styles.checkStatusInlineInner}>
                                                        {isFetching || isCheckingStatus ? (
                                                            <ActivityIndicator size="small" color="rgba(255,255,255,0.9)" />
                                                        ) : (
                                                            <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.9)" />
                                                        )}
                                                        <Text numberOfLines={1} style={styles.checkStatusInlineText}>
                                                            Check Status
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            </View>

                                            <View style={styles.stepsDivider} />

                                            <StepRow label="Application Submitted" state="done" />
                                            <StepRow label="Under Review" state="active" />
                                            <StepRow label="Approval Decision" state="pending" isLast />

                                            <Text style={styles.lastCheckedFooter}>
                                                {formatLastChecked(lastChecked)}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </View>

                                <Text style={styles.pendingFootnote}>
                                    We’ll update this automatically. You can also tap “Check status”.
                                </Text>
                            </View>
                        )}

                        {!isPending && (
                            <View style={styles.joinSection}>
                                {hasSubmittedApplication && (
                                    <View style={styles.submittedCard}>
                                        <View style={styles.submittedHeaderRow}>
                                            <View style={styles.submittedIconWrap}>
                                                <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.submittedTitle}>Application Submitted</Text>
                                                <Text style={styles.submittedSubtitle}>
                                                    View your approval status anytime.
                                                </Text>
                                            </View>
                                        </View>

                                        {!!applicationId && (
                                            <View style={styles.submittedMetaRow}>
                                                <Text style={styles.submittedMetaLabel}>Application ID</Text>
                                                <Text style={styles.submittedMetaValue}>{applicationId}</Text>
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            style={styles.viewStatusButton}
                                            onPress={() => setInterestStatus("pending")}
                                        >
                                            <Text style={styles.viewStatusButtonText}>View Status</Text>
                                            <Ionicons name="chevron-forward" size={18} color="#0D3351" />
                                        </TouchableOpacity>
                                    </View>
                                )}

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

                        <View style={styles.divider} />

                        {/* Contact Information */}
                        <View style={styles.contactCard}>
                            <Text style={styles.contactTitle}>Contact Information</Text>
                            <View style={styles.contactRow}>
                                <Ionicons name="call-outline" size={16} color="#fff" />
                                <Text style={styles.contactText}>269-471-6159</Text>
                            </View>
                            <View style={styles.contactRow}>
                                <Ionicons name="mail-outline" size={16} color="#fff" />
                                <Text style={styles.contactText}>
                                    communitychange@andrews.edu
                                </Text>
                            </View>
                        </View>

                        <View style={styles.logoContainer}>
                            <Image source={icons.universityIcon} style={styles.logoImage} />
                        </View>
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
        alignItems: "center",
    },
    contentWrap: {
        width: "100%",
        maxWidth: 520,
    },

    pill: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        marginTop: 14,
        marginBottom: 10,
    },
    pillDots: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    pillDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: accent.mint,
    },
    pillDotGold: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: accent.gold,
    },
    pillText: {
        color: "rgba(255,255,255,0.95)",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 10,
        marginBottom: 12,
    },
    dividerLineSoft: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
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
        marginTop: 16,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        padding: 16,
        borderLeftWidth: 3,
        borderLeftColor: accent.gold,
    },
    contactCardWithStatus: {
        flex: 1,
        marginRight: 12,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: -0.15,
        color: "#fff",
        marginBottom: 10,
    },
    contactRow: {
        paddingVertical: 2,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    contactText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
        flex: 1,
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

    // Divider
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginVertical: 18,
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

    // Pending / Under review section (inline on this page)
    bgGlowOne: {
        position: "absolute",
        top: -120,
        right: -120,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    bgGlowTwo: {
        position: "absolute",
        bottom: -120,
        left: -120,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    pendingWrap: {
        marginTop: 6,
        marginBottom: 10,
    },
    pendingHeader: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
        marginBottom: 12,
    },
    pendingTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "900",
        letterSpacing: -0.2,
    },
    pendingSubtitle: {
        color: "rgba(255,255,255,0.78)",
        fontSize: 13,
        marginTop: 4,
        lineHeight: 19,
    },
    pendingCard: {
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        overflow: "hidden",
        borderLeftWidth: 3,
        borderLeftColor: accent.mint,
    },
    pendingCardInner: {
        padding: 14,
        gap: 12,
    },
    stepsBox: {
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.07)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        padding: 14,
        gap: 12,
    },
    stepsHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 6,
    },
    stepsDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.10)",
        marginBottom: 6,
    },
    stepsTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: -0.2,
    },
    checkStatusInline: {
        alignSelf: "flex-start",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        flexShrink: 0,
    },
    checkStatusInlineInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "nowrap",
    },
    checkStatusInlinePressed: { opacity: 0.9 },
    checkStatusInlineText: {
        color: "rgba(255,255,255,0.92)",
        fontSize: 12,
        fontWeight: "700",
        flexShrink: 0,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 6,
    },
    stepRail: { width: 24, alignItems: "center", alignSelf: "stretch" },
    stepDot: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
    },
    stepLine: {
        width: 2,
        flex: 1,
        marginTop: 6,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 2,
    },
    stepTextWrap: { flex: 1, gap: 3, paddingTop: 1 },
    stepText: { color: "rgba(255,255,255,0.92)", fontSize: 14, fontWeight: "800", letterSpacing: -0.15 },
    stepTextActive: { color: "#fff" },
    stepHint: { color: "rgba(255,255,255,0.62)", fontSize: 11, lineHeight: 15, fontWeight: "500" },
    checkButtonDisabled: { opacity: 0.75 },
    lastCheckedFooter: {
        marginTop: 12,
        color: "rgba(255,255,255,0.60)",
        fontSize: 11,
        textAlign: "center",
        fontWeight: "600",
    },
    pendingFootnote: {
        marginTop: 12,
        color: "rgba(255,255,255,0.55)",
        fontSize: 11,
        textAlign: "center",
    },

    submittedCard: {
        width: "100%",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 12,
        backgroundColor: "rgba(255,255,255,0.08)",
        gap: 10,
    },
    submittedHeaderRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    submittedIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "rgba(52, 211, 153, 0.14)",
        borderWidth: 1,
        borderColor: "rgba(52, 211, 153, 0.25)",
        alignItems: "center",
        justifyContent: "center",
    },
    submittedTitle: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    submittedSubtitle: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 12,
        marginTop: 2,
        lineHeight: 16,
    },
    submittedMetaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },
    submittedMetaLabel: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 12,
    },
    submittedMetaValue: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "500",
    },
    viewStatusButton: {
        height: 42,
        borderRadius: 12,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 12,
        marginTop: 2,
    },
    viewStatusButtonText: {
        color: "#0D3351",
        fontSize: 14,
        fontWeight: "700",
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
