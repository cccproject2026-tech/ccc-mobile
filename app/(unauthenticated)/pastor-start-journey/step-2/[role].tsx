import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PastorRole = "pastor" | "layleader" | "seminarian";

const mapRoleToLabel = (role?: string): string => {
    switch (role) {
        case "pastor": return "Pastor";
        case "layleader": return "Lay Leader";
        case "seminarian": return "Seminarian";
        default: return "";
    }
};

const JOURNEY_STEPS = [
    {
        icon: "footsteps-outline" as const,
        number: "01",
        title: "Follow small steps",
        desc: "Complete bite-sized tasks assigned to you for your growth.",
    },
    {
        icon: "chatbubble-ellipses-outline" as const,
        number: "02",
        title: "Talk to your mentor",
        desc: "Connect regularly for guidance and support.",
    },
    {
        icon: "globe-outline" as const,
        number: "03",
        title: "Take action in your community",
        desc: "Put to action what you learned as the Holy Spirit guides you.",
    },
];

export default function PastorJourneyStep2Screen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { role } = useLocalSearchParams<{ role?: PastorRole }>();
    const roleLabel = useMemo(() => mapRoleToLabel(role), [role]);

    const handleBack = useCallback(() => {
        try { router.back(); } catch { router.replace("/"); }
    }, [router]);

    const handleNext = useCallback(() => {
        router.push({
            pathname: "/(unauthenticated)/interest-form",
            params: role ? { role } : undefined,
        });
    }, [router, role]);

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
                </View>

                {/* Content */}
                <View style={styles.content}>

                    {/* Page title block */}
                    <View style={styles.titleBlock}>
                        <Text style={styles.eyebrow}>How it works</Text>
                        <Text style={styles.titleLight}>Your journey is</Text>
                        <Text style={styles.titleStrong}>simple.</Text>
                        <Text style={styles.subtitle}>
                            Three practices that will shape your impact as a leader.
                        </Text>
                    </View>

                    {/* Journey cards */}
                    <View style={styles.cardList}>
                        {JOURNEY_STEPS.map((step, i) => (
                            <View key={i} style={styles.card}>
                                {/* Left: number */}
                                <Text style={styles.cardNumber}>{step.number}</Text>

                                {/* Center: text */}
                                <View style={styles.cardBody}>
                                    <Text style={styles.cardTitle}>{step.title}</Text>
                                    <Text style={styles.cardDesc}>{step.desc}</Text>
                                </View>

                                {/* Right: icon */}
                                <View style={styles.cardIcon}>
                                    <Ionicons name={step.icon} size={20} color="rgba(255,255,255,0.55)" />
                                </View>
                            </View>
                        ))}
                    </View>

                    {!!roleLabel && <Text style={styles.hiddenRoleText}>{roleLabel}</Text>}
                </View>

                {/* Bottom */}
                <View style={styles.bottomArea}>
                    <Pressable onPress={handleNext} style={styles.nextBtn}>
                        <Text style={styles.nextText}>Next</Text>
                        <Ionicons name="arrow-forward" size={18} color="#1A4F7A" />
                    </Pressable>
                </View>
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
        marginBottom: 36,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },

    // Content
    content: {
        flex: 1,
    },

    // Title block
    titleBlock: {
        marginBottom: 32,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: "600",
        color: "rgba(255,255,255,0.45)",
        letterSpacing: 2,
        textTransform: "uppercase",
        marginBottom: 10,
    },
    titleLight: {
        fontSize: 28,
        fontWeight: "300",
        color: "rgba(255,255,255,0.7)",
        lineHeight: 34,
    },
    titleStrong: {
        fontSize: 38,
        fontWeight: "800",
        color: "#fff",
        lineHeight: 44,
        letterSpacing: -0.5,
    },
    subtitle: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: "400",
        color: "rgba(255,255,255,0.45)",
        lineHeight: 20,
    },

    // Cards
    cardList: {
        gap: 12,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    cardNumber: {
        fontSize: 22,
        fontWeight: "800",
        color: "rgba(255,255,255,0.18)",
        width: 32,
        letterSpacing: -0.5,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
        lineHeight: 20,
    },
    cardDesc: {
        fontSize: 12,
        fontWeight: "400",
        color: "rgba(255,255,255,0.5)",
        lineHeight: 18,
    },
    cardIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },

    // Bottom
    bottomArea: {
        paddingTop: 8,
    },
    nextBtn: {
        width: "100%",
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    nextText: {
        color: "#1A4F7A",
        fontWeight: "700",
        fontSize: 15,
    },
    hiddenRoleText: {
        position: "absolute",
        left: -9999,
        top: -9999,
    },
});