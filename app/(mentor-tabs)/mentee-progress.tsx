import { ProgressCard } from "@/components/atom/cards";
import CustomBarChart from "@/components/atom/CustomBarChart";
import CustomPieChart from "@/components/atom/CustomPieChart";
import { Tab } from "@/components/atom/tab";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { menteeProfiles } from "@/constants/mockMentees";
import { dummyRoadMaps, dummyAssessment, dummyRoadMapsCompleted, dummyAssessmentCompleted } from "@/constants/mockData";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenteeProgressScreen() {
  const params = useLocalSearchParams();
  const menteeId = params.menteeId as string;
  const mentee = menteeProfiles[menteeId];

  const [roadmapTabs, setRoadmapTabs] = useState("All");
  const [assessmentTabs, setAssessmentTabs] = useState("All");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [finalComments, setFinalComments] = useState(mentee?.progress.finalComments || "");

  if (!mentee) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "white", fontSize: 18 }}>Mentee not found</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const availableTabs = [
    { tab: "All" },
    { tab: "Completed" },
    { tab: "Remaining" },
  ];

  // Use completed data if mentee is 100% complete, otherwise use regular data
  const roadmapsData = mentee.progress.percent === 100 ? dummyRoadMapsCompleted : dummyRoadMaps;
  const assessmentsData = mentee.progress.percent === 100 ? dummyAssessmentCompleted : dummyAssessment;

  const filteredRoadMaps = roadmapsData.filter((item) => {
    if (roadmapTabs === "All") {
      return true;
    } else if (roadmapTabs === "Completed") {
      return item.status === "Completed";
    } else {
      return item.status !== "Completed";
    }
  });

  const filteredAssessments = assessmentsData.filter((item) => {
    if (assessmentTabs === "All") {
      return true;
    } else if (assessmentTabs === "Completed") {
      return item.status === "Completed";
    } else {
      return item.status !== "Completed";
    }
  });

  const handleAddComments = () => {
    setShowCommentsModal(true);
  };

  const handleSubmitComments = () => {
    console.log("Submitting final comments:", finalComments);
    setShowCommentsModal(false);
  };

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
            <PastorNavigationHeader showNameTag={true} />
            
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Image source={icons.forward} style={styles.backIcon} />
                  <View>
                    <Text style={styles.headerTitle}>Pr. {mentee.name}</Text>
                    <Text style={styles.headerSubtitle}>Progress</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.addCommentsButton}
                  onPress={handleAddComments}
                >
                  <Text style={styles.addCommentsButtonText}>Add Final Comments</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Separator */}
            <View className="h-[0.5px] bg-white/30 mt-1 mb-4" />

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingBottom: 10,
                marginHorizontal: 15,
                marginVertical: 10
              }}
            >
              <Text style={{ color: "white", fontSize: 17, fontWeight: "500" }}>
                Overall Progress - Roadmaps & Assessments
              </Text>
            </View>
            <View
              style={{
                width: "95%",
                borderWidth: 1,
                borderColor: "white",
                paddingVertical: 20,
                paddingHorizontal: 10,
                borderRadius: 10,
                flexDirection: "row",
                gap: 20,
                justifyContent: "space-evenly",
                marginHorizontal: "auto",
              }}
            >
              <View style={{ width: 150 }}>
                <CustomPieChart />
              </View>
              <View
                style={{
                  flexDirection: "column",
                  gap: 20,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    Completed
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#d9d9d9",
                      borderRadius: 5,
                    }}
                  ></View>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    Remaining
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingVertical: 10,
                marginHorizontal: 15,
                marginTop: 24,
              }}
            >
              <Text style={{ color: "white", fontSize: 17, fontWeight: "500" }}>
                Individual - Roadmaps ,Assessments
              </Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 10,
                marginHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  justifyContent: "flex-end",
                  paddingVertical: 10,
                  paddingRight: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <LinearGradient
                    colors={["#183476", "#FFFFFF"]}
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></LinearGradient>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "500",
                    }}
                  >
                    Total
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <LinearGradient
                    colors={["#1535A8", "#FFFFFF"]}
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></LinearGradient>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "500",
                    }}
                  >
                    Completed
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <LinearGradient
                    colors={["#118FBA", "#FFFFFF"]}
                    style={{
                      width: 30,
                      height: 20,
                      backgroundColor: "#182c5b",
                      borderRadius: 5,
                    }}
                  ></LinearGradient>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "500",
                    }}
                  >
                    Remaining
                  </Text>
                </View>
              </View>
              <CustomBarChart />
            </View>

            <View
              className="flex flex-col gap-5 mt-5"
              style={{ marginTop: 20 }}
            >
              <Text
                className="text-white px-4"
                style={{ fontWeight: 600, fontSize: 16 }}
              >
                Revitalization Roadmap Progress
              </Text>
              {/* Tabs Section */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  gap: 8,
                  marginTop: 15,
                  paddingBottom: 5,
                }}
                style={{ maxHeight: 50 }}
              >
                {availableTabs.map((e, i) => (
                  <Tab
                    key={i}
                    data={e}
                    tabs={roadmapTabs}
                    setTabs={setRoadmapTabs}
                    onPress={() => {
                      setRoadmapTabs(e.tab);
                    }}
                    className=" flex-1 w-full"
                  />
                ))}
              </ScrollView>

              <View
                style={{
                  marginVertical: 10,
                  paddingHorizontal: 16,
                  width: "100%",
                }}
              >
                {filteredRoadMaps.map((e, i) => (
                  <React.Fragment key={i}>
                    <ProgressCard data={e} navigation={router} />
                    {i < filteredRoadMaps.length - 1 && (
                      <View className="h-[0.5px] bg-white/30 my-4" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>

            {/* Assessment Progress */}
            <View
              className="flex flex-col gap-5 mt-5"
              style={{ marginTop: 20 }}
            >
              <Text
                className="text-white px-4"
                style={{ fontWeight: 600, fontSize: 16 }}
              >
                Assessment Progress
              </Text>
              {/* Tabs Section */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  gap: 8,
                  marginTop: 15,
                  paddingBottom: 5,
                }}
                style={{ maxHeight: 50 }}
              >
                {availableTabs.map((e, i) => (
                  <Tab
                    key={i}
                    data={e}
                    tabs={assessmentTabs}
                    setTabs={setAssessmentTabs}
                    onPress={() => {
                      setAssessmentTabs(e.tab);
                    }}
                    className=" flex-1 w-full"
                  />
                ))}
              </ScrollView>
              <View
                style={{
                  marginVertical: 10,
                  paddingHorizontal: 16,
                  width: "100%",
                }}
              >
                {filteredAssessments.map((e, i) => (
                  <React.Fragment key={i}>
                    <ProgressCard data={e} navigation={router} />
                    {i < filteredAssessments.length - 1 && (
                      <View className="h-[0.5px] bg-white/30 my-4" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Final Comments Modal */}
      <Modal
        visible={showCommentsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header with gradient border */}
            <View style={styles.modalHeaderBorder}>
              <LinearGradient
                colors={["#8B5CF6", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalHeaderGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Pr. {mentee.name} - Final Comments
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCommentsModal(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              {mentee.progress.isMarkedComplete ? (
                // Read-only view
                <View style={styles.commentsDisplay}>
                  <Text style={styles.commentsText}>
                    {mentee.progress.finalComments}
                  </Text>
                </View>
              ) : (
                // Editable view
                <TextInput
                  style={styles.commentsInput}
                  placeholder="Write the Comments here..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  numberOfLines={6}
                  value={finalComments}
                  onChangeText={setFinalComments}
                  textAlignVertical="top"
                />
              )}

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCommentsModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                {!mentee.progress.isMarkedComplete && (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitComments}
                  >
                    <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
  },
  headerContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backIcon: {
    width: 18,
    height: 18,
    transform: [{ scaleX: -1 }],
  },
  headerTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
  },
  addCommentsButton: {
    backgroundColor: "#14517D",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  addCommentsButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#1A3A6B",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeaderBorder: {
    padding: 3,
  },
  modalHeaderGradient: {
    borderRadius: 14,
  },
  modalHeader: {
    backgroundColor: "#1A3A6B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    gap: 20,
  },
  commentsInput: {
    backgroundColor: "#14517D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    fontSize: 15,
    padding: 16,
    minHeight: 150,
  },
  commentsDisplay: {
    backgroundColor: "#14517D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    minHeight: 150,
  },
  commentsText: {
    color: "white",
    fontSize: 15,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1A4882",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#1A4882",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

