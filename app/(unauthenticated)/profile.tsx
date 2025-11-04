import UploadSection from "@/components/director/upload";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useCompleteProfile } from "@/hooks/profile/useCompleteProfile";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Profile() {
    // ✅ UPDATED: Use React Query hook
    const { mutate: completeProfile, isPending: isLoading } = useCompleteProfile();

    const [uploading, setUploading] = useState(false);

    // ✅ UPDATED: Use mutation hook for skip
    const handleSkip = async () => {
        Alert.alert(
            "Skip Profile Setup?",
            "You can complete your profile later from settings.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Skip",
                    onPress: () => {
                        completeProfile(undefined, {
                            onSuccess: () => {
                                router.replace("/(pastor)/(tabs)");
                            },
                            onError: (error: any) => {
                                Alert.alert("Error", error.message || "Failed to skip. Please try again.");
                            },
                        });
                    },
                },
            ]
        );
    };

    // ✅ UPDATED: Use mutation hook for complete
    const handleComplete = async () => {
        try {
            setUploading(true);

            // Simulate upload/save process (replace with actual upload logic)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mark profile as complete
            completeProfile(undefined, {
                onSuccess: () => {
                    Alert.alert(
                        "Profile Completed",
                        "Your profile has been set up successfully.",
                        [
                            {
                                text: "OK",
                                onPress: () => router.replace("/(pastor)/(tabs)"),
                            },
                        ]
                    );
                },
                onError: (error: any) => {
                    Alert.alert("Error", error.message || "Failed to save profile. Please try again.");
                },
            });
        } catch (error) {
            Alert.alert("Error", "Failed to save profile. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
            style={{ flex: 1, justifyContent: "space-between" }}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.scrollContainer}>
                <PastorNavigationHeader showNameTag />
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 40,
                    }}
                >
                    <View style={{
                        display: "flex",
                        justifyContent: "space-between",
                        height: "100%",
                        marginTop: 52,
                        paddingHorizontal: 16
                    }}>
                        <View style={{
                            display: "flex",
                            gap: 66
                        }}>
                            <View style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <Text style={{
                                    fontFamily: "AlbertBold",
                                    fontSize: 16,
                                    fontWeight: "500",
                                    lineHeight: 22,
                                    color: "#E9E010"
                                }}>
                                    Your profile is incomplete
                                </Text>
                                <TouchableOpacity
                                    className="border border-solid rounded-[25px]"
                                    style={{
                                        height: 38,
                                        borderColor: "#FFFFFF",
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: 93,
                                        gap: 5,
                                    }}
                                    onPress={handleSkip}
                                    disabled={isLoading || uploading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFFCC" />
                                    ) : (
                                        <>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: "500",
                                                lineHeight: 22,
                                                color: "#FFFFFFCC"
                                            }}>
                                                Skip
                                            </Text>
                                            <IconSymbol
                                                name="chevron.right"
                                                size={12}
                                                weight="medium"
                                                color={"#FFFFFFCC"}
                                            />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <UploadSection />

                            {/* Complete Button */}
                            <TouchableOpacity
                                style={styles.completeButton}
                                onPress={handleComplete}
                                disabled={isLoading || uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="#1A5490" />
                                ) : (
                                    <Text style={styles.completeButtonText}>
                                        Complete Profile
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="mx-auto mt-12" style={{ marginBottom: 67, paddingBottom: 67 }}>
                            <Image className="w-auto mt-auto" source={icons.universityIcon} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    searchContainer: {
        marginHorizontal: 16,
        marginTop: 16,
    },
    separator: {
        height: 2,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        marginVertical: 18,
    },
    completeButton: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 20,
        marginHorizontal: 20,
    },
    completeButtonText: {
        color: "#1A5490",
        fontSize: 16,
        fontWeight: "600",
    },
});
