import { Tab } from "@/components/atom/tab"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
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

export default function QueriesScreen() {
  const { data: dataParam } = useLocalSearchParams()
  const data = dataParam ? JSON.parse(dataParam as string) : null

  const [activeTab, setActiveTab] = React.useState("New")

  const availableTabs = [
    { tab: "New" },
    { tab: "Answered" },
    { tab: "Pending" },
  ]

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName)
    const routeMap = {
      "New": "/(pastor-tabs)/roadmap/queries/new",
      "Answered": "/(pastor-tabs)/roadmap/queries/answered",
      "Pending": "/(pastor-tabs)/roadmap/queries/pending"
    } as const;

    router.push({
      pathname: routeMap[tabName as keyof typeof routeMap],
      params: { data: JSON.stringify(data) }
    })
  }

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
            marginTop: 4
            <PastorNavigationHeader wrapperClass="mt-5" showNameTag={true} />

            {/* Header Section */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <View
                  style={{
                    flexDirection: "row",
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
                  <View style={{ flexDirection: "column" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "white",
                        fontWeight: "500",
                      }}
                    >
                      Queries
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "white",
                        fontWeight: "200",
                      }}
                    >
                      Revitalization Roadmap {data?.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Tabs Section */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 15,
                width: "100%",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              {availableTabs.map((e, i) => (
                <Tab
                  key={i}
                  data={e}
                  tabs={activeTab}
                  setTabs={setActiveTab}
                  onPress={() => handleTabPress(e.tab)}
                />
              ))}
            </View>

            {/* Content Section - Default message */}
            <View style={styles.contentContainer}>
              <Text style={styles.instructionText}>
                Select a tab above to view queries
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 50,
  },
  instructionText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    textAlign: "center",
  },
})
