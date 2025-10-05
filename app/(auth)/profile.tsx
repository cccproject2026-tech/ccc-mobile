import { PastorNavigationHeader } from "@/components/pastor/Header";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import UploadSection from "./(components)/upload";

export default function Profile() {
    return (
        <LinearGradient
            colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
            style={{ flex: 1, justifyContent: "space-between" }}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.scrollContainer}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 40,
                    }}
                >
                    <PastorNavigationHeader
                        showDrawer={false}
                        showNotificationIcon={false}
                        wrapperClass="!justify-end"
                    />
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
                                    fontWeight: 500,
                                    lineHeight: 22,
                                    color: "#E9E010"
                                }}>
                                    Your profile is incomplete
                                </Text>
                                <TouchableOpacity className="border border-solid rounded-[25px]" style={{
                                    height: 38,
                                    borderColor: "#FFFFFF",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: 93
                                }}>
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: 500,
                                        lineHeight: 22,
                                        color: "#FFFFFFCC"
                                    }}>
                                        Skip
                                    </Text>
                                    <IconSymbol
                                        name="chevron.right"
                                        size={24}
                                        weight="medium"
                                        color={"#FFFFFFCC"}
                                    />
                                </TouchableOpacity>
                            </View>
                            <UploadSection />
                        </View>
                        <View className="mx-auto mt-12" style={{ marginBottom: 67, paddingBottom: 67 }}>
                            <Image className="w-auto mt-auto" source={icons.universityIcon} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
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
});
