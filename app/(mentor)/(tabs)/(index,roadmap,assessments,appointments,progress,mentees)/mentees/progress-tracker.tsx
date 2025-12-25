import ActionBottomSheet from "@/components/director/ActionSheetModal";
import FilterModal, { FilterOption } from "@/components/director/FilterModal";
import MenteeCard from "@/components/director/MenteeCard";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { useMentees } from "@/hooks/mentees/useMentees";
import { Mentee } from "@/types/mentee.types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProgressTracker() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");
  const [viewMode, setViewMode] = useState<"list" | "card">("card");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Course Completion : Latest");
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { data, isLoading, isError } = useMentees();

  const getFilterOptions = (): FilterOption[] => {
    return [
      { label: "Course Completion", options: ["Latest", "Oldest"], isExpandable: true },
      // TODO: Replace with dynamic state list from backend metadata if available
      { label: "State", options: [], isExpandable: true },
      { label: "Conference", isExpandable: true },
    ];
  };

  const filterOptions = useMemo(() => getFilterOptions(), []);

  const filteredMentees = useMemo(() => {
    const mentees = data?.mentees ?? [];

    let filtered = mentees;

    if (search) {
      filtered = filtered.filter((m) =>
        m.firstName?.toLowerCase().includes(search.toLowerCase()) || m.lastName?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeTab === "completed") {
      filtered = filtered.filter((m) => m.hasCompleted);
    } else if (activeTab === "in-progress") {
      filtered = filtered.filter((m) => !m.hasCompleted);
    }

    // Default sort: latest completion / creation first
    filtered = [...filtered].sort((a, b) => {
      const aDate = a.completedOn ?? a.updatedAt ?? a.createdAt ?? "";
      const bDate = b.completedOn ?? b.updatedAt ?? b.createdAt ?? "";
      return (bDate || "").localeCompare(aDate || "");
    });

    return filtered;
  }, [data?.mentees, search, activeTab]);

  const tabs = [
    { key: "all", label: "All" },
    { key: "in-progress", label: "In-progress" },
    { key: "completed", label: "Completed" },
  ];

  const handleMenuPress = useCallback((mentee: Mentee) => {
    setSelectedMentee(mentee);
    setTimeout(() => bottomSheetModalRef.current?.present(), 0);
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => setSelectedMentee(null), 300);
  }, []);

  const mapMenteeToProfileId = (mentee: Mentee): string => {
    return mentee.id;
  };

  const menuItems = [
    {
      icon: "book-outline",
      label: "View Progress Report",
      onPress: () => {
        const id = selectedMentee ? mapMenteeToProfileId(selectedMentee) : "john-ross";
        handleCloseModal();
        setTimeout(() => {
          router.push({ pathname: "/(mentor)/mentees/mentee-progress" as any, params: { menteeId: id } });
        }, 300);
      },
    },
    { icon: "call-outline", label: "Call", onPress: () => handleCloseModal() },
    { icon: "chatbubble-outline", label: "Chat", onPress: () => handleCloseModal() },
    { icon: "mail-outline", label: "Mail", onPress: () => handleCloseModal() },
    { icon: "logo-whatsapp", label: "WhatsApp", onPress: () => handleCloseModal() },
  ];

  const handleCall = (mentee: Mentee) => {
    Linking.openURL(`tel:${mentee.phoneNumber}`);
  };

  const handleChat = (mentee: Mentee) => {
    Linking.openURL(`sms:${mentee.phoneNumber}`);
  };

  const handleMail = (mentee: Mentee) => {
    Linking.openURL(`mailto:${mentee.email}`);
  };

  const handleWhatsApp = (mentee: Mentee) => {
    Linking.openURL(`https://wa.me/${mentee.phoneNumber}`);
  };

  return (
    <LinearGradient colors={["#176192", "#1D548D", "#264387"]} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1">
        <View className="flex-1">
          <TopBar notifications={3} showUserName showNotifications />

          <View className="flex-1 pt-6">
            {isLoading && (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff", marginTop: 8 }}>Loading mentees...</Text>
              </View>
            )}

            {isError && !isLoading && (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
                <Text style={{ color: "#fff", textAlign: "center" }}>
                  Unable to load mentees. Please try again later.
                </Text>
              </View>
            )}

            {/* Header Row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
                <Text style={{ fontSize: 16, color: "white", marginLeft: 8, fontWeight: "600" }}>Progress Tracker</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => setViewMode(viewMode === "card" ? "list" : "card")} style={{ padding: 4 }}>
                  <Ionicons name={viewMode === "card" ? "list" : "grid"} size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={{ padding: 4 }}>
                  <Ionicons name="filter" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <SearchBar value={search} onChangeValue={setSearch} />
            </View>

            {/* Tabs */}
            <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={(k: string) => setActiveTab(k as any)} />

            {/* List */}
            {!isLoading && !isError && (
              <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
                  <Text style={{ color: '#fff', opacity: 0.7, fontSize: 12 }}>Results: {filteredMentees.length}</Text>
                </View>
                {filteredMentees.length === 0 && (
                  <View style={{ paddingHorizontal: 16, paddingVertical: 24, alignItems: "center" }}>
                    <Text style={{ color: "#fff", opacity: 0.8 }}>No mentees found</Text>
                  </View>
                )}
                {filteredMentees.map((mentee) => (
                  <MenteeCard
                    key={mentee.id}
                    data={mentee}
                    layout={viewMode}
                    onPress={() => {
                      router.push({ pathname: "/(mentor)/mentees/mentee-progress" as any, params: { menteeId: mapMenteeToProfileId(mentee) } });
                    }}
                    onCall={() => handleCall(mentee)}
                    onChat={() => handleChat(mentee)}
                    onMail={() => handleMail(mentee)}
                    onWhatsApp={() => handleWhatsApp(mentee)}
                    onMenuPress={() => {
                      handleMenuPress(mentee);
                    }}
                    onMarkComplete={() => {
                      handleMenuPress(mentee);
                    }}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <ActionBottomSheet ref={bottomSheetModalRef} title={selectedMentee?.firstName + " " + selectedMentee?.lastName || ""} image={selectedMentee?.profilePicture} actions={menuItems} onClose={handleCloseModal} />
          <FilterModal
            visible={filterModalVisible}
            onClose={() => setFilterModalVisible(false)}
            selectedFilter={selectedFilter}
            onFilterSelect={(filter) => {
              setSelectedFilter(filter);
              setFilterModalVisible(false);
            }}
            filterOptions={filterOptions}
          />
        </View>
      </View>
    </LinearGradient>
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

