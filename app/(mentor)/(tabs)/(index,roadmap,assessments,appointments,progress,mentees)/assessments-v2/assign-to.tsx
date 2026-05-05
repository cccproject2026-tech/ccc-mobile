import AssessmentAssignedSuccessModal from "@/components/build-components/AssessmentAssignedSuccessModal";
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { useAssessment, useAssignAssessment } from "@/hooks/assessments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MenteeCard from "@/components/director/MenteeCard";
import AppGradientBackground from "@/components/layout/AppGradientBackground";

interface MenteeDisplay {
  id: string;
  name: string;
  email: string;
  avatar: any;
  assignedAssessmentIds?: string[];
  firstName?: string;
  lastName?: string;
  username?: string;
  // Add other fields needed by MenteeCard if we switch to it, or keep custom render
}

export default function AssignToPage() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;
  const { user } = useAuthStore();

  const [search, setSearch] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMentees, setSelectedMentees] = useState<Set<string>>(
    new Set()
  );

  // Fetch assessment to get existing assignments (optional, now we rely on mentee progress)
  const { isLoading: assessmentLoading } = useAssessment(assessmentId);

  // Only mentees assigned to this mentor
  const {
    data: menteesResponse,
    isLoading: loading,
    error: menteesError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useMentees(10, user?.id);

  const assignAssessmentMutation = useAssignAssessment();

  // Map mentees to display format
  const mentees: MenteeDisplay[] = useMemo(() => {
    if (!menteesResponse?.pages.flatMap((page: any) => page.mentees)) return [];
    return menteesResponse.pages.flatMap((page: any) => page.mentees).map((mentee: any) => ({
      ...mentee, // spread full mentee object to support MenteeCard if needed, or at least have data
      id: mentee.id,
      name: `${mentee.firstName} ${mentee.lastName}`.trim(),
      email: mentee.email,
      avatar: icons.myProfile,
      assignedAssessmentIds: mentee.assignedAssessmentIds,
    }));
  }, [menteesResponse]);

  const error = menteesError ? 'Failed to load mentees. Please try again.' : null;

  const filteredMentees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return mentees;
    return mentees.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [search, mentees]);

  const selectableMentees = useMemo(() => {
    return filteredMentees.filter((m) =>
        !m.assignedAssessmentIds?.includes(assessmentId)
    );
  }, [filteredMentees, assessmentId]);

  const alreadyAssignedMentees = useMemo(() => {
    return filteredMentees.filter((m) =>
        m.assignedAssessmentIds?.includes(assessmentId)
    );
  }, [filteredMentees, assessmentId]);

  const areAllSelectableSelected = useMemo(() => {
      return selectableMentees.length > 0 && selectableMentees.every(m => selectedMentees.has(m.id));
  }, [selectableMentees, selectedMentees]);


  const toggleSelection = (menteeId: string) => {
    setSelectedMentees((prev) => {
      const next = new Set(prev);
      if (next.has(menteeId)) {
        next.delete(menteeId);
      } else {
        next.add(menteeId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedMentees((prev) => {
        const newSet = new Set(prev);
        if (areAllSelectableSelected) {
            // Deselect all visible selectable
            selectableMentees.forEach((m) => newSet.delete(m.id));
        } else {
            // Select all visible selectable
            selectableMentees.forEach((m) => newSet.add(m.id));
        }
        return newSet;
    });
  };

  const selectedMenteeNames = useMemo(() => {
    return Array.from(selectedMentees)
      .map((id) => mentees.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3); // Show max 3 names
  }, [selectedMentees, mentees]);

  const handleAssign = async () => {
    if (!assessmentId || selectedMentees.size === 0) {
      Alert.alert("Error", "Please select at least one mentee.");
      return;
    }

    const userIds = Array.from(selectedMentees);
    assignAssessmentMutation.mutate(
      { assessmentId, userIds },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
        },
        onError: (err) => {
          console.error('Failed to assign assessment:', err);
          Alert.alert(
            "Error",
            "Failed to assign assessment. Please try again."
          );
        },
      }
    );
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const renderMenteeItem = ({ item: mentee }: { item: MenteeDisplay }) => {
    const isSelected = selectedMentees.has(mentee.id);
    console.log('mentee', JSON.stringify(mentee, null, 2));
    return (
      <View style={styles.menteeCard}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={mentee.avatar}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        {/* Name */}
        <Text style={styles.menteeName} numberOfLines={1}>
          {mentee.name}
        </Text>

        {/* Checkbox */}
        <Pressable
          onPress={() => toggleSelection(mentee.id)}
          hitSlop={8}
        >
          <View
            style={[
              styles.checkbox,
              isSelected && {
                // borderColor: "#5EB3D1",
                backgroundColor: "#fff",
              },
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={16}  color="#0E2C3A" />
            )}
          </View>
        </Pressable>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    return (
        <View>
             {isFetchingNextPage && (
                <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator color="#E2E8F0" />
                </View>
             )}
             {alreadyAssignedMentees.length > 0 && (
                <View style={styles.assignedSection}>
                    <View style={styles.assignedSectionHeader}>
                        <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.assignedSectionTitle}>
                            Already Assigned ({alreadyAssignedMentees.length})
                        </Text>
                    </View>
                    {alreadyAssignedMentees.map((item) => (
                        <View key={item.id} style={styles.assignedCard} pointerEvents="none">
                            {renderMenteeItem({ item })}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
  };

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar
        showUserName
        notifications={3}
        role="mentor"
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#E2E8F0" />
        </Pressable>
        <Text style={styles.headerTitle}>Assigned to</Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* Search Bar */}
        <View style={{ marginTop: 14 }}>
          <SearchBar
            value={search}
            onChangeValue={setSearch}
            placeholder="Search"
                 />
        </View>

        {/* Select All */}
        <Pressable
          onPress={handleSelectAll}
          hitSlop={8}
          style={{ marginTop: 14, alignSelf: "flex-end" }}
        >
          <Text style={styles.selectAllText}>
            {areAllSelectableSelected ? 'Deselect All' : 'Select All'}
          </Text>
        </Pressable>
      </View>

      {/* Mentees List */}
      <View style={{ flex: 1, marginTop: 16 }}>
        {loading || assessmentLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#E2E8F0" />
            <Text style={{ color: '#E2E8F0', marginTop: 12 }}>
              {loading ? 'Loading mentees...' : 'Loading assignments...'}
            </Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: '#FF6B6B', fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
              {error}
            </Text>
            <Pressable
              onPress={() => refetch()}
              style={{
                backgroundColor: '#5EB3D1',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : filteredMentees.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: '#E2E8F0', fontSize: 16, textAlign: 'center' }}>
              {search.trim() ? 'No mentees found matching your search.' : 'No mentees available.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={selectableMentees}
            renderItem={renderMenteeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: bottom + 100,
            }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="checkmark-done-circle-outline" size={56} color="#fff" style={{ opacity: 0.5 }} />
                    <Text style={styles.emptyText}>All mentees already have this assessment assigned</Text>
                </View>
            }
          />
        )}
      </View>

      {/* Bottom Action Bar */}
      {selectedMentees.size > 0 && (
        <View
            style={[
            styles.bottomActionBar,
            {
                paddingBottom: bottom + 8,
            },
            ]}
        >
            <View style={styles.selectedNamesContainer}>
            <Text style={styles.selectedNamesText} numberOfLines={1}>
                {selectedMenteeNames.length > 0
                ? selectedMenteeNames.join(", ")
                : "No selection"}
            </Text>
            </View>
            <TouchableOpacity
            style={styles.assignButton}
            onPress={handleAssign}
            disabled={assignAssessmentMutation.isPending}
            >
            <LinearGradient
                colors={["#7C3AED", "#38BDF8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.assignButtonGradient}
            >
                <View style={styles.assignButtonInner}>
                {assignAssessmentMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                    <Text style={styles.assignButtonText}>Assign</Text>
                )}
                </View>
            </LinearGradient>
            </TouchableOpacity>
        </View>
      )}

      {/* Success Modal */}
      <AssessmentAssignedSuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    color: "#E2E8F0",
    fontSize: 20,
    fontWeight: "700",
  },
  selectAllText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "500",
  },
  menteeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#1A4882",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF73",
    gap: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0D4C78",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  menteeName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  bottomActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#194F82",
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF73",
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  selectedNamesContainer: {
    flex: 1,
    paddingRight: 12,
  },
  selectedNamesText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
  },
  assignButton: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 100,
  },
  assignButtonGradient: {
    padding: 2,
    borderRadius: 13,
  },
  assignButtonInner: {
    backgroundColor: "#1E366F",
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  assignButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  assignedSection: {
    marginTop: 8,
  },
  assignedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    marginBottom: 4,
  },
  assignedSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  assignedCard: {
    opacity: 0.45,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
});
