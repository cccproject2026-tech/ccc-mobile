import { TabSwitcher } from "@/components/director/TabSwitcher";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { MenteeProfile, menteeProfiles } from "@/constants/mockMentees";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOption = "progress-highest" | "completion-latest";

export default function ProgressTracker() {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("progress-highest");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<MenteeProfile | null>(null);
  const [finalComments, setFinalComments] = useState("");

  const tabData = [
    { key: "ALL", label: "All" },
    { key: "IN_PROGRESS", label: "In-progress" },
    { key: "COMPLETED", label: "Completed" },
  ];

  const sortOptions = [
    { key: "progress-highest", label: "Progress Percentage : Highest" },
    { key: "completion-latest", label: "Course Completion : Latest" },
  ];

  // Get all mentees as array
  const allMentees = Object.values(menteeProfiles);

  // Filter mentees based on active tab
  const filteredMentees = allMentees.filter((mentee) => {
    // Search filter
    if (searchText && !mentee.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }

    // Tab filter
    if (activeTab === "ALL") {
      return true;
    } else if (activeTab === "IN_PROGRESS") {
      return mentee.progress.status === "in-progress";
    } else {
      return mentee.progress.status === "completed" && mentee.progress.isMarkedComplete;
    }
  });

  // Sort mentees
  const sortedMentees = [...filteredMentees].sort((a, b) => {
    if (sortBy === "progress-highest") {
      return b.progress.percent - a.progress.percent;
    } else {
      // Sort by completion date (most recent first)
      const dateA = new Date(a.progress.updatedOn || "").getTime();
      const dateB = new Date(b.progress.updatedOn || "").getTime();
      return dateB - dateA;
    }
  });

  const handleMarkAsComplete = (mentee: MenteeProfile) => {
    setSelectedMentee(mentee);
    setFinalComments(mentee.progress.finalComments || "");
    setShowCommentsModal(true);
  };

  const handleSubmitComments = () => {
    if (selectedMentee) {
      // In a real app, this would update the backend
      console.log("Marking mentee as complete:", selectedMentee.name, finalComments);
      setShowCommentsModal(false);
      setSelectedMentee(null);
      setFinalComments("");
    }
  };

  const renderMenteeCard = (mentee: MenteeProfile) => {
    const isCompleted = mentee.progress.status === "completed" && mentee.progress.isMarkedComplete;
    const canMarkComplete = mentee.progress.percent === 100 && !mentee.progress.isMarkedComplete;

    const navigateToDetail = () => {
      router.push({
        pathname: "/(mentor-tabs)/mentee-progress",
        params: { menteeId: mentee.id }
      });
    };

    return (
      <TouchableOpacity
        key={mentee.id}
        style={styles.menteeCard}
        activeOpacity={0.8}
        onPress={navigateToDetail}
      >
        <View style={styles.menteeCardContent}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <Image source={mentee.avatar} style={styles.profileImage} />
          </View>

          {/* Content */}
          <View style={styles.menteeInfo}>
            <Text style={styles.menteeName}>{mentee.name}</Text>
            <Text style={styles.menteeDescription} numberOfLines={2}>
              {mentee.description}
            </Text>

            {/* Phase or Completed info */}
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>
                  Completed on :{mentee.progress.completedOn}
                </Text>
              </View>
            ) : (
              <>
                {mentee.progress.currentPhase && (
                  <View style={styles.phaseBadge}>
                    <Text numberOfLines={2} style={styles.phaseBadgeText}>
                      <Text className="font-bold">Phase :</Text> {mentee.progress.currentPhase}
                    </Text>
                  </View>
                )}

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${mentee.progress.percent}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {mentee.progress.percent} %
                  </Text>
                </View>
              </>
            )}

            {/* Communication Icons */}
            <View style={styles.communicationIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="call-outline" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="chatbubble-outline" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="mail-outline" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="logo-whatsapp" size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* Mark as Complete Button */}
            {canMarkComplete && (
              <TouchableOpacity
                style={styles.markCompleteButton}
                onPress={() => handleMarkAsComplete(mentee)}
              >
                <LinearGradient
                  colors={["#7C3AED", "#38BDF8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBorder}
                >
                  <View style={styles.innerContainer}>
                  <Text style={styles.markCompleteText}>Mark as Complete</Text>
                  <Ionicons name="chevron-forward" size={18} color="#1A4882" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Chevron */}
          <TouchableOpacity
            style={styles.chevronButton}
            onPress={() =>
              router.push({
                pathname: "/(mentor-tabs)/mentee-progress",
                params: { menteeId: mentee.id },
              })
            }
          >
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            {/* Header */}
            <PastorNavigationHeader showNameTag />
            <View style={styles.headerContainer}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                >
                  <Image source={icons.forward} style={styles.backIcon} />
                  <View>
                    <Text style={styles.headerTitle}>Progress Tracker</Text>
                    <Text style={styles.headerSubtitle}>Mentees</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuButton}>
                  <Ionicons name="menu" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Separator */}
            <View className="h-[0.5px] bg-white/30 mt-1" />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor="white"
                  value={searchText}
                  onChangeText={setSearchText}
                />
                <Ionicons
                  name="search"
                  size={20}
                  color="rgba(255, 255, 255, 0.6)"
                  style={styles.searchIcon}
                />
              </View>
            </View>

            {/* Tabs */}
            <View style={{ paddingHorizontal: 0 }}>
              <TabSwitcher
                tabs={tabData}
                activeTab={activeTab}
                onChange={(key: string) => setActiveTab(key as any)}
              />
            </View>

            {/* Quick Access Avatars */}
            <View style={styles.quickAccessContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickAccessScroll}
              >
                {allMentees.slice(0, 5).map((mentee, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.85}
                    style={{ alignItems: "center" }}
                    onPress={() => router.push({
                      pathname: "/(mentor-tabs)/mentee-progress",
                      params: { menteeId: mentee.id }
                    })}
                  >
                    <LinearGradient
                      colors={["#8B5CF6", "#3B82F6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.avatarGradient}
                    >
                      <View style={styles.avatarInner}>
                        <Image
                          source={mentee.avatar}
                          style={styles.avatar}
                          resizeMode="cover"
                        />
                      </View>
                    </LinearGradient>
                    <Text style={styles.avatarName}>{mentee.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Separator */}
            <View className="h-[0.5px] bg-white/20 mx-14" />

            {/* Sort Dropdown */}
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by</Text>
              <View style={{ position: "relative" }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowSortDropdown((prev) => !prev)}
                  style={styles.sortButton}
                >
                  <Text style={styles.sortButtonText}>
                    {sortOptions.find((opt) => opt.key === sortBy)?.label}
                  </Text>
                  <Ionicons
                    name={showSortDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>

                {showSortDropdown && (
                  <View style={styles.dropdownMenu}>
                    {sortOptions.map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSortBy(option.key as SortOption);
                          setShowSortDropdown(false);
                        }}
                      >
                        <View style={styles.radioOuter}>
                          {sortBy === option.key && (
                            <View style={styles.radioInner} />
                          )}
                        </View>
                        <Text style={styles.dropdownOptionText}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Mentees List */}
            <View style={styles.menteesList}>
              {sortedMentees.map((mentee) => renderMenteeCard(mentee))}
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
                    Pr. {selectedMentee?.name} - Final Comments
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
              {selectedMentee?.progress.isMarkedComplete ? (
                // Read-only view
                <View style={styles.commentsDisplay}>
                  <Text style={styles.commentsText}>
                    {selectedMentee.progress.finalComments}
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

                {!selectedMentee?.progress.isMarkedComplete && (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitComments}
                  >
                    <Text style={styles.submitButtonText}>
                      Mark Programme as Completed
                    </Text>
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
  menuButton: {
    padding: 8,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  searchBox: {
    backgroundColor: "#14517D",
    borderRadius: 10,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
  quickAccessContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  quickAccessScroll: {
    paddingRight: 20,
    gap: 10,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  avatarName: {
    color: "white",
    fontWeight: "500",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  sortContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  sortLabel: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 6,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  sortButtonText: {
    color: "white",
    fontSize: 14,
  },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#EAF1F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D2E2F0",
    paddingVertical: 8,
    minWidth: 300,
    zIndex: 20,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownOptionText: {
    color: "#1A4882",
    fontSize: 14,
    flexShrink: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#9EC1DF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1A4882",
  },
  menteesList: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 40,
    gap: 16,
  },
  menteeCard: {
    backgroundColor: "#14517D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  menteeCardContent: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  menteeInfo: {
    flex: 1,
    gap: 6,
  },
  menteeName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  menteeDescription: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
  },
  phaseBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
    borderColor: "white",
    borderWidth: 1,
  },
  phaseBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  completedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  completedBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
  },
  progressText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    minWidth: 45,
  },
  communicationIcons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  markCompleteButton: {
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
  },
  markCompleteGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  gradientBorder: {
    borderRadius: 12,
    padding: 4,
  },
  innerContainer: {
    backgroundColor: Colors.lightBlueGradientOne,
    borderRadius: 12,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  markCompleteText: {
    color: "#E9E010",
    fontSize: 14,
    fontWeight: "600",
  },
  chevronButton: {
    justifyContent: "center",
    paddingLeft: 8,
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

