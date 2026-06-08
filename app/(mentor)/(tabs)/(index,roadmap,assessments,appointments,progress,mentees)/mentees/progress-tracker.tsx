import ActionBottomSheet from "@/components/director/ActionSheetModal";
import FilterModal, { FilterOption } from "@/components/director/FilterModal";
import MenteeCard from "@/components/director/MenteeCard";
import TopBar from "@/components/director/TopBar";
import {
  CommonCard,
  GradientBackground,
  PrimaryButton,
  RoadmapSearchField,
  RoadmapTabStrip,
  SectionHeader,
  roadmapTheme,
} from "@/components/ui/design-system";
import { Colors } from "@/constants/Colors";
import { useMentees } from "@/hooks/mentees/useMentees";
import { usersService } from "@/services/users.service";
import { useAuthStore } from "@/stores";
import { Mentee } from "@/types/mentee.types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const MENTEE_PROGRESS_ROUTE =
  "/(mentor)/mentees/mentee-progress";

const toEpochMs = (dateValue?: string) => {
  if (!dateValue) return 0;
  const parsed = Date.parse(dateValue);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getStableMenteeSortValue = (mentee: Mentee) =>
  toEpochMs(mentee.completedOn ?? mentee.updatedAt ?? mentee.createdAt);

const compareMentees = (a: Mentee, b: Mentee) => {
  const dateDiff = getStableMenteeSortValue(b) - getStableMenteeSortValue(a);
  if (dateDiff !== 0) return dateDiff;

  const nameA = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim().toLowerCase();
  const nameB = `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim().toLowerCase();
  const nameDiff = nameA.localeCompare(nameB);
  if (nameDiff !== 0) return nameDiff;

  return (a.id ?? "").localeCompare(b.id ?? "");
};

export default function ProgressTracker() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all");
  const [viewMode, setViewMode] = useState<"list" | "card">("card");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Course Completion : Latest");
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { data, isLoading, isError } = useMentees(100, user?.id);
  const markCompleteMutation = useMutation({
    mutationFn: (userId: string) => usersService.markUserCompleted(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mentees"] }),
        queryClient.invalidateQueries({ queryKey: ["progress"] }),
      ]);
    },
  });
  const issueCertificateMutation = useMutation({
    mutationFn: ({ userId, issuedBy }: { userId: string; issuedBy: string }) =>
      usersService.issueCertificate(userId, { issuedBy }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mentees"] }),
        queryClient.invalidateQueries({ queryKey: ["progress"] }),
      ]);
    },
  });

  const allMentees = useMemo(() => {
    return data?.pages.flatMap((p) => p.mentees) ?? [];
  }, [data]);

  const getFilterOptions = (): FilterOption[] => {
    return [
      { label: "Course Completion", options: ["Latest", "Oldest"], isExpandable: true },
      
      { label: "State", options: [], isExpandable: true },
      { label: "Conference", isExpandable: true },
    ];
  };

  const filterOptions = useMemo(() => getFilterOptions(), []);

  const filteredMentees = useMemo(() => {
    let filtered = allMentees;

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

    filtered = [...filtered].sort(compareMentees);

    return filtered;
  }, [allMentees, search, activeTab]);

  const summaryStats = useMemo(() => {
    const completed = allMentees.filter((m) => m.hasCompleted).length;
    const inProgress = Math.max(0, allMentees.length - completed);

    return [
      { label: "Pastors", value: allMentees.length },
      { label: "In Progress", value: inProgress },
      { label: "Completed", value: completed },
    ];
  }, [allMentees]);

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

  const sanitizePhoneNumber = (phoneNumber?: string) => phoneNumber?.replace(/[^\d]/g, "") ?? "";

  const openLink = useCallback(async (url: string, fallbackMessage: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert("Unavailable", fallbackMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unavailable", fallbackMessage);
    }
  }, []);

  const handleCall = useCallback((mentee: Mentee) => {
    if (!mentee.phoneNumber) {
      Alert.alert("Phone unavailable", "This mentee does not have a phone number.");
      return;
    }
    void openLink(`tel:${mentee.phoneNumber}`, "Unable to open the phone app for this mentee.");
  }, [openLink]);

  const handleChat = useCallback((mentee: Mentee) => {
    if (!mentee.phoneNumber) {
      Alert.alert("Phone unavailable", "This mentee does not have a phone number.");
      return;
    }
    void openLink(`sms:${mentee.phoneNumber}`, "Unable to open messages for this mentee.");
  }, [openLink]);

  const handleMail = useCallback((mentee: Mentee) => {
    if (!mentee.email) {
      Alert.alert("Email unavailable", "This mentee does not have an email address.");
      return;
    }
    void openLink(`mailto:${mentee.email}`, "Unable to open the mail app for this mentee.");
  }, [openLink]);

  const handleWhatsApp = useCallback((mentee: Mentee) => {
    const phone = sanitizePhoneNumber(mentee.phoneNumber);
    if (!phone) {
      Alert.alert("Phone unavailable", "This mentee does not have a WhatsApp number.");
      return;
    }
    void openLink(`https://wa.me/${phone}`, "Unable to open WhatsApp for this mentee.");
  }, [openLink]);

  const handleMarkComplete = useCallback((mentee: Mentee) => {
    if (!mentee.id) return;

    Alert.alert(
      "Mark as Complete",
      `Mark ${mentee.firstName ?? "this mentee"} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            markCompleteMutation.mutate(mentee.id, {
              onSuccess: () => {
                Alert.alert("Updated", "Mentee marked as complete.");
              },
              onError: () => {
                Alert.alert("Error", "Failed to mark mentee as complete. Please try again.");
              },
            });
          },
        },
      ]
    );
  }, [markCompleteMutation]);

  const handleIssueCertificate = useCallback((mentee: Mentee) => {
    if (!mentee.id || !user?.id) return;

    Alert.alert(
      "Issue Certificate",
      `Issue certificate for ${mentee.firstName ?? "this mentee"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            issueCertificateMutation.mutate(
              {
                userId: mentee.id,
                issuedBy: user.id,
              },
              {
                onSuccess: () => {
                  Alert.alert("Updated", "Certificate issued successfully.");
                },
                onError: () => {
                  Alert.alert("Error", "Failed to issue certificate. Please try again.");
                },
              }
            );
          },
        },
      ]
    );
  }, [issueCertificateMutation, user?.id]);

  const menuItems = [
    {
      icon: "book-outline",
      label: "View Progress Report",
      onPress: () => {
        const id = selectedMentee ? mapMenteeToProfileId(selectedMentee) : undefined;
        if (!id) return;
        handleCloseModal();
        setTimeout(() => {
          router.push({ pathname: MENTEE_PROGRESS_ROUTE as any, params: { menteeId: id } });
        }, 300);
      },
    },
    {
      icon: "call-outline",
      label: "Call",
      onPress: () => {
        if (selectedMentee) handleCall(selectedMentee);
        handleCloseModal();
      },
    },
    {
      icon: "chatbubble-outline",
      label: "Chat",
      onPress: () => {
        if (selectedMentee) handleChat(selectedMentee);
        handleCloseModal();
      },
    },
    {
      icon: "mail-outline",
      label: "Mail",
      onPress: () => {
        if (selectedMentee) handleMail(selectedMentee);
        handleCloseModal();
      },
    },
    {
      icon: "logo-whatsapp",
      label: "WhatsApp",
      onPress: () => {
        if (selectedMentee) handleWhatsApp(selectedMentee);
        handleCloseModal();
      },
    },
  ];

  return (
    <GradientBackground decorativeOrbs>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <TopBar notifications={3} showUserName showNotifications showSearch={false} />

        <SectionHeader
          title="Track Progress"
          subtitle="Review pastor roadmap and assessment progress."
          variant="compact"
          showBackButton
          alwaysShowBack
          onBackPress={() => router.back()}
        />

        <CommonCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryTitle}>Progress Overview</Text>
            </View>
          </View>
          <View style={styles.summaryStatsRow}>
            {summaryStats.map((item) => (
              <View key={item.label} style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </CommonCard>

        <View style={styles.controlsWrap}>
          <RoadmapSearchField
            value={search}
            onChangeText={setSearch}
            placeholder="Search pastors"
            dense
            style={styles.compactSearchField}
          />
          <RoadmapTabStrip
            tabs={tabs}
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as any)}
            scrollable
          />
        </View>

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.stateText}>Loading pastors...</Text>
          </View>
        ) : null}

        {isError && !isLoading ? (
          <CommonCard style={styles.stateCard}>
            <Ionicons name="alert-circle-outline" size={34} color={roadmapTheme.accentGold} />
            <Text style={styles.stateTitle}>Unable to load pastors</Text>
            <Text style={styles.stateText}>Please try again later.</Text>
          </CommonCard>
        ) : null}

        {!isLoading && !isError ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Pastors</Text>
              <Text style={styles.resultsCount}>{filteredMentees.length} results</Text>
            </View>

            {filteredMentees.length === 0 ? (
              <CommonCard style={styles.emptyCard}>
                <Ionicons name="search-outline" size={34} color={roadmapTheme.textMuted} />
                <Text style={styles.emptyTitle}>No pastors found</Text>
                <Text style={styles.emptyText}>Try a different search or filter.</Text>
                {!!search && (
                  <PrimaryButton
                    label="Clear Search"
                    onPress={() => setSearch("")}
                    style={styles.emptyButton}
                  />
                )}
              </CommonCard>
            ) : (
              filteredMentees.map((mentee) => (
                <View key={mentee.id} style={styles.menteeCardShell}>
                  <MenteeCard
                    data={mentee}
                    variant="roadmap"
                    layout={viewMode === "card" ? "full" : "list"}
                    onPress={() => {
                      router.push({ pathname: MENTEE_PROGRESS_ROUTE as any, params: { menteeId: mapMenteeToProfileId(mentee) } });
                    }}
                    onCall={() => handleCall(mentee)}
                    onChat={() => handleChat(mentee)}
                    onMail={() => handleMail(mentee)}
                    onWhatsApp={() => handleWhatsApp(mentee)}
                    onMenuPress={() => {
                      handleMenuPress(mentee);
                    }}
                    onMarkComplete={() => {
                      handleMarkComplete(mentee);
                    }}
                    onIssueCertificate={() => {
                      handleIssueCertificate(mentee);
                    }}
                  />
                </View>
              ))
            )}
          </ScrollView>
        ) : null}

        <ActionBottomSheet
          ref={bottomSheetModalRef}
          title={`${selectedMentee?.firstName ?? ""} ${selectedMentee?.lastName ?? ""}`.trim()}
          image={selectedMentee?.profilePicture}
          actions={menuItems}
          onClose={handleCloseModal}
        />
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(111, 212, 190, 0.20)",
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.38)",
  },
  summaryTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  summarySubtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 2,
  },
  summaryStatsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  summaryStat: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  summaryValue: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  summaryLabel: {
    color: roadmapTheme.textMuted,
    fontSize: 9.5,
    fontWeight: "700",
    marginTop: 2,
    textAlign: "center",
  },
  controlsWrap: {
    marginHorizontal: 16,
    marginBottom: 6,
    gap: 6,
  },
  compactSearchField: {
    paddingVertical: 5,
    minHeight: 38,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  resultsTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  resultsCount: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  menteeCardShell: {
    marginBottom: 10,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateCard: {
    marginHorizontal: 16,
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 28,
  },
  stateTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },
  stateText: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyText: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 16,
    width: 160,
    minHeight: 42,
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
