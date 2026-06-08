import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PastorRole = "pastor" | "layleader" | "seminarian";

const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.28)",
    tealDeep: "#0E5A62",
};

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
        router.push(
            `/(unauthenticated)/pastor-start-journey/step-3/${role || "pastor"}` as any
        );
    }, [router, role]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                locations={[0, 0.5, 1]}
                style={[styles.gradient, { paddingTop: top || 44, paddingBottom: bottom || 24 }]}
            >
                <View style={styles.bgCircleTop} />
                <View style={styles.bgCircleBottom} />

                {}
                <View style={styles.topBar}>
                    <Pressable onPress={handleBack} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.9)" />
                    </Pressable>
                </View>

                {}
                <View style={styles.content}>

                    {}
                    <View style={styles.titleBlock}>
                        <Text style={styles.eyebrow}>How it works</Text>
                        <Text style={styles.titleLight}>Your journey is</Text>
                        <Text style={styles.titleStrong}>
                            <Text style={styles.titleAccent}>simple</Text>.
                        </Text>
                        <Text style={styles.subtitle}>
                            <Text style={styles.subtitleLead}>Three practices</Text>
                            {" "}that will shape your{" "}
                            <Text style={styles.subtitleAccent}>impact</Text>
                            {" "}as a leader.
                        </Text>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Ionicons name="leaf-outline" size={14} color={accent.mint} />
                        <View style={styles.dividerLine} />
                    </View>

                    {}
                    <View style={styles.cardList}>
                        {JOURNEY_STEPS.map((step, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.card,
                                    i % 2 === 0 ? styles.cardStripeGold : styles.cardStripeMint,
                                ]}
                            >
                                {}
                                <Text
                                    style={[
                                        styles.cardNumber,
                                        i % 2 === 0 ? styles.cardNumberGold : styles.cardNumberMint,
                                    ]}
                                >
                                    {step.number}
                                </Text>

                                {}
                                <View style={styles.cardBody}>
                                    <Text style={styles.cardTitle}>{step.title}</Text>
                                    <Text style={styles.cardDesc}>{step.desc}</Text>
                                </View>

                                {}
                                <View style={styles.cardIcon}>
                                    <Ionicons name={step.icon} size={20} color="#fff" />
                                </View>
                            </View>
                        ))}
                    </View>

                    {!!roleLabel && <Text style={styles.hiddenRoleText}>{roleLabel}</Text>}
                </View>

                {}
                <View style={styles.bottomArea}>
                    <Pressable onPress={handleNext} style={styles.nextBtn}>
                        <Text style={styles.nextText}>Next</Text>
                        <View style={styles.nextArrowCircle}>
                            <Ionicons name="arrow-forward" size={16} color={accent.tealDeep} />
                        </View>
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
        overflow: "hidden",
    },
    bgCircleTop: {
        position: "absolute",
        top: -130,
        right: -100,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    bgCircleBottom: {
        position: "absolute",
        bottom: -90,
        left: -80,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: "rgba(255,255,255,0.04)",
    },

    
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 36,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.14)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },

    
    content: {
        flex: 1,
    },

    
    titleBlock: {
        marginBottom: 20,
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: "600",
        color: accent.mint,
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
    titleAccent: {
        color: accent.gold,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: "400",
        color: "rgba(255,255,255,0.55)",
        lineHeight: 20,
    },
    subtitleLead: {
        color: accent.gold,
        fontWeight: "600",
    },
    subtitleAccent: {
        color: accent.mint,
        fontWeight: "600",
    },

    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.12)",
    },

    
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
        borderLeftWidth: 3,
    },
    cardStripeGold: {
        borderLeftColor: accent.gold,
        borderColor: "rgba(111, 212, 190, 0.25)",
    },
    cardStripeMint: {
        borderLeftColor: accent.mint,
        borderColor: "rgba(255,255,255,0.14)",
    },
    cardNumber: {
        fontSize: 22,
        fontWeight: "800",
        width: 32,
        letterSpacing: -0.5,
    },
    cardNumberGold: {
        color: accent.gold,
    },
    cardNumberMint: {
        color: accent.mint,
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
        backgroundColor: accent.mintSoft,
        alignItems: "center",
        justifyContent: "center",
    },

    
    bottomArea: {
        paddingTop: 8,
        paddingBottom: 18,
    },
    nextBtn: {
        width: "100%",
        borderRadius: 999,
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
    },
    nextText: {
        color: "#0A3F6B",
        fontWeight: "700",
        fontSize: 16,
        letterSpacing: 0.2,
    },
    nextArrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(232, 200, 138, 0.35)",
        alignItems: "center",
        justifyContent: "center",
    },
    hiddenRoleText: {
        position: "absolute",
        left: -9999,
        top: -9999,
    },
});