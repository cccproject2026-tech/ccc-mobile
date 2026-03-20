import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/stores";

type PastorRole = "pastor" | "layleader" | "seminarian";

const mapRoleToLabel = (role?: string): string => {
    switch (role) {
        case "pastor": return "Pastor";
        case "layleader": return "Lay Leader";
        case "seminarian": return "Seminarian";
        default: return "";
    }
};

export default function PastorJourneyStep3Screen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { role } = useLocalSearchParams<{ role?: PastorRole }>();

    const { user, isAuthenticated } = useAuthStore();
    const roleLabel = useMemo(() => mapRoleToLabel(role), [role]);
    const isLoggedInPastor = isAuthenticated && user?.role === "pastor";

    const handleBack = useCallback(() => {
        try { router.back(); } catch { router.replace("/"); }
    }, [router]);

    const handleSkip = useCallback(() => {
        router.push({
            pathname: "/(unauthenticated)/interest-form",
            params: role ? { role } : undefined,
        });
    }, [router, role]);

    const handleStart = useCallback(() => {
        if (isLoggedInPastor) {
            router.replace("/(pastor)/(tabs)");
            return;
        }
        router.push({
            pathname: "/(unauthenticated)/interest-form",
            params: role ? { role } : undefined,
        });
    }, [router, role, isLoggedInPastor]);

    const handleLogin = useCallback(() => {
        router.push("/(unauthenticated)/login-form");
    }, [router]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#1A4F7A", "#1B6FA3", "#2389C2"]}
                locations={[0, 0.5, 1]}
                style={[styles.gradient, { paddingTop: top || 44, paddingBottom: bottom || 24 }]}
            >
                {/* Top bar */}
                <View style={styles.topBar}>
                    <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.9)" />
                    </Pressable>
                    <Pressable onPress={handleSkip} hitSlop={12}>
                        <Text style={styles.skipText}>Skip</Text>
                    </Pressable>
                </View>

                {/* Content */}
                <View style={styles.content}>

                    {/* Icon */}
                    <View style={styles.illustrationArea}>
                        <View style={styles.outerRing}>
                            <View style={styles.innerRing}>
                                <View style={styles.centerIcon}>
                                    <Ionicons name="rocket-outline" size={28} color="#fff" />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Quote */}
                    <View style={styles.quoteBlock}>
                        <Text style={styles.quoteMark}>"</Text>
                        <Text style={styles.quoteText}>
                            Christ's method alone will bring{" "}
                            <Text style={styles.quoteHighlight}>true success</Text>
                            {" "}in reaching the people.
                        </Text>
                        <Text style={styles.quoteSource}>— Ellen G. White</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Ready section */}
                    <View style={styles.readyBlock}>
                        <Text style={styles.readyEyebrow}>You're all set</Text>
                        <Text style={styles.readyTitle}>Ready to begin your first step?</Text>
                        <Text style={styles.readyDesc}>
                            Whether you're new or returning — your journey toward greater community impact starts here.
                        </Text>
                    </View>

                </View>

                {/* Bottom actions */}
                <View style={styles.bottomArea}>

                    {/* New user — primary */}
                    <Pressable onPress={handleStart} style={styles.startBtn}>
                        <View style={styles.startBtnLeft}>
                            <Text style={styles.startBtnLabel}>New here?</Text>
                            <Text style={styles.startBtnTitle}>Start My First Step</Text>
                        </View>
                        <View style={styles.startBtnArrow}>
                            <Ionicons name="arrow-forward" size={16} color="#1A4F7A" />
                        </View>
                    </Pressable>

                    {/* Existing user — secondary, equal weight */}
                    {!isLoggedInPastor && (
                        <Pressable onPress={handleLogin} style={styles.loginBtn}>
                            <View style={styles.loginBtnLeft}>
                                <Text style={styles.loginBtnLabel}>Already have an account?</Text>
                                <Text style={styles.loginBtnTitle}>Log In</Text>
                            </View>
                            <View style={styles.loginBtnArrow}>
                                <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
                            </View>
                        </Pressable>
                    )}

                </View>

                {!!roleLabel && <Text style={styles.hiddenRoleText}>{roleLabel}</Text>}
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingHorizontal: 24,
    },

    // Top bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    skipText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        fontWeight: "500",
    },

    // Content
    content: {
        flex: 1,
    },

    // Illustration
    illustrationArea: {
        alignItems: "center",
        marginBottom: 28,
    },
    outerRing: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    innerRing: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },
    centerIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },

    // Quote
    quoteBlock: {
        marginBottom: 22,
    },
    quoteMark: {
        fontSize: 44,
        fontWeight: "800",
        color: "rgba(255,255,255,0.14)",
        lineHeight: 36,
        marginBottom: 4,
    },
    quoteText: {
        fontSize: 18,
        fontWeight: "400",
        color: "rgba(255,255,255,0.7)",
        lineHeight: 28,
        fontStyle: "italic",
    },
    quoteHighlight: {
        color: "#fff",
        fontWeight: "700",
        fontStyle: "italic",
    },
    quoteSource: {
        marginTop: 10,
        fontSize: 12,
        color: "rgba(255,255,255,0.35)",
        letterSpacing: 0.4,
        fontWeight: "500",
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginBottom: 22,
    },

    // Ready block
    readyBlock: {
        gap: 6,
    },
    readyEyebrow: {
        fontSize: 11,
        fontWeight: "600",
        color: "rgba(255,255,255,0.4)",
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    readyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
        lineHeight: 28,
    },
    readyDesc: {
        fontSize: 13,
        fontWeight: "400",
        color: "rgba(255,255,255,0.5)",
        lineHeight: 20,
        marginTop: 2,
    },

    // Bottom
    bottomArea: {
        gap: 10,
        paddingTop: 4,
        paddingBottom: 16,
    },

    // Start button (new user)
    startBtn: {
        width: "100%",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 18,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
    },
    startBtnLeft: {
        gap: 2,
    },
    startBtnLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: "rgba(26,79,122,0.5)",
        letterSpacing: 0.3,
    },
    startBtnTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1A4F7A",
    },
    startBtnArrow: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#E0F0FA",
        alignItems: "center",
        justifyContent: "center",
    },

    // Login button (existing user)
    loginBtn: {
        width: "100%",
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 18,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    loginBtnLeft: {
        gap: 2,
    },
    loginBtnLabel: {
        fontSize: 11,
        fontWeight: "500",
        color: "rgba(255,255,255,0.4)",
        letterSpacing: 0.3,
    },
    loginBtnTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#fff",
    },
    loginBtnArrow: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },

    hiddenRoleText: {
        position: "absolute",
        left: -9999,
        top: -9999,
    },
});