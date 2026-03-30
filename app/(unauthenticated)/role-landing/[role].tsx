import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RoleParam = "pastor" | "layleader" | "seminarian" | "mentor";

/** Accents that sit on the existing blue–white base (gold warmth, mint growth). */
const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.28)",
    tealDeep: "#0E5A62",
};

const mapRoleToLabel = (role?: string): string => {
    switch (role) {
        case "pastor":
            return "Pastor";
        case "layleader":
            return "Lay Leader";
        case "seminarian":
            return "Seminarian";
        case "mentor":
            return "Mentor";
        default:
            return "";
    }
};

export default function RoleLandingScreen() {
    const { bottom, top } = useSafeAreaInsets();
    const router = useRouter();
    const { role } = useLocalSearchParams<{ role?: RoleParam }>();

    const roleLabel = useMemo(() => mapRoleToLabel(role), [role]);
    const socialProofText = useMemo(() => {
        if (role === "mentor") return "mentors already supporting";
        if (role === "pastor") return "pastors already engaging";
        return "leaders already serving";
    }, [role]);

    const avatars = [icons.dummyUser, icons.dummyUser2, icons.myProfile];

    const handleBackPress = () => {
        // Returns to the previous screen in the navigation stack.
        // If opened directly (no history), `router.back()` is a no-op, so we fall back to the role selector.
        try {
            router.back();
        } catch {
            router.replace("/");
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                locations={[0, 0.5, 1]}
                style={[styles.gradient, { paddingTop: top + 10, paddingBottom: bottom + 10 }]}
            >
                {/* Decorative background circle */}
                <View style={styles.bgCircleTop} />
                <View style={styles.bgCircleBottom} />

                {/* Top-left back icon */}
                <Pressable
                    onPress={handleBackPress}
                    style={[styles.backButton, { top: top + 8 }]}
                    hitSlop={10}
                >
                    <Ionicons name="chevron-back" size={26} color="#fff" />
                </Pressable>

                <View style={styles.center}>
                    {/* Pill badge */}
                    <View style={styles.pill}>
                        <View style={styles.pillDots}>
                            <View style={styles.pillDot} />
                            <View style={styles.pillDotGold} />
                        </View>
                        <Text style={styles.pillText}>Welcome to the Center</Text>
                    </View>

                    

                    {/* Main headline */}
                    <View style={styles.titleWrap}>
                        <Text style={styles.titleTop}>Grow your</Text>
                        <Text style={styles.titleBottom}>
                            community{" "}
                            <Text style={styles.titleAccent}>impact</Text>
                        </Text>
                        <Text style={styles.subtitle}>
                            through{" "}
                            <Text style={styles.subtitleAccent}>Christ's method.</Text>
                        </Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Ionicons name="leaf-outline" size={14} color={accent.mint} />
                        <View style={styles.dividerLine} />
                    </View>

                    {/* CTA Buttons */}
                    <Pressable
                        onPress={() =>
                            role === "mentor"
                                ? router.push({
                                      pathname: "/(unauthenticated)/mentor-start-journey/[role]",
                                      params: { role: "mentor" },
                                  })
                                : router.push({
                                      pathname: "/(unauthenticated)/pastor-start-journey/[role]",
                                      params: { role: (role || "pastor") as Exclude<RoleParam, "mentor"> },
                                  })
                        }
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>Start Your Journey</Text>
                        <View style={styles.arrowCircle}>
                            <Ionicons name="arrow-forward" size={16} color={accent.tealDeep} />
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push("/(unauthenticated)/videos")}
                        style={styles.secondaryButton}
                    >
                        <View style={styles.playIconWrap}>
                            <Ionicons name="play" size={14} color="#fff" />
                        </View>
                        <Text style={styles.secondaryButtonText}>Watch Introduction</Text>
                    </Pressable>

                    {/* Social proof */}
                    <View style={styles.socialCard}>
                        <View style={styles.avatars}>
                            {avatars.map((avatar, idx) => (
                                <View
                                    key={idx}
                                    style={[
                                        styles.avatarWrap,
                                        idx === 1 && styles.avatarWrapMint,
                                        idx === 2 && styles.avatarWrapGold,
                                        idx > 0 ? { marginLeft: -10 } : null,
                                    ]}
                                >
                                    <Image source={avatar} style={styles.avatar} />
                                </View>
                            ))}
                        </View>
                        <View style={styles.socialTextWrap}>
                            <Text style={styles.socialCount}>500+</Text>
                            <Text style={styles.socialText}>{socialProofText}</Text>
                        </View>
                    </View>

                    {!!roleLabel && (
                        <Text style={styles.hiddenRoleText}>{roleLabel}</Text>
                    )}
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingHorizontal: 22,
        overflow: "hidden",
    },
    backButton: {
        position: "absolute",
        left: 14,
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    bgCircleTop: {
        position: "absolute",
        top: -120,
        right: -100,
        width: 320,
        height: 320,
        borderRadius: 160,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    bgCircleBottom: {
        position: "absolute",
        bottom: -80,
        left: -80,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    // Pill
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        paddingVertical: 7,
        paddingHorizontal: 16,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginBottom: 24,
    },
    pillDots: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    pillDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#7DD4F8",
    },
    pillDotGold: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: accent.gold,
    },
    pillText: {
        color: "rgba(255,255,255,0.9)",
        fontWeight: "600",
        fontSize: 12,
        letterSpacing: 0.5,
    },

    // Brand block
    brandBlock: {
        alignItems: "center",
        marginBottom: 28,
    },
    brandName: {
        fontSize: 13,
        color: "rgba(255,255,255,0.55)",
        fontWeight: "500",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    brandNameAccent: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "800",
        letterSpacing: 0.3,
        marginTop: 2,
    },
    brandDivider: {
        width: 40,
        height: 2,
        borderRadius: 1,
        backgroundColor: "rgba(125,212,248,0.6)",
        marginVertical: 10,
    },
    brandSub: {
        fontSize: 11,
        color: "rgba(255,255,255,0.45)",
        textAlign: "center",
        lineHeight: 17,
        letterSpacing: 0.2,
    },

    // Title
    titleWrap: {
        alignItems: "center",
        marginBottom: 20,
    },
    titleTop: {
        fontSize: 36,
        fontWeight: "300",
        color: "rgba(255,255,255,0.85)",
        letterSpacing: -0.5,
    },
    titleBottom: {
        fontSize: 38,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: -1,
        marginTop: -4,
    },
    titleAccent: {
        color: accent.gold,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 8,
        fontSize: 18,
        color: "rgba(255,255,255,0.85)",
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    subtitleAccent: {
        color: accent.mint,
        fontWeight: "700",
    },

    // Divider
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 28,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },

    // Primary button
    primaryButton: {
        width: "100%",
        borderRadius: 999,
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
    },
    primaryButtonText: {
        color: "#0A3F6B",
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.2,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(232, 200, 138, 0.35)",
        alignItems: "center",
        justifyContent: "center",
    },

    // Secondary button
    secondaryButton: {
        width: "100%",
        borderRadius: 999,
        paddingVertical: 15,
        paddingHorizontal: 24,
        borderWidth: 1.5,
        borderColor: "rgba(111, 212, 190, 0.45)",
        backgroundColor: "rgba(255,255,255,0.08)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginBottom: 28,
    },
    playIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: accent.mintSoft,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "rgba(255,255,255,0.9)",
        fontWeight: "600",
        fontSize: 15,
    },

    // Social proof card
    socialCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        borderLeftWidth: 3,
        borderLeftColor: accent.gold,
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 18,
        width: "100%",
    },
    avatars: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#0A5C8A",
    },
    avatarWrapMint: {
        borderColor: accent.mint,
    },
    avatarWrapGold: {
        borderColor: accent.gold,
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 14,
    },
    socialTextWrap: {
        flex: 1,
    },
    socialCount: {
        color: accent.gold,
        fontWeight: "800",
        fontSize: 16,
    },
    socialText: {
        color: "rgba(255,255,255,0.55)",
        fontSize: 12,
        fontWeight: "400",
        marginTop: 1,
    },

    hiddenRoleText: {
        position: "absolute",
        left: -9999,
        top: -9999,
    },
});