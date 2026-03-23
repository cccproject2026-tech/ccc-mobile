import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useLogin } from "@/hooks/auth/useAuth";
import { useOnboardingStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

const accent = {
    gold: "#E8C88A",
    mint: "#6FD4BE",
    mintSoft: "rgba(111, 212, 190, 0.28)",
    tealDeep: "#0E5A62",
};

export default function LoginFormScreen() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();
    const { interestData } = useOnboardingStore();
    const { mutate: login, isPending: isLoading, error } = useLogin();

    const [email,        setEmail]        = useState(interestData?.email || (__DEV__ ? 'hipyvide@forexzig.com' : ''));
    const [password,     setPassword]     = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!error) return;
        const status  = error?.statusCode;
        const message = error?.message?.toLowerCase() || "";
        if (status === 400 && (message.includes("email not verified") || message.includes("verify email") || message.includes("unverified"))) {
            Alert.alert("Email Not Verified", "Please verify your email to continue.", [{
                text: "Verify Now",
                onPress: () => router.push({ pathname: "/(unauthenticated)/set-password", params: { email } }),
            }]);
        }
    }, [error]);

    const handleLogin = useCallback(() => {
        if (!email.trim())    { Alert.alert('Error', 'Please enter your email');    return; }
        if (!password.trim()) { Alert.alert('Error', 'Please enter your password'); return; }
        login({ email: email.trim(), password });
    }, [email, password, login]);

    const handleForgotPassword = useCallback(() => router.push('/(unauthenticated)/forgot-password'), [router]);
    const handleNewUser        = useCallback(() => router.push('/(unauthenticated)/interest-form'),   [router]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                locations={[0, 0.5, 1]}
                style={styles.gradient}
            >
                <TopBar showNotifications={false} showDrawer={false} />

                <KeyboardAwareScrollView
                    contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 16 }]}
                    showsVerticalScrollIndicator={false}
                >
                 

                    {/* Heading */}
                    <View style={styles.headingBlock}>
                        <Text style={styles.headingTitle}>Welcome back</Text>
                        <Text style={styles.headingSubtitle}>Log in to continue your journey.</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>

                        {/* Email */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.fieldLabel}>Email or Username</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="mail-outline" size={18} color={accent.mint} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="rgba(111, 212, 190, 0.35)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="none"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.fieldWrap}>
                            <View style={styles.fieldLabelRow}>
                                <Text style={styles.fieldLabel}>Password</Text>
                                <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                                    <Text style={styles.forgotText}>Forgot password?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={18} color={accent.mint} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor="rgba(111, 212, 190, 0.35)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    textContentType="none"
                                    passwordRules=""
                                    editable={!isLoading}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading} style={styles.eyeBtn}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={accent.mint} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Error */}
                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color="#FCA5A5" />
                                <Text style={styles.errorText}>
                                    {error?.response?.data?.message || error?.message || "Something went wrong"}
                                </Text>
                            </View>
                        )}

                        {/* Login button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.88}
                        >
                            {isLoading
                                ? <ActivityIndicator color="#1A4F7A" />
                                : <>
                                    <Text style={styles.loginBtnText}>Log In</Text>
                                    <View style={styles.loginBtnArrow}>
                                        <Ionicons name="arrow-forward" size={16} color={accent.tealDeep} />
                                    </View>
                                  </>
                            }
                        </TouchableOpacity>

                    </View>

                    {/* Divider */}
                    <View style={styles.orRow}>
                        <View style={styles.orLine} />
                        <Text style={styles.orText}>New here?</Text>
                        <View style={styles.orLine} />
                    </View>

                    {/* Submit Interest */}
                    <View style={styles.interestWrap}>
                        <TouchableOpacity style={styles.interestBtn} onPress={handleNewUser} disabled={isLoading} activeOpacity={0.85}>
                            <Text style={styles.interestBtnText}>Submit Interest</Text>
                            <Ionicons name="chevron-forward" size={14} color={accent.mint} />
                        </TouchableOpacity>
                        <Text style={styles.interestHint}>
                            Not registered yet? Submit your interest and we'll get you set up.
                        </Text>
                    </View>

                    {/* University logo */}
                    <View style={styles.universityWrap}>
                        <Image source={icons.universityIcon} style={styles.universityLogo} resizeMode="contain" />
                    </View>

                </KeyboardAwareScrollView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    scroll:   { flexGrow: 1, paddingHorizontal: 24 },

    // Logo card
    logoCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginTop: 18,
        marginBottom: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(232, 200, 138, 0.25)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    logo: { width: "100%", height: 72 },

    // Heading
    headingBlock: { marginBottom: 18, gap: 5, marginTop: 100 },
    headingTitle:    { fontSize: 22, fontWeight: "700", color: "#fff",                   letterSpacing: -0.3 },
    headingSubtitle: { fontSize: 13, fontWeight: "400", color: "rgba(255,255,255,0.5)" },

    // Form
    form: { gap: 14, marginBottom: 18 },

    // Field
    fieldWrap:     { gap: 6 },
    fieldLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    fieldLabel:    { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "600", letterSpacing: 0.3 },
    forgotText:    { color: accent.mint,  fontSize: 12, fontWeight: "600" },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.22)",
        borderRadius: 10,
        paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: "#fff",
    },
    eyeBtn: { paddingLeft: 10, paddingVertical: 14 },

    // Error
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(252,165,165,0.1)",
        borderWidth: 1,
        borderColor: "rgba(252,165,165,0.25)",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    errorText: { color: "#FCA5A5", fontSize: 13, fontWeight: "500", flex: 1, lineHeight: 18 },

    // Login button
    loginBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginTop: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
    },
    loginBtnDisabled: { opacity: 0.6 },
    loginBtnText:  { color: accent.tealDeep, fontSize: 16, fontWeight: "700" },
    loginBtnArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(232, 200, 138, 0.35)", alignItems: "center", justifyContent: "center" },

    // OR divider
    orRow:  { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    orLine: { flex: 1, height: 1, backgroundColor: "rgba(111, 212, 190, 0.22)" },
    orText: { color: "rgba(232, 200, 138, 0.95)", fontSize: 12, fontWeight: "600" },

    // Submit interest
    interestWrap: { gap: 9, marginBottom: 28 },
    interestBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(111, 212, 190, 0.35)",
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 18,
    },
    interestBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
    interestHint:    { color: "rgba(255,255,255,0.35)", fontSize: 11, lineHeight: 17, textAlign: "center" },

    // University
    universityWrap: { alignItems: "center", marginBottom: 6 },
    universityLogo: { width: 200, height: 44, opacity: 0.65 },
});