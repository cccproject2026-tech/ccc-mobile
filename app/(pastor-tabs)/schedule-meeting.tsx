import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Stack, router, useLocalSearchParams } from "expo-router"
import React from "react"
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
const ScheduleMeeting = () => {
  const params = useLocalSearchParams()
  const mentorData = params.mentorData
    ? JSON.parse(params.mentorData as string)
    : null

  const [selected, setSelected] = React.useState("")
  const [selectedValue, setSelectedValue] = React.useState("")

  const availableSlots = [
    { time: "09:00 am - 10:00 am" },
    { time: "11:00 am - 12:00 pm" },
    { time: "01:00 pm - 02:00 pm" },
    { time: "03:00 pm - 04:00 pm" },
  ]

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader />
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Image
                    source={icons.forward}
                    style={{
                      width: 18,
                      height: 18,
                      transform: [{ scaleX: -1 }],
                    }}
                  />
                  <Text className="text-white font-semibold text-[17px]">
                    {mentorData?.name || "John Doe"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ width: "100%" }}>
              <View className="h-[0.5px] bg-white/30 mt-3" />
            </View>
            <View
              style={{
                marginVertical: 10,
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#FFFFFF73",
                  borderRadius: 8,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: 15,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LinearGradient
                      colors={[
                        Colors.lightBlueGradientTwo,
                        Colors.darkBlueGradientTwo,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        padding: 2,
                        borderRadius: 999999,
                      }}
                    >
                      <Image
                        source={icons.dummyUser}
                        style={{ width: 80, height: 80, borderRadius: 999999 }}
                      />
                    </LinearGradient>
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          color: "white",
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        {mentorData?.name || "John Doe"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "white",
                          fontWeight: "400",
                          marginBottom: 8,
                        }}
                      >
                        {mentorData?.role || "Field Mentor"}
                      </Text>
                      <View
                        style={[styles.mentorIconContainer, { paddingTop: 10 }]}
                      >
                        <Image source={icons.phone} style={styles.MentorIcon} />
                        <Image
                          source={icons.message}
                          style={styles.MentorIcon}
                        />
                        <Image source={icons.mail} style={styles.MentorIcon} />
                        <Image
                          source={icons.whatsapp}
                          style={styles.MentorIcon}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.sectionMargin}>
                    <Text className="text-white font-medium text-[16px] mt-4">
                      Profile Information :
                    </Text>
                  </View>

                  {/* Intro Summary */}
                  <View style={styles.summaryContainer}>
                    <Text style={styles.whiteText}>
                      {mentorData?.description ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit ex ea commodo consequat. Duis"}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  marginTop: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  <View className="flex flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={24} color="white" />
                    <Text className="text-white font-semibold text-[16px] flex flex-row items-center gap-2">
                      Schedule a Meeting
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "white",
                      fontWeight: "500",
                      marginBottom: 12,
                    }}
                  >
                    Select Available Date
                  </Text>

                  {/* Calendly Integration Space */}
                  <View
                    style={{
                      height: 100,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 20,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: 14,
                        fontWeight: "400",
                      }}
                    >
                      Calendly Widget Integration
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  )
}

export default ScheduleMeeting

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
  sectionMargin: {
    marginVertical: 10,
  },
  whiteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  summaryContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF73",
  },
  mentorIconContainer: {
    flexDirection: "row",
    gap: 16,
  },
  MentorIcon: {
    width: 18,
    height: 18,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  scheduleButton: {
    backgroundColor: "#1A4882",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  scheduleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
