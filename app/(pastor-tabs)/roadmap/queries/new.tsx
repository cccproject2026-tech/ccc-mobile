import { Tab } from "@/components/atom/tab"
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function NewQueriesScreen() {
  const { data: dataParam } = useLocalSearchParams()
  const data = dataParam ? JSON.parse(dataParam as string) : null

  const [activeTab, setActiveTab] = React.useState("New")
  const [queryText, setQueryText] = React.useState("")

  const availableTabs = [
    { tab: "New" },
    { tab: "Answered" },
    { tab: "Pending" },
  ]

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName)
    const routeMap = {
      New: "/(pastor-tabs)/roadmap/queries/new",
      Answered: "/(pastor-tabs)/roadmap/queries/answered",
      Pending: "/(pastor-tabs)/roadmap/queries/pending",
    }

    router.push({
      pathname: routeMap[tabName as keyof typeof routeMap] as any,
      params: { data: JSON.stringify(data) },
    })
  }

  const handleSubmit = () => {
    if (queryText.trim()) {
      // Handle query submission
      console.log("Submitting query:", queryText)
      setQueryText("")
      // You could show a success message or navigate
    }
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
                      Revitalization Roadmap - {data?.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View className="h-[0.5px] bg-white/30 my-6" />

            {/* Tabs Section */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                width: "100%",
                justifyContent: "center",
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

            {/* New Query Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Submit your question here.</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder=""
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline={true}
                  value={queryText}
                  onChangeText={setQueryText}
                  textAlignVertical="top"
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.wordCount}>(250 Words)</Text>
                </View>
              </View>
              <View className="flex-row justify-end mt-2">
                <TouchableOpacity style={styles.attachmentButton}>
                  <View style={styles.attachmentIcon}>
                    <Ionicons name="add-outline" size={24} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
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
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 30,
    flex: 1,
  },
  formTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 10,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    position: "relative",
    backgroundColor: "#1A4B81",
  },
  textInput: {
    color: "white",
    fontSize: 16,
    textAlignVertical: "top",
    flex: 1,
    minHeight: 100,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  wordCount: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  attachmentButton: {
    padding: 4,
  },
  attachmentIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  plusSign: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "white",
    paddingHorizontal: 80,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 280,
  },
  submitButtonText: {
    color: "#1A4882",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
})
