import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApplicationRejectedScreen() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                style={[styles.container, { paddingBottom: bottom + 24 }]}
            >
                <TopBar showDrawer={false} showNotifications={false} />

                <View style={styles.content}>
                    <View style={styles.iconWrap}>
                        <Ionicons
                            name="close-circle-outline"
                            size={40}
                            color="#FCA5A5"
                        />
                    </View>
                    <Text style={styles.title}>Application Not Approved</Text>
                    <Text style={styles.message}>
                        Unfortunately, your application was not approved at this
                        time. If you believe this is an error, please contact the
                        Center for Community Change team.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace("/(unauthenticated)")}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>Return to Home</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.logoContainer}>
                    <Image
                        source={icons.universityIcon}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.35)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#fff",
        textAlign: "center",
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 28,
    },
    button: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
    },
    buttonText: {
        color: "#0E5A62",
        fontSize: 16,
        fontWeight: "700",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    logo: {
        width: 220,
        height: 50,
    },
});
