import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import ActionBottomSheet from "@/components/sheets/ActionBottomSheet";
import MenteeCard from "@/components/director/MenteeCard";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import { PastorCompletedTasksSection } from "@/components/roadmaps/PastorCompletedTasksSection";
import {
  CommonCard,
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
import { useTaskCompletionTimestamps } from "@/hooks/roadmap/useTaskCompletionTimestamps";
import { mergeRoadmapWithProgress, useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import {
  buildPastorCompletedJourneyTabs,
  flattenPastorCompletedTasks,
  getCardStatus,
  getPhaseNumber,
  type PastorCompletedTaskItem,
} from "@/lib/roadmap/helpers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { useResubmittedTasks, type ResubmittedEntry } from "@/hooks/roadmap/useResubmittedTasks";
import { formatRelativeTimestamp } from "@/utils/date";
import { roadmapLibraryRouteParams } from "@/lib/roadmap/libraryMode";
import { Roadmap, RoadmapCardStatus } from "@/lib/roadmap/types";
import { Mentee } from "@/types/mentee.types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MainTabKey = "PASTOR_ROADMAPS" | "ROADMAP_LIBRARY";
type StatusTabKey = "ALL" | "IN_PROGRESS" | "NOT_STARTED" | "COMPLETED";
type MentorPastorRoadmapView = "phases" | "completed-tasks" | "resubmitted";

const MAIN_TABS = [
  { key: "PASTOR_ROADMAPS" as const, label: "Pastor's Roadmaps" },
  { key: "ROADMAP_LIBRARY" as const, label: "Roadmap Library" },
];

const STATUS_TABS: { key: StatusTabKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "COMPLETED", label: "Completed" },
];

export default function Landing() {
  const { menteeId } = useLocalSearchParams<{ menteeId?: string; menteeName?: string }>();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedRoadmapForMenu, setSelectedRoadmapForMenu] = useState<Roadmap | null>(null);
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] = useState(false);
  const [mainTab, setMainTab] = useState<MainTabKey>("PASTOR_ROADMAPS");
  const [statusTab, setStatusTab] = useState<StatusTabKey>("ALL");
  const [pastorSearch, setPastorSearch] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedPastorRoadmapSearch, setSelectedPastorRoadmapSearch] = useState("");
  const [mentorCompletedSearch, setMentorCompletedSearch] = useState("");
  const [resubmittedSearch, setResubmittedSearch] = useState("");
  const [mentorPastorRoadmapView, setMentorPastorRoadmapView] =
    useState<MentorPastorRoadmapView>("phases");
  const [mentorCompletedJourneyTab, setMentorCompletedJourneyTab] = useState("all");
  const [resubmittedJourneyTab, setResubmittedJourneyTab] = useState("all");
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

  useEffect(() => {
    if (!menteeId || selectedPastor?.id === menteeId) return;
    const routePastor = mentees.find((mentee) => mentee.id === menteeId);
    if (routePastor) {
      setSelectedPastor(routePastor);
      setMentorPastorRoadmapView("phases");
      setMentorCompletedJourneyTab("all");
      setResubmittedJourneyTab("all");
      setMentorCompletedSearch("");
      setMainTab("PASTOR_ROADMAPS");
    }
  }, [menteeId, mentees, selectedPastor?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!menteeId) {
        setSelectedPastor(null);
        setMentorPastorRoadmapView("phases");
        setMentorCompletedJourneyTab("all");
        setResubmittedJourneyTab("all");
        setMentorCompletedSearch("");
        setResubmittedSearch("");
        setSelectedPastorRoadmapSearch("");
        setStatusTab("ALL");
        setMainTab("PASTOR_ROADMAPS");
      }
    }, [menteeId]),
  );

  const { data: pastorProgress, isLoading: isLoadingProgress } = useProgressByUserId(selectedPastor?.id);

  const pastorMergedRoadmaps = useMemo((): Roadmap[] => {
    if (!selectedPastor || !pastorProgress || !roadmaps) return [];
    const assignedRoadmapIds = pastorProgress.roadmaps.items.map((item) => item.roadMapId) || [];
    const assignedRoadmaps = roadmaps.filter((roadmap) => assignedRoadmapIds.includes(roadmap._id));
    return assignedRoadmaps.map((roadmap) => {
      const progressItem = pastorProgress.roadmaps.items.find((p) => p.roadMapId === roadmap._id);
      return mergeRoadmapWithProgress(roadmap, progressItem);
    });
  }, [selectedPastor, pastorProgress, roadmaps]);

  const { resubmittedTasks, isLoadingResubmitted, reloadResubmitted } =
    useResubmittedTasks(pastorMergedRoadmaps, selectedPastor?.id);

  const { timestamps: mentorCompletionTimestamps, reloadTimestamps } =
    useTaskCompletionTimestamps(selectedPastor?.id, pastorMergedRoadmaps);

  useFocusEffect(
    useCallback(() => {
      reloadTimestamps();
      reloadResubmitted();
    }, [reloadTimestamps, reloadResubmitted]),
  );

  const mentorCompletedTasks = useMemo(
    () => flattenPastorCompletedTasks(pastorMergedRoadmaps, mentorCompletionTimestamps),
    [pastorMergedRoadmaps, mentorCompletionTimestamps],
  );

  const mentorCompletedJourneyTabs = useMemo(
    () => buildPastorCompletedJourneyTabs(mentorCompletedTasks, pastorMergedRoadmaps),
    [mentorCompletedTasks, pastorMergedRoadmaps],
  );

  const mentorCompletedJourneyTabStrip = useMemo(
    () =>
      mentorCompletedJourneyTabs.map((t) => ({
        key: t.key,
        label: t.label,
        badge: t.count > 0 ? t.count : undefined,
      })),
    [mentorCompletedJourneyTabs],
  );

  useEffect(() => {
    if (mentorPastorRoadmapView !== "completed-tasks") return;
    const valid = new Set(mentorCompletedJourneyTabs.map((t) => t.key));
    if (!valid.has(mentorCompletedJourneyTab)) setMentorCompletedJourneyTab("all");
  }, [mentorPastorRoadmapView, mentorCompletedJourneyTabs, mentorCompletedJourneyTab]);

  const mentorCompletedByJourney = useMemo(() => {
    if (mentorCompletedJourneyTab === "all") return mentorCompletedTasks;
    return mentorCompletedTasks.filter((item) => item.phaseId === mentorCompletedJourneyTab);
  }, [mentorCompletedTasks, mentorCompletedJourneyTab]);

  const mentorFilteredCompletedTasks = useMemo(() => {
    const q = mentorCompletedSearch.trim().toLowerCase();
    if (!q) return mentorCompletedByJourney;
    return mentorCompletedByJourney.filter((item) => {
      const title = item.taskTitle.toLowerCase();
      const phase = item.phaseTitle.toLowerCase();
      return title.includes(q) || phase.includes(q);
    });
  }, [mentorCompletedByJourney, mentorCompletedSearch]);

  // Build journey tabs for resubmitted tasks (All + per roadmap phase)
  const resubmittedJourneyTabs = useMemo(() => {
    const tabs: { key: string; label: string; count: number }[] = [
      { key: "all", label: "All", count: resubmittedTasks.length },
    ];
    if (!resubmittedTasks.length) return tabs;

    const countByPhase = new Map<string, number>();
    for (const entry of resubmittedTasks) {
      countByPhase.set(entry.phaseId, (countByPhase.get(entry.phaseId) ?? 0) + 1);
    }

    const roadmapById = new Map<string, Roadmap>();
    for (const r of pastorMergedRoadmaps ?? []) {
      if (r._id) roadmapById.set(r._id, r);
    }

    for (const [phaseId, count] of countByPhase) {
      const roadmap = roadmapById.get(phaseId);
      const rawName = String(roadmap?.name ?? roadmap?.phase ?? "").trim();
      const label = rawName.replace(/\s+Phase$/i, "").trim() || rawName || "Roadmap";
      tabs.push({ key: phaseId, label, count });
    }

    return tabs;
  }, [resubmittedTasks, pastorMergedRoadmaps]);

  const resubmittedJourneyTabStrip = useMemo(
    () =>
      resubmittedJourneyTabs.map((t) => ({
        key: t.key,
        label: t.label,
        badge: t.count > 0 ? t.count : undefined,
      })),
    [resubmittedJourneyTabs],
  );

  // Reset tab if it becomes invalid
  useEffect(() => {
    if (mentorPastorRoadmapView !== "resubmitted") return;
    const valid = new Set(resubmittedJourneyTabs.map((t) => t.key));
    if (!valid.has(resubmittedJourneyTab)) setResubmittedJourneyTab("all");
  }, [mentorPastorRoadmapView, resubmittedJourneyTabs, resubmittedJourneyTab]);

  // Filter by selected journey tab, then by search, sorted by most recent first
  const filteredResubmittedTasks = useMemo(() => {
    let list = [...resubmittedTasks];

    // Filter by journey tab
    if (resubmittedJourneyTab !== "all") {
      list = list.filter((entry) => entry.phaseId === resubmittedJourneyTab);
    }

    // Sort by most recently resubmitted first
    list.sort((a, b) => {
      const ta = new Date(a.resubmittedAt).getTime();
      const tb = new Date(b.resubmittedAt).getTime();
      if (!Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta;
      return 0;
    });

    // Filter by search
    const q = resubmittedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((entry) => {
        const title = (entry.task.name ?? "").toLowerCase();
        const phase = entry.phaseTitle.toLowerCase();
        return title.includes(q) || phase.includes(q);
      });
    }

    return list;
  }, [resubmittedTasks, resubmittedJourneyTab, resubmittedSearch]);

  const selectPastor = useCallback((mentee: Mentee) => {
    setSelectedPastor(mentee);
    setMentorPastorRoadmapView("phases");
    setMentorCompletedJourneyTab("all");
    setResubmittedJourneyTab("all");
    setMentorCompletedSearch("");
  }, []);

  const clearPastor = useCallback(() => {
    setSelectedPastor(null);
    setMentorPastorRoadmapView("phases");
    setMentorCompletedJourneyTab("all");
    setResubmittedJourneyTab("all");
    setMentorCompletedSearch("");
  }, []);

  const handleOpenMentorCompletedTask = useCallback(
    (item: PastorCompletedTaskItem) => {
      if (!item.phaseId || !item.taskId || !selectedPastor?.id) return;
      const menteeName = [selectedPastor.firstName, selectedPastor.lastName].filter(Boolean).join(" ").trim();
      router.push({
        pathname: `/(mentor)/roadmap/${item.phaseId}/${item.taskId}` as any,
        params: {
          menteeId: selectedPastor.id,
          menteeName: menteeName || undefined,
        },
      });
    },
    [selectedPastor],
  );

  const handleOpenResubmittedTask = useCallback(
    (entry: ResubmittedEntry) => {
      const taskId = entry.task._id;
      if (!entry.phaseId || !taskId || !selectedPastor?.id) return;
      const menteeName = [selectedPastor.firstName, selectedPastor.lastName].filter(Boolean).join(" ").trim();
      router.push({
        pathname: `/(mentor)/roadmap/${entry.phaseId}/${taskId}` as any,
        params: {
          menteeId: selectedPastor.id,
          menteeName: menteeName || undefined,
        },
      });
    },
    [selectedPastor],
  );

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

      const isLibrary = mainTab === "ROADMAP_LIBRARY";
      const routeParams = {
        ...roadmapLibraryRouteParams(isLibrary),
        ...(selectedPastor
          ? {
              menteeId: selectedPastor.id,
              menteeName: `${selectedPastor.firstName ?? ""} ${selectedPastor.lastName ?? ""}`.trim(),
            }
          : {}),
      };

      if (roadmap.roadmaps.length === 1 && !roadmap.haveNextedRoadMaps) {
        router.push({
          pathname: `/(mentor)/roadmap/${roadmap._id}/${roadmap.roadmaps[0]._id}` as any,
          params: routeParams,
        });
      } else {
        router.push({
          pathname: `/(mentor)/roadmap/${roadmap._id}` as any,
          params: routeParams,
        });
      }
    },
    [selectedPastor, mainTab],
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
          const assignedIds: string[] = mentee.assignedRoadmapIds ?? [];
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
      const statusMap: Record<string, RoadmapCardStatus> = {
        COMPLETED: "completed",
        IN_PROGRESS: "in-progress",
        NOT_STARTED: "initial",
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
            variant="roadmap"
            data={item.data}
            onPress={() => selectPastor(item.data)}
          />
        );
      }
      const isLibrary = mainTab === "ROADMAP_LIBRARY";
      const cardData = getRoadmapCard(item.data);
      return (
        <View style={styles.cardPress}>
          <RoadmapCard
            data={cardData}
            hideStatus={isLibrary}
            onPress={() => handleRoadmapPress(item.data)}
            showMenu={isLibrary}
            onMenuPress={isLibrary ? () => handleRoadmapMenuPress(item.data) : undefined}
          />
        </View>
      );
    },
    [handleRoadmapPress, mainTab, handleRoadmapMenuPress, selectPastor],
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

    const currentSearch =
      selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "resubmitted"
        ? resubmittedSearch
        : selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks"
          ? mentorCompletedSearch
          : selectedPastor
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
    resubmittedSearch,
    mentorCompletedSearch,
    mentorPastorRoadmapView,
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

  const searchValue =
    selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "resubmitted"
      ? resubmittedSearch
      : selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks"
        ? mentorCompletedSearch
        : selectedPastor
          ? selectedPastorRoadmapSearch
          : mainTab === "PASTOR_ROADMAPS"
            ? pastorSearch
            : librarySearch;

  const setSearchValue =
    selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "resubmitted"
      ? setResubmittedSearch
      : selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks"
        ? setMentorCompletedSearch
        : selectedPastor
          ? setSelectedPastorRoadmapSearch
          : mainTab === "PASTOR_ROADMAPS"
            ? setPastorSearch
            : setLibrarySearch;

  const searchPlaceholder =
    selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "resubmitted"
      ? "Search resubmitted tasks..."
      : selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks"
        ? "Search history..."
        : selectedPastor
          ? "Search phases..."
          : mainTab === "PASTOR_ROADMAPS"
            ? "Search pastors..."
            : "Search library...";

  const sectionTitle =
    selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "resubmitted"
      ? `${selectedPastor.firstName}'s resubmitted tasks`
      : selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks"
        ? `${selectedPastor.firstName}'s history`
        : selectedPastor
          ? `${selectedPastor.firstName}'s roadmaps`
          : mainTab === "ROADMAP_LIBRARY"
            ? "Roadmap library"
            : "Pastor roadmaps";

  const sectionSubtitle =
    selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "resubmitted"
      ? "Tasks resubmitted by your mentee awaiting your review."
      : selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks"
        ? "Look back at tasks your mentee has already finished."
        : selectedPastor
          ? "Track phases, tasks, and next steps."
          : mainTab === "ROADMAP_LIBRARY"
            ? "Browse templates and assign to pastors."
            : "Select a mentee to view their revitalization roadmaps.";

  const mentorPastorLayerTabs = useMemo(
    () => [
      { key: "phases" as const, label: "Journey" },
      {
        key: "resubmitted" as const,
        label: "Resubmitted",
        badge: resubmittedTasks.length > 0 ? resubmittedTasks.length : undefined,
      },
      {
        key: "completed-tasks" as const,
        label: "History",
        badge: mentorCompletedTasks.length > 0 ? mentorCompletedTasks.length : undefined,
      },
    ],
    [mentorCompletedTasks.length, resubmittedTasks.length],
  );

  const showMentorPastorCompleted =
    !!selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks";

  const showMentorPastorResubmitted =
    !!selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "resubmitted";

  const listHeader = (
    <View style={styles.headerBlock}>
      <RoadmapNavRow
        onBack={() => {
          if (selectedPastor) clearPastor();
          else router.back();
        }}
        pillLabel="Revitalization Roadmap"
      />

      <SectionHeader title={sectionTitle} subtitle={sectionSubtitle} showDivider />

      {selectedPastor ? (
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText} numberOfLines={1}>
            My mentee · {selectedPastor.firstName} {selectedPastor.lastName}
          </Text>
        </View>
      ) : null}

      {mainTab === "PASTOR_ROADMAPS" && selectedPastor ? (
        <RoadmapTabStrip
          tabs={mentorPastorLayerTabs}
          activeKey={mentorPastorRoadmapView}
          onChange={(k) => setMentorPastorRoadmapView(k as MentorPastorRoadmapView)}
          scrollable
        />
      ) : null}

      <View
        style={
          selectedPastor && mainTab === "PASTOR_ROADMAPS" && mentorPastorRoadmapView === "completed-tasks"
            ? styles.completedSearchWrap
            : undefined
        }
      >
        <RoadmapSearchField
          value={searchValue}
          onChangeText={setSearchValue}
          placeholder={searchPlaceholder}
        />
      </View>

      {!selectedPastor && (
        <RoadmapTabStrip
          tabs={MAIN_TABS}
          activeKey={mainTab}
          onChange={(k) => {
            setMainTab(k as MainTabKey);
            clearPastor();
          }}
        />
      )}

      {mainTab === "PASTOR_ROADMAPS" && selectedPastor && mentorPastorRoadmapView === "phases" ? (
        <RoadmapTabStrip
          tabs={STATUS_TABS}
          activeKey={statusTab}
          onChange={(k) => setStatusTab(k as StatusTabKey)}
          scrollable
        />
      ) : null}

      {mainTab === "PASTOR_ROADMAPS" &&
      selectedPastor &&
      mentorPastorRoadmapView === "completed-tasks" &&
      mentorCompletedJourneyTabStrip.length > 1 ? (
        <RoadmapTabStrip
          tabs={mentorCompletedJourneyTabStrip}
          activeKey={mentorCompletedJourneyTab}
          onChange={setMentorCompletedJourneyTab}
          scrollable
        />
      ) : null}

      {mainTab === "PASTOR_ROADMAPS" &&
      selectedPastor &&
      mentorPastorRoadmapView === "resubmitted" &&
      resubmittedJourneyTabStrip.length > 1 ? (
        <RoadmapTabStrip
          tabs={resubmittedJourneyTabStrip}
          activeKey={resubmittedJourneyTab}
          onChange={setResubmittedJourneyTab}
          scrollable
        />
      ) : null}
    </View>
  );

  const resubmittedScrollBody =
    isLoadingRoadmaps || isLoadingProgress || isLoadingResubmitted ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    ) : resubmittedTasks.length > 0 &&
      filteredResubmittedTasks.length === 0 &&
      resubmittedSearch.trim() ? (
      <CommonCard style={styles.emptySearchCard}>
        <Ionicons name="search-outline" size={28} color="rgba(255,255,255,0.7)" />
        <Text style={styles.emptySearchTitle}>No matching resubmitted tasks</Text>
        <Text style={styles.emptySearchSubtitle}>Try a different search term.</Text>
      </CommonCard>
    ) : resubmittedTasks.length > 0 &&
      filteredResubmittedTasks.length === 0 &&
      resubmittedJourneyTab !== "all" ? (
      <CommonCard style={styles.emptySearchCard}>
        <Ionicons name="refresh-outline" size={28} color="rgba(251,146,60,0.7)" />
        <Text style={styles.emptySearchTitle}>No resubmitted tasks in this roadmap</Text>
        <Text style={styles.emptySearchSubtitle}>Try another journey tab or view All.</Text>
      </CommonCard>
    ) : resubmittedTasks.length === 0 ? (
      <CommonCard style={styles.emptySearchCard}>
        <Ionicons name="refresh-outline" size={28} color="rgba(251,146,60,0.7)" />
        <Text style={styles.emptySearchTitle}>No resubmitted tasks</Text>
        <Text style={styles.emptySearchSubtitle}>
          Tasks resubmitted by your mentee will appear here for review.
        </Text>
      </CommonCard>
    ) : (
      <View style={styles.completedSectionWrap}>
        {filteredResubmittedTasks.map((entry) => {
          const relativeTime = formatRelativeTimestamp(entry.resubmittedAt);
          return (
            <Pressable
              key={entry.task._id}
              onPress={() => handleOpenResubmittedTask(entry)}
              style={styles.resubmittedCardPress}
            >
              <CommonCard style={styles.resubmittedCard}>
                <View style={styles.resubmittedBadgeRow}>
                  <View style={styles.resubmittedBadge}>
                    <Ionicons name="refresh-outline" size={13} color="#FB923C" />
                    <Text style={styles.resubmittedBadgeText}>Resubmitted</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.35)" />
                </View>

                <Text style={styles.resubmittedTaskTitle} numberOfLines={2}>
                  {entry.task.name || "Untitled Task"}
                </Text>

                {relativeTime ? (
                  <Text style={styles.resubmittedTimestamp}>{relativeTime}</Text>
                ) : null}

                <View style={styles.resubmittedFooter}>
                  <Ionicons name="person-outline" size={12} color="rgba(255,255,255,0.45)" />
                  <Text style={styles.resubmittedFooterText}>
                    Pastor updated this task after completion
                  </Text>
                </View>

                <View style={styles.resubmittedPhaseTag}>
                  <Ionicons name="layers-outline" size={11} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.resubmittedPhaseText} numberOfLines={1}>
                    {entry.phaseTitle}
                  </Text>
                </View>
              </CommonCard>
            </Pressable>
          );
        })}
      </View>
    );

  const completedScrollBody =
    isLoadingRoadmaps || isLoadingProgress ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    ) : mentorCompletedTasks.length > 0 &&
      mentorFilteredCompletedTasks.length === 0 &&
      mentorCompletedSearch.trim() ? (
      <CommonCard style={styles.emptySearchCard}>
        <Ionicons name="search-outline" size={28} color="rgba(255,255,255,0.7)" />
        <Text style={styles.emptySearchTitle}>No matching completed tasks</Text>
        <Text style={styles.emptySearchSubtitle}>Try a different search term.</Text>
      </CommonCard>
    ) : mentorCompletedByJourney.length === 0 && mentorCompletedJourneyTab !== "all" ? (
      <CommonCard style={styles.emptySearchCard}>
        <Ionicons name="checkbox-outline" size={28} color="rgba(255,255,255,0.7)" />
        <Text style={styles.emptySearchTitle}>No completed tasks in this roadmap</Text>
        <Text style={styles.emptySearchSubtitle}>Try another journey tab or view All.</Text>
      </CommonCard>
    ) : (
      <View style={styles.completedSectionWrap}>
        <PastorCompletedTasksSection
          items={mentorFilteredCompletedTasks}
          onOpenTask={handleOpenMentorCompletedTask}
          showHeader={false}
        />
      </View>
    );

  return (
    <GradientBackground decorativeOrbs style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <TopBar role="mentor" showUserName />

      {showMentorPastorResubmitted ? (
        <ScrollView
          style={styles.flatList}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: listBottomPad, paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {listHeader}
          {resubmittedScrollBody}
        </ScrollView>
      ) : showMentorPastorCompleted ? (
        <ScrollView
          style={styles.flatList}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: listBottomPad, paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {listHeader}
          {completedScrollBody}
        </ScrollView>
      ) : (
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
          ListHeaderComponent={listHeader}
        />
      )}

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
  completedSearchWrap: {
    marginBottom: 14,
  },
  completedSectionWrap: {
    marginTop: 4,
    gap: 12,
  },
  resubmittedCardPress: {
    borderRadius: 14,
    overflow: "hidden",
  },
  resubmittedCard: {
    borderColor: "rgba(251, 146, 60, 0.2)",
    backgroundColor: "rgba(251, 146, 60, 0.06)",
    gap: 10,
  },
  resubmittedBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resubmittedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(251, 146, 60, 0.14)",
  },
  resubmittedBadgeText: {
    color: "#FB923C",
    fontSize: 12,
    fontWeight: "700",
  },
  resubmittedTaskTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  resubmittedTimestamp: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "600",
  },
  resubmittedFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resubmittedFooterText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: "600",
    fontStyle: "italic",
  },
  resubmittedPhaseTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  resubmittedPhaseText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "600",
  },
  emptySearchCard: {
    marginTop: 12,
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  emptySearchTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  emptySearchSubtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 280,
  },
});
