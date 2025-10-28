// app/(login)/login-form.tsx
import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginFormScreen() {
    const { showProfileSetup } = useLocalSearchParams();
    const { top, bottom } = useSafeAreaInsets();
    const { login, isLoading, error, interestData } = useAuth();

    const [email, setEmail] = useState(interestData?.email || "");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        try {
            await login(email, password);
            // Navigation handled by AuthContext
        } catch (err) {
            Alert.alert("Login Failed", error || "Invalid credentials");
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#176192", "#1D548D", "#264387"]}
                style={styles.container}
            >
                <TopBar showNotifications={false} showDrawer={false} />
                <KeyboardAwareScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >

                    {/* CCC Logo */}
                    <View style={styles.cccLogoContainer}>
                        <Image source={icons.communityImage} style={styles.cccLogo} resizeMode="contain" />
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email or User Name"
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isLoading}
                        />

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={24}
                                    color="rgba(255,255,255,0.6)"
                                />
                            </TouchableOpacity>
                        </View>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#1A5490" />
                            ) : (
                                <Text style={styles.loginButtonText}>Log in</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => {
                                router.push("/(login)/forgot-password");
                            }}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* New User / Submit Interest */}
                    <View style={styles.actionButtonWrapper}>
                        <LinearGradient
                            colors={["#7C3AED", "#3B82F6", "#1E40AF"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientContainer}
                        >
                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    onPress={() => router.push("/(login)/set-password")}
                                    style={styles.actionButton}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.actionButtonText}>New User {">>"}</Text>
                                </TouchableOpacity>

                                <View style={styles.verticalDivider} />

                                <TouchableOpacity
                                    onPress={() => router.push("/(login)/interest-form")}
                                    style={styles.actionButton}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.actionButtonText}>Submit Interest</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Andrews University Logo */}
                    <View style={styles.universityLogoContainer}>
                        <Image source={icons.universityIcon} style={styles.universityLogo} resizeMode="contain" />
                    </View>
                </KeyboardAwareScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    cccLogoContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40,
        backgroundColor: "#fff",
        marginHorizontal: 35,
        paddingVertical: 35,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    cccLogo: {
        width: "100%",
        height: 90,
    },
    formContainer: {
        paddingHorizontal: 35,
        marginBottom: 60,
    },
    input: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.8)",
        borderRadius: 10,
        padding: 16,
        fontSize: 16,
        color: "#fff",
        marginBottom: 20,
    },
    passwordContainer: {
        position: "relative",
        marginBottom: 20,
    },
    passwordInput: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.8)",
        borderRadius: 10,
        padding: 16,
        paddingRight: 50,
        fontSize: 16,
        color: "#fff",
    },
    eyeIcon: {
        position: "absolute",
        right: 14,
        top: 16,
    },
    errorContainer: {
        backgroundColor: "rgba(255,0,0,0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: "#FFB4B4",
        fontSize: 14,
        textAlign: "center",
    },
    loginButton: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 16,
    },
    loginButtonText: {
        color: "#1A5490",
        fontSize: 18,
        fontWeight: "600",
    },
    forgotPassword: {
        alignItems: "flex-end",
    },
    forgotPasswordText: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 16,
    },
    actionButtonWrapper: {
        paddingHorizontal: 35,
        marginBottom: 60,
    },
    gradientContainer: {
        borderRadius: 10,
        borderWidth: 1.5,
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
        width: 1.5,
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.4)",
    },
    universityLogoContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    universityLogo: {
        width: 220,
        height: 50,
    },
});
