import AssessmentDeletedSuccessModal from "@/components/build-components/AssessmentDeletedSuccessModal";
import AssessmentMenuBottomSheet from "@/components/build-components/AssessmentMenuBottomSheet";
import AssessmentCard from "@/components/build-components/cards/assessment-card";
import DeleteConfirmationModal from "@/components/build-components/DeleteConfirmationModal";
import TopBar from "@/components/director/TopBar";
import { RoadmapSearchField, RoadmapTabStrip } from "@/components/ui/design-system";
import { icons } from "@/constants/images";
import { useDeleteAssessment } from "@/hooks/assessments";
import { useMenteeAssessments } from "@/hooks/assessments/useMenteeAssessments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { Assessment } from "@/lib/assessments/types";
import { useNavigationBack } from "@/hooks/navigation/useNavigationBack";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { MentorLibraryStripHint } from "@/components/mentor/MentorSurveyContextHint";

export default function MentorAssessmentsLibrary() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { handleBack, appendReturnToParams } = useNavigationBack(
    "/(mentor)/(tabs)/assessments-v2" as const,
  );
  const { menteeId } = useLocalSearchParams<{ menteeId?: string }>();

  const [search, setSearch] = useState("");
  const [selectedMentee, setSelectedMentee] = useState<string | null>(
    menteeId ? String(menteeId) : null,
  );
  const [tabs, setTabs] = useState("All");
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<Assessment | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  
  const { user } = useAuthStore();

  useEffect(() => {
    if (menteeId) {
      setSelectedMentee(String(menteeId));
    }
  }, [menteeId]);

  
  const { data: menteesData } = useMentees(100, user?.id);

  // Format mentees for display (ensure avatar always has valid source)
  const mentees = useMemo(() => {
    if (!menteesData?.pages.flatMap((page) => page.mentees)) return [];
    return menteesData.pages
      .flatMap((page) => page.mentees)
      .map((mentee) => ({
        id: mentee.id,
        name:
          `${mentee.firstName || ""} ${mentee.lastName || ""}`.trim() ||
          "Mentee",
        avatar:
          mentee.profilePicture?.trim?.()
            ? { uri: mentee.profilePicture.trim() }
            : icons.myProfile,
      }));
  }, [menteesData]);

  // Use mentee assessments hook (shows library when no mentee selected)
  const {
    data: assessments,
    isLoading,
    error,
    refetch,
    isRefetching,
    assignedCount,
  } = useMenteeAssessments(selectedMentee);

  const deleteAssessmentMutation = useDeleteAssessment();

  
  const handleRefresh = () => {
    refetch();
  };

  
  const searchedAssessments = useMemo(() => {
    if (!search.trim()) return assessments;

    const query = search.toLowerCase();
    return assessments.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [assessments, search]);

  
  const statusKeys = [
    { key: "Due", label: "Due" },
    { key: "Not Started", label: "Not Started" },
    { key: "Submitted", label: "Submitted" },
    { key: "Completed", label: "Completed" },
  ];

  
  const availableTabs = useMemo(() => {
    return [
      { key: "All", label: "All", badge: assignedCount },
      ...statusKeys.map((tab) => {
        const count = searchedAssessments.filter(
          (item) => item.status === tab.label,
        ).length;
        return count > 0 ? { ...tab, badge: count } : tab;
      }),
    ];
  }, [searchedAssessments, assignedCount]);

  
  const filteredAssessments = useMemo(() => {
    if (tabs === "All") return searchedAssessments;
    return searchedAssessments.filter((item) => item.status === tabs);
  }, [searchedAssessments, tabs]);

  const handleOpenAssessment = (assessment: Assessment) => {
    const params = appendReturnToParams({
      assessmentId: assessment.id,
      ...(selectedMentee
        ? {
            menteeId: selectedMentee,
            assessmentStatus: assessment.status,
          }
        : {}),
    });
    if (assessment.type === "CMA") {
      router.push({
        pathname: "/(mentor)/assessments/cma-survey-page" as any,
        params,
      });
    } else {
      router.push({
        pathname: "/(mentor)/assessments/(pmp)/pmp-survey-page" as any,
        params,
      });
    }
  };

  const handleOpenCdp = (assessment: Assessment) => {
    if (!selectedMentee) {
      Alert.alert("Select a mentee", "Please select a mentee to view CDP.");
      return;
    }
    router.push({
      pathname: "/(mentor)/assessments/answer-questions" as any,
      params: appendReturnToParams({
        assessmentId: assessment.id,
        viewMode: "true",
        targetUserId: selectedMentee,
        openCdp: "true",
      }),
    });
  };

  const handleMenuPress = (assessment: Assessment) => {
    console.log("Menu pressed:", assessment);
    setSelectedAssessment(assessment);
    bottomSheetRef.current?.present();
  };

  const handleAssignTo = (assessment: Assessment) => {
    bottomSheetRef.current?.dismiss();
    router.push({
      pathname: "/(mentor)/assessments-v2/assign-to" as any,
      params: { assessmentId: assessment.id },
    });
  };

  const handleEditSurvey = (assessment: Assessment) => {
    bottomSheetRef.current?.dismiss();
    router.push({
      pathname: "/(mentor)/assessments-v2/edit-instructions" as any,
      params: { assessmentId: assessment.id },
    });
  };

  const handleDeleteSurvey = (assessment: Assessment) => {
    setAssessmentToDelete(assessment);
    setShowDeleteConfirmationModal(true);
  };

  const handleConfirmDelete = () => {
    if (!assessmentToDelete) return;

    setShowDeleteConfirmationModal(false);
    bottomSheetRef.current?.dismiss();

    deleteAssessmentMutation.mutate(assessmentToDelete.id, {
      onSuccess: () => {
        setShowDeleteSuccessModal(true);
        setAssessmentToDelete(null);
      },
      onError: (error) => {
        console.error("Failed to delete assessment:", error);
        setAssessmentToDelete(null);
        
      },
    });
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmationModal(false);
    setAssessmentToDelete(null);
  };

  const handleDeleteSuccessModalClose = () => {
    setShowDeleteSuccessModal(false);
  };

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar showUserName notifications={3} role="mentor" />

        <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            style={{ paddingRight: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#E2E8F0" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#E2E8F0", fontSize: 20, fontWeight: "700" }}>
              Assessment
            </Text>
            <Text style={{ color: "#CFE7F5", fontSize: 12, marginTop: 2 }}>
              Library
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <View style={styles.headerIconContainer}>
              <Pressable
                hitSlop={8}
                onPress={() =>
                  router.push(
                    "/(mentor)/assessments-v2/select-assessment" as any,
                  )
                }
              >
                <Ionicons name="checkmark-outline" size={22} color="#E2E8F0" />
              </Pressable>
            </View>
            <Pressable
              style={styles.headerIconButton}
              onPress={() =>
                router.push("/(mentor)/assessments-v2/create-assessment" as any)
              }
            >
              <View style={styles.headerIconContainer}>
                <Ionicons name="add-outline" size={24} color="white" />
              </View>
            </Pressable>
          </View>
        </View>

          <View style={{ marginTop: 8 }}>
          <RoadmapSearchField
            value={search}
            onChangeText={setSearch}
            placeholder="Search assessments..."
            dense
          />
        </View>

        {}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 10,
            paddingHorizontal: 4,
            gap: 14,
          }}
        >
          {}
          <Pressable
            onPress={() => setSelectedMentee(null)}
            style={styles.menteeAvatarItem}
          >
            <View style={[styles.menteeAvatarCircle, styles.menteeAvatarCircleLibrary]}>
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                Library
              </Text>
            </View>
            <Text
              style={styles.menteeAvatarLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Library
            </Text>
          </Pressable>

          {mentees.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => setSelectedMentee(m.id)}
              style={styles.menteeAvatarItem}
            >
              <View
                style={[
                  styles.menteeAvatarCircle,
                  selectedMentee === m.id && styles.menteeAvatarCircleSelected,
                ]}
              >
                <Image
                  source={m.avatar}
                  style={styles.menteeAvatarImage}
                />
              </View>
              <Text
                style={styles.menteeAvatarLabel}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {m.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <MentorLibraryStripHint
          visible={!selectedMentee && mentees.length > 0}
        />
      </View>

      {}
      {selectedMentee && (
        <View style={{ marginTop: 10 }}>
          <View style={styles.tabStripWrap}>
            <RoadmapTabStrip
              tabs={availableTabs.map((t) => ({
                key: t.key,
                label: t.label,
                badge: "badge" in t ? t.badge : undefined,
              }))}
              activeKey={tabs}
              onChange={setTabs}
              scrollable
            />
          </View>
        </View>
      )}

      {}
      <View style={{ flex: 1 }}>
        {isLoading && !isRefetching ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#E2E8F0" />
            <Text style={styles.loadingText}>Loading assessments...</Text>
          </View>
        ) : error && !assessments.length ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#E2E8F0" />
            <Text style={styles.errorText}>Failed to load assessments</Text>
            <Text style={styles.errorSubtext}>Pull down to retry</Text>
          </View>
        ) : filteredAssessments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.emptyText}>
              {selectedMentee
                ? assignedCount === 0
                  ? "No assessments assigned to this mentee"
                  : "No assessments found"
                : search.trim()
                  ? "No assessments found matching your search"
                  : "No assessments available"}
            </Text>
            <Text style={styles.emptySubtext}>
              {search
                ? "Try adjusting your search"
                : selectedMentee
                  ? assignedCount === 0
                    ? "Assign assessments to view them here"
                    : "Pull down to refresh"
                  : "Create a new assessment to get started"}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingBottom: bottom + 20,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={handleRefresh}
                tintColor="#fff"
                colors={["#fff"]}
                progressBackgroundColor="rgba(255,255,255,0.2)"
                title="Pull to refresh"
                titleColor="#fff"
              />
            }
          >
            {filteredAssessments.map((item, index) => (
              <React.Fragment key={item.id}>
                <AssessmentCard
                  data={item}
                  hideCompletionMeta={!selectedMentee}
                  onPress={handleOpenAssessment}
                  onMeetingPress={() => {}}
                  onMeetingIconPress={() => {}}
                  onCustomizedPress={() => handleOpenCdp(item)}
                  onMenuPress={() => handleMenuPress(item)}
                />
                {index < filteredAssessments.length - 1 && (
                  <View style={styles.dividerWithMargin} />
                )}
              </React.Fragment>
            ))}
          </ScrollView>
        )}
      </View>

      {}
      <AssessmentMenuBottomSheet
        ref={bottomSheetRef}
        assessment={selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        onAssignTo={handleAssignTo}
        onEditSurvey={handleEditSurvey}
        onDeleteSurvey={handleDeleteSurvey}
      />

      <DeleteConfirmationModal
        visible={showDeleteConfirmationModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <AssessmentDeletedSuccessModal
        visible={showDeleteSuccessModal}
        onClose={handleDeleteSuccessModalClose}
      />
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  tabStripWrap: {
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingText: {
    color: "#E2E8F0",
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  errorSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 60,
  },
  emptyText: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  dividerWithMargin: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: 16,
  },
  headerIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  headerIconButton: {
    padding: 4,
  },
  menteeAvatarItem: {
    width: 72,
    alignItems: "center",
    gap: 8,
  },
  menteeAvatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 0,
    borderColor: "#8BD6FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#0D4C78",
  },
  menteeAvatarCircleLibrary: {
    borderWidth: 3,
  },
  menteeAvatarCircleSelected: {
    borderWidth: 3,
    borderColor: "#8BD6FF",
  },
  menteeAvatarImage: {
    width: 64,
    height: 64,
    resizeMode: "cover",
  },
  menteeAvatarLabel: {
    width: 72,
    color: "#E2E8F0",
    fontSize: 12,
    textAlign: "center",
  },
});
