import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useCheckOnboardingStatus } from "@/hooks/onboarding/useOnboarding";
import { getCheckOnboardingStatusErrorMessage } from "@/utils/onboarding-navigation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    tealDeep: "#0E5A62",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContinueApplicationScreen() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();
    const { mutate: checkStatus, isPending } = useCheckOnboardingStatus();

    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleContinue = () => {
        setErrorMessage(null);
        const trimmed = email.trim();

        if (!trimmed) {
            setErrorMessage("Please enter your email address.");
            return;
        }
        if (!EMAIL_REGEX.test(trimmed)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }        checkStatus(trimmed, {
            onError: (error: { statusCode?: number; message?: string }) => {
                setErrorMessage(getCheckOnboardingStatusErrorMessage(error));
            },
        });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                style={[styles.container, { paddingBottom: bottom }]}
            >
                <View style={styles.bgCircleTop} />
                <View style={styles.bgCircleBottom} />
                <TopBar showDrawer={false} showNotifications={false} />

                <KeyboardAwareScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: bottom + 20 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        hitSlop={10}
                    >
                        <Ionicons name="chevron-back" size={26} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.iconWrap}>
                            <Ionicons
                                name="mail-open-outline"
                                size={26}
                                color={accent.mint}
                            />
                        </View>
                        <Text style={styles.title}>Continue Application</Text>
                        <Text style={styles.subtitle}>
                            Enter the email you used when submitting your interest
                            form. We will take you to the right step in your
                            application.
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.label}>Email address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errorMessage) setErrorMessage(null);
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isPending}
                        />

                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Ionicons
                                    name="alert-circle-outline"
                                    size={18}
                                    color="#FCA5A5"
                                />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                isPending && styles.continueButtonDisabled,
                            ]}
                            onPress={handleContinue}
                            disabled={isPending}
                            activeOpacity={0.85}
                        >
                            {isPending ? (
                                <ActivityIndicator color={accent.tealDeep} />
                            ) : (
                                <Text style={styles.continueButtonText}>
                                    Continue
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.logoContainer}>
                        <Image
                            source={icons.universityIcon}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                </KeyboardAwareScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, overflow: "hidden" },
    bgCircleTop: {
        position: "absolute",
        top: -120,
        right: -100,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: "rgba(255,255,255,0.05)",
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    backButton: {
        alignSelf: "flex-start",
        marginTop: 8,
        marginBottom: 8,
        padding: 4,
    },
    header: {
        alignItems: "center",
        marginTop: 8,
        marginBottom: 20,
    },
    iconWrap: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "rgba(111, 212, 190, 0.25)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.35)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#fff",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.82)",
        textAlign: "center",
        lineHeight: 19,
        paddingHorizontal: 8,
    },
    formCard: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        padding: 16,
    },
    label: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.3)",
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: "#fff",
        marginBottom: 12,
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.35)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    errorText: {
        flex: 1,
        color: "#FCA5A5",
        fontSize: 13,
        lineHeight: 18,
    },
    continueButton: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 4,
    },
    continueButtonDisabled: {
        opacity: 0.75,
    },
    continueButtonText: {
        color: accent.tealDeep,
        fontSize: 16,
        fontWeight: "700",
    },
    logoContainer: {
        alignItems: "center",
        marginTop: 32,
        marginBottom: 24,
    },
    logo: {
        width: 220,
        height: 50,
    },
});
