import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useRef, useState } from "react";
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

export default function ForgotPasswordScreen() {
    const { top, bottom } = useSafeAreaInsets();
    const { resetPassword, isLoading } = useAuth();

    // Step 1: Email, Step 2: OTP + New Password
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("john.doe@example.com");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Refs for OTP inputs
    const otpRefs = useRef<Array<TextInput | null>>([]);

    const handleVerifyEmail = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            // Mock API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            Alert.alert("OTP Sent", "A 4-digit OTP has been sent to your email.");
            setStep(2);
        } catch (error) {
            Alert.alert("Error", "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (value: string, index: number) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleResetPassword = async () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 4) {
            Alert.alert("Error", "Please enter the 4-digit OTP");
            return;
        }

        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all password fields");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        try {
            // Call resetPassword from context
            await resetPassword(email, newPassword);

            Alert.alert(
                "Success!",
                "Your password has been reset successfully. You can now login with your new password.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/(unauthenticated)/login-form"),
                    },
                ]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to reset password. Please try again.");
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#176192", "#1D548D", "#264387"]}
                style={styles.container}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <TopBar showNotifications={false} showDrawer={false} />

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image source={icons.communityImage} style={styles.logo} resizeMode="contain" />
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        {/* Step 1: Email Verification */}
                        {step === 1 && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />

                                <TouchableOpacity
                                    style={styles.verifyButton}
                                    onPress={handleVerifyEmail}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={["#7C3AED", "#3B82F6"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.gradientButton}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.buttonText}>Verify Email ID</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Step 2: OTP + New Password */}
                        {step === 2 && (
                            <>
                                <Text style={styles.otpLabel}>
                                    An OTP has been sent to your email.{"\n"}
                                    Please enter the OTP to verify your email
                                </Text>

                                {/* OTP Inputs */}
                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { otpRefs.current[index] = ref; }}
                                            style={[styles.otpInput, digit && styles.otpInputFilled]}
                                            value={digit}
                                            onChangeText={(value) => handleOTPChange(value, index)}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            selectTextOnFocus
                                        />
                                    ))}
                                </View>

                                {/* New Password */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter New Password"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showNewPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                                            size={24}
                                            color="rgba(255,255,255,0.6)"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Confirm Password */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Confirm New Password"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={24}
                                            color="rgba(255,255,255,0.6)"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Reset Password Button */}
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#1A5490" />
                                    ) : (
                                        <Text style={styles.resetButtonText}>Reset Password</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
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
    logoContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40,
        backgroundColor: "#fff",
        marginHorizontal: 35,
        paddingVertical: 35,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    logo: {
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
        marginBottom: 24,
    },
    verifyButton: {
        marginTop: 20,
    },
    gradientButton: {
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    otpLabel: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 20,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        marginBottom: 40,
    },
    otpInput: {
        width: 60,
        height: 60,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.8)",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 24,
        color: "#fff",
        fontWeight: "bold",
    },
    otpInputFilled: {
        borderColor: "#FFD700",
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
    resetButton: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 20,
    },
    resetButtonText: {
        color: "#1A5490",
        fontSize: 16,
        fontWeight: "600",
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
