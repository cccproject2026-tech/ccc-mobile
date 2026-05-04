import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import ActionBottomSheet from "@/components/sheets/ActionBottomSheet";
import MenteeCard from "@/components/director/MenteeCard";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import {
  GradientBackground,
  RoadmapNavRow,
  RoadmapSearchField,
  RoadmapTabStrip,
  SectionHeader,
  roadmapTheme,
} from "@/components/ui/design-system/index";
import { useAuthStore } from "@/stores/auth.store";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useProgressByUserId } from "@/hooks/progress/useProgress";
import { mergeRoadmapWithProgress, useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { getCardStatus, getPhaseNumber } from "@/lib/roadmap/helpers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { Roadmap, RoadmapCardStatus } from "@/lib/roadmap/types";
import { Mentee } from "@/types/mentee.types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MainTabKey = "PASTOR_ROADMAPS" | "ROADMAP_LIBRARY";
type StatusTabKey = "ALL" | "DUE" | "IN_PROGRESS" | "NOT_STARTED" | "COMPLETED";

const MAIN_TABS = [
  { key: "PASTOR_ROADMAPS" as const, label: "Pastor's Roadmaps" },
  { key: "ROADMAP_LIBRARY" as const, label: "Roadmap Library" },
];

const STATUS_TABS: { key: StatusTabKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DUE", label: "Due" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "COMPLETED", label: "Completed" },
];

export default function Landing() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedRoadmapForMenu, setSelectedRoadmapForMenu] = useState<Roadmap | null>(null);
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] = useState(false);
  const [mainTab, setMainTab] = useState<MainTabKey>("PASTOR_ROADMAPS");
  const [statusTab, setStatusTab] = useState<StatusTabKey>("ALL");
  const [pastorSearch, setPastorSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedPastorRoadmapSearch, setSelectedPastorRoadmapSearch] = useState("");
  const [selectedPastor, setSelectedPastor] = useState<Mentee | null>(null);

  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();

  const horizontalPadding = useMemo(() => {
    const v = Math.round(width * 0.05);
    return Math.max(16, Math.min(24, v));
  }, [width]);

  const listBottomPad = tabBarHeight + Math.max(insets.bottom, 12) + 20;

  const { data: roadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();

  const {
    data: menteesData,
    isLoading: isLoadingMentees,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMentees(10, user?.id);
  const mentees = useMemo(() => menteesData?.pages.flatMap((page) => page.mentees) || [], [menteesData]);

  const { data: pastorProgress, isLoading: isLoadingProgress } = useProgressByUserId(selectedPastor?.id);

  const handleRoadmapMenuPress = useCallback((roadmap: Roadmap) => {
    setSelectedRoadmapForMenu(roadmap);
    setTimeout(() => {
      bottomSheetModalRef.current?.present();
    }, 0);
  }, []);

  const roadmapMenuItems = useMemo(
    () => [
      {
        icon: "person-add-outline",
        label: "Assign to",
        onPress: () => {
          if (!selectedRoadmapForMenu) return;
          router.push({
            pathname: "/(mentor)/roadmap/assign-roadmaps" as any,
            params: { roadmapIds: JSON.stringify([selectedRoadmapForMenu._id]) },
          });
        },
      },
      {
        icon: "copy-outline",
        label: "Select Multiple",
        onPress: () => {
          router.push("/(mentor)/roadmap/select-roadmap" as any);
        },
      },
    ],
    [selectedRoadmapForMenu],
  );

  const handleRoadmapPress = useCallback(
    (roadmap: Roadmap) => {
      if (!roadmap || !roadmap._id) {
        console.error("❌ Roadmap or Roadmap ID is missing");
        return;
      }

      if (roadmap.roadmaps.length === 1 && !roadmap.haveNextedRoadMaps) {
        router.push({
          pathname: `/(mentor)/roadmap/${roadmap._id}/${roadmap.roadmaps[0]._id}` as any,
          params: {
            menteeId: selectedPastor?.id,
            menteeName: selectedPastor?.firstName + " " + selectedPastor?.lastName,
          },
        });
      } else {
        router.push({
          pathname: `/(mentor)/roadmap/${roadmap._id}` as any,
          params: {
            menteeId: selectedPastor?.id,
            menteeName: selectedPastor?.firstName + " " + selectedPastor?.lastName,
          },
        });
      }
    },
    [selectedPastor],
  );

  const displayData = useMemo(() => {
    if (mainTab === "ROADMAP_LIBRARY") {
      if (!roadmaps) return [];
      let filtered = roadmaps.map((roadmap) => ({
        type: "ROADMAP" as const,
        data: roadmap,
        status: getCardStatus(roadmap),
      }));

      if (librarySearch.trim()) {
        const searchLower = librarySearch.toLowerCase();
        filtered = filtered.filter(
          ({ data: roadmap }) =>
            roadmap.name?.toLowerCase().includes(searchLower) ||
            roadmap.roadMapDetails?.toLowerCase().includes(searchLower) ||
            roadmap.phase?.toLowerCase().includes(searchLower),
        );
      }
      return filtered;
    }

    if (selectedPastor === null) {
      let filtered = mentees.map((mentee) => ({
        type: "MENTEE" as const,
        data: (() => {
          const assignedIds = mentee.assignedRoadmapIds ?? [];
          const firstAssignedRoadmap = assignedIds.length
            ? assignedIds.map((id) => roadmaps?.find((r) => r._id === id)).find((r) => Boolean(r?.phase))
            : undefined;

          const derivedPhase = firstAssignedRoadmap?.phase;
          const derivedPhaseNumber = derivedPhase ? getPhaseNumber(derivedPhase) : undefined;

          return {
            ...mentee,
            phase: mentee.phase ?? derivedPhase,
            phaseNumber: mentee.phaseNumber ?? derivedPhaseNumber,
          };
        })(),
      }));

      if (pastorSearch.trim()) {
        const searchLower = pastorSearch.toLowerCase();
        filtered = filtered.filter(
          ({ data: mentee }) =>
            mentee.firstName?.toLowerCase().includes(searchLower) ||
            mentee.lastName?.toLowerCase().includes(searchLower) ||
            mentee.email?.toLowerCase().includes(searchLower),
        );
      }
      return filtered;
    }

    if (!roadmaps || !pastorProgress) return [];

    const assignedRoadmapIds = pastorProgress.roadmaps.items.map((item) => item.roadMapId) || [];
    const assignedRoadmaps = roadmaps.filter((roadmap) => assignedRoadmapIds.includes(roadmap._id));

    let merged = assignedRoadmaps.map((roadmap) => {
      const progressItem = pastorProgress.roadmaps.items.find((p) => p.roadMapId === roadmap._id);
      const mergedRoadmap = mergeRoadmapWithProgress(roadmap, progressItem);
      return {
        type: "ROADMAP" as const,
        data: mergedRoadmap,
        status: getCardStatus(mergedRoadmap),
      };
    });

    if (statusTab !== "ALL") {
      const statusMap: Record<StatusTabKey, RoadmapCardStatus> = {
        ALL: "initial",
        COMPLETED: "completed",
        IN_PROGRESS: "in-progress",
        NOT_STARTED: "initial",
        DUE: "due",
      };
      merged = merged.filter(({ status }) => status === statusMap[statusTab]);
    }

    if (selectedPastorRoadmapSearch.trim()) {
      const searchLower = selectedPastorRoadmapSearch.toLowerCase();
      merged = merged.filter(
        ({ data: roadmap }) =>
          roadmap.name?.toLowerCase().includes(searchLower) ||
          roadmap.roadMapDetails?.toLowerCase().includes(searchLower) ||
          roadmap.phase?.toLowerCase().includes(searchLower),
      );
    }

    return merged;
  }, [
    roadmaps,
    mainTab,
    selectedPastor,
    mentees,
    pastorProgress,
    pastorSearch,
    librarySearch,
    selectedPastorRoadmapSearch,
    statusTab,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item.type === "MENTEE") {
        return (
          <MenteeCard
            data={item.data}
            onPress={() => setSelectedPastor(item.data)}
          />
        );
      }
      const cardData = getRoadmapCard(item.data);
      const isLibrary = mainTab === "ROADMAP_LIBRARY";
      return (
        <Pressable onPress={() => handleRoadmapPress(item.data)} style={styles.cardPress}>
          <RoadmapCard
            data={cardData}
            showMenu={isLibrary}
            onMenuPress={isLibrary ? () => handleRoadmapMenuPress(item.data) : undefined}
          />
        </Pressable>
      );
    },
    [handleRoadmapPress, mainTab, handleRoadmapMenuPress],
  );

  const listEmptyComponent = useCallback(() => {
    if (isLoadingRoadmaps || isLoadingMentees || (selectedPastor && isLoadingProgress)) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    const currentSearch = selectedPastor
      ? selectedPastorRoadmapSearch
      : mainTab === "PASTOR_ROADMAPS"
        ? pastorSearch
        : librarySearch;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={40} color="rgba(255,255,255,0.45)" />
        <Text style={styles.emptyText}>
          {currentSearch.trim()
            ? `No results found matching "${currentSearch}"`
            : "No items available"}
        </Text>
      </View>
    );
  }, [
    isLoadingRoadmaps,
    isLoadingMentees,
    isLoadingProgress,
    pastorSearch,
    librarySearch,
    selectedPastorRoadmapSearch,
    mainTab,
    selectedPastor,
  ]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }, [isFetchingNextPage]);

  const loadMoreMentees = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && mainTab === "PASTOR_ROADMAPS" && !selectedPastor) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, mainTab, selectedPastor, fetchNextPage]);

  const searchValue = selectedPastor
    ? selectedPastorRoadmapSearch
    : mainTab === "PASTOR_ROADMAPS"
      ? pastorSearch
      : librarySearch;

  const setSearchValue = selectedPastor
    ? setSelectedPastorRoadmapSearch
    : mainTab === "PASTOR_ROADMAPS"
      ? setPastorSearch
      : setLibrarySearch;

  const searchPlaceholder = selectedPastor
    ? "Search roadmaps..."
    : mainTab === "PASTOR_ROADMAPS"
      ? "Search pastors..."
      : "Search library...";

  const sectionTitle = selectedPastor
    ? `${selectedPastor.firstName}'s roadmaps`
    : mainTab === "ROADMAP_LIBRARY"
      ? "Roadmap library"
      : "Pastor roadmaps";

  const sectionSubtitle = selectedPastor
    ? "Track phases, tasks, and next steps."
    : mainTab === "ROADMAP_LIBRARY"
      ? "Browse templates and assign to pastors."
      : "Select a mentee to view their revitalization roadmaps.";

  return (
    <GradientBackground decorativeOrbs style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <TopBar role="mentor" showUserName />

      <FlatList
        data={displayData}
        keyExtractor={(item) => (item.type === "MENTEE" ? item.data.id : item.data._id)}
        renderItem={renderItem}
        ListEmptyComponent={listEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreMentees}
        onEndReachedThreshold={0.5}
        contentContainerStyle={[
          styles.scrollContent,
          displayData.length === 0 && styles.scrollContentFlex,
          { paddingBottom: listBottomPad, paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <RoadmapNavRow
              onBack={() => {
                if (selectedPastor) {
                  setSelectedPastor(null);
                } else {
                  router.back();
                }
              }}
              pillLabel="Revitalization Roadmap"
              rightSlot={
                <Pressable onPress={() => setIsRoadmapModalVisible(true)} hitSlop={10} style={styles.iconGhost}>
                  <Ionicons name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.92)" />
                </Pressable>
              }
            />

            <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} showDivider />

            {selectedPastor ? (
              <View style={styles.breadcrumb}>
                <Text style={styles.breadcrumbText} numberOfLines={1}>
                  My mentee · {selectedPastor.firstName} {selectedPastor.lastName}
                </Text>
              </View>
            ) : null}

            <RoadmapSearchField
              value={searchValue}
              onChangeText={setSearchValue}
              placeholder={searchPlaceholder}
            />

            <RoadmapTabStrip
              tabs={MAIN_TABS}
              activeKey={mainTab}
              onChange={(k) => {
                setMainTab(k as MainTabKey);
                setSelectedPastor(null);
              }}
            />

            {mainTab === "PASTOR_ROADMAPS" && selectedPastor ? (
              <RoadmapTabStrip
                tabs={STATUS_TABS}
                activeKey={statusTab}
                onChange={(k) => setStatusTab(k as StatusTabKey)}
                scrollable
              />
            ) : null}
          </View>
        }
      />

      <RoadMapOutcomeModal
        isMenuVisible={isRoadmapModalVisible}
        closeMenu={() => setIsRoadmapModalVisible(false)}
      />

      <ActionBottomSheet
        ref={bottomSheetModalRef}
        title={selectedRoadmapForMenu?.name || ""}
        subtitle={selectedRoadmapForMenu?.roadMapDetails || ""}
        image={selectedRoadmapForMenu?.imageUrl}
        actions={roadmapMenuItems}
        onClose={() => bottomSheetModalRef.current?.dismiss()}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flatList: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  scrollContentFlex: {
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: 8,
  },
  breadcrumb: {
    marginTop: -6,
    marginBottom: 10,
  },
  breadcrumbText: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  iconGhost: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cardPress: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
