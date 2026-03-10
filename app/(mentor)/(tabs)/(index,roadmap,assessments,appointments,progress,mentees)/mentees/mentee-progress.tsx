import { ProgressCard } from "@/components/atom/cards";
import CustomBarChart from "@/components/atom/CustomBarChart";
import CustomPieChart from "@/components/atom/CustomPieChart";
import { Tab } from "@/components/atom/tab";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssessments } from "@/hooks/assessments/useAssessments";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useAddFinalComment, useDeleteFinalComment, useProgressByUserId, useUpdateFinalComment } from "@/hooks/progress/useProgress";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { mapApiToFrontend } from "@/lib/assessments/mappers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenteeProgressScreen() {
  const params = useLocalSearchParams();
  const menteeId = params.menteeId as string;

  const [roadmapTabs, setRoadmapTabs] = useState("All");
  const [assessmentTabs, setAssessmentTabs] = useState("All");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [finalComments, setFinalComments] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const { user } = useAuthStore();
  const addFinalCommentMutation = useAddFinalComment();
  const updateFinalCommentMutation = useUpdateFinalComment();
  const deleteFinalCommentMutation = useDeleteFinalComment();


  // Fetch assigned mentees for this mentor
  const { data: menteesData, isLoading: isLoadingMentees } = useMentees(10, user?.id);
  const mentee = useMemo(() => {
    return menteesData?.pages.flatMap((page: any) => page.mentees)?.find((m: any) => m.id === menteeId);
  }, [menteesData, menteeId]);

  // Fetch progress data for the mentee
  const { data: progressData, isLoading: isLoadingProgress } = useProgressByUserId(menteeId);

  // Fetch all roadmaps
  const { data: allRoadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();

  // Fetch all assessments
  const { data: allAssessments, isLoading: isLoadingAssessments } = useAssessments();

  // Get existing final comments from progress data
  const existingComments = useMemo(() => {
    return progressData?.finalComments || [];
  }, [progressData?.finalComments]);

  // Get assigned roadmap IDs from progress
  const assignedRoadmapIds = useMemo(() => {
    return progressData?.roadmaps.items.map((item) => item.roadMapId) || [];
  }, [progressData]);

  // Get assigned assessment IDs from progress
  const assignedAssessmentIds = useMemo(() => {
    return progressData?.assessments.items.map((item) => item.assessmentId) || [];
  }, [progressData]);

  // Format roadmaps for ProgressCard
  const roadmapsData = useMemo(() => {
    if (!allRoadmaps || !progressData) return [];

    // Filter to only assigned roadmaps
    const assignedRoadmaps = allRoadmaps.filter((roadmap) =>
      assignedRoadmapIds.includes(roadmap._id)
    );

    // Create a map of progress data
    const progressMap = new Map();
    progressData.roadmaps.items.forEach((item) => {
      progressMap.set(item.roadMapId, item);
    });

    return assignedRoadmaps.map((roadmap) => {
      const progress = progressMap.get(roadmap._id);
      const roadmapCard = getRoadmapCard(roadmap);

      // Map status to ProgressCard format
      let status: 'Due' | 'In Progress' | 'Not Started Yet' | 'Completed' = 'Not Started Yet';
      if (roadmapCard.status === 'completed') {
        status = 'Completed';
      } else if (roadmapCard.status === 'due') {
        status = 'Due';
      } else if (roadmapCard.status === 'in-progress') {
        status = 'In Progress';
      }

      // Calculate task status
      const taskStatus = {
        notStarted: roadmapCard.status === 'initial',
        started: roadmapCard.status !== 'initial',
        inProgress: roadmapCard.taskProgress?.completed || 0,
        toComplete: roadmapCard.taskProgress?.total || 0,
        completed: roadmapCard.status === 'completed',
      };

      return {
        title: roadmapCard.title,
        description: roadmapCard.description,
        time: roadmapCard.completionTime,
        status,
        image: roadmapCard.image ? { uri: roadmapCard.image } : require("@/assets/images/jumpstart.png"),
        progress: taskStatus.toComplete > 0 ? "1" : "0",
        taskStatus,
        completedTime: roadmapCard.completedDate,
        type: "roadmap" as const,
        dueDate: progress?.endDate,
      };
    });
  }, [allRoadmaps, progressData, assignedRoadmapIds]);

  // Format assessments for ProgressCard
  const assessmentsData = useMemo(() => {
    if (!allAssessments || !progressData) return [];

    // Filter to only assigned assessments
    const assignedAssessments = allAssessments.filter((assessment) =>
      assignedAssessmentIds.includes(assessment._id)
    );

    // Create a map of progress data
    const progressMap = new Map();
    progressData.assessments.items.forEach((item) => {
      progressMap.set(item.assessmentId, item);
    });

    return assignedAssessments.map((apiAssessment) => {
      const assessment = mapApiToFrontend(apiAssessment);
      const progress = progressMap.get(apiAssessment._id);

      // Map status to ProgressCard format
      let status: 'Due' | 'Completed' | 'due' = 'Due';
      if (assessment.status === 'Completed') {
        status = 'Completed';
      } else if (assessment.status === 'Due') {
        status = 'Due';
      }

      // Calculate task status (using progress data if available)
      const taskStatus = {
        notStarted: assessment.status === 'Not Started',
        started: assessment.status !== 'Not Started',
        inProgress: progress?.completedSections || 0,
        toComplete: progress?.totalSections || 0,
        completed: assessment.status === 'Completed',
      };

      return {
        title: assessment.title,
        description: assessment.description,
        image: icons.Assessments,
        progress: taskStatus.toComplete > 0 ? "1" : "0",
        taskStatus,
        dueDate: progress?.dueDate,
        submittedDate: assessment.status === 'Completed' ? assessment.completedOn : undefined,
        status,
        type: "assessment" as const,
        completed: assessment.completedOn,
      };
    });
  }, [allAssessments, progressData, assignedAssessmentIds]);

  const isLoading = isLoadingMentees || isLoadingProgress || isLoadingRoadmaps || isLoadingAssessments;

  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: "white", fontSize: 18, marginTop: 16 }}>Loading progress...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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

  const handleEditComment = (commentId: string, commentText: string) => {
    setEditingCommentId(commentId);
    setFinalComments(commentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setFinalComments("");
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!menteeId) {
              return;
            }

            deleteFinalCommentMutation.mutate(
              {
                userId: menteeId,
                commentId: commentId,
              },
              {
                onSuccess: () => {
                  // Comments will be automatically updated via query invalidation
                },
                onError: (error) => {
                  console.error("Failed to delete final comment:", error);
                  Alert.alert('Error', 'Failed to delete comment. Please try again.');
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setShowCommentsModal(false);
    setEditingCommentId(null);
    setFinalComments("");
  };

  const handleSubmitComments = () => {
    if (!finalComments.trim() || !user?.id || !menteeId) {
      return;
    }

    if (editingCommentId) {
      // Update existing comment
      updateFinalCommentMutation.mutate(
        {
          userId: menteeId,
          commentId: editingCommentId,
          comment: finalComments.trim(),
        },
        {
          onSuccess: () => {
            setFinalComments("");
            setEditingCommentId(null);
            setShowCommentsModal(false);
          },
          onError: (error) => {
            console.error("Failed to update final comment:", error);
          },
        }
      );
    } else {
      // Add new comment
      addFinalCommentMutation.mutate(
        {
          userId: menteeId,
          commentorId: user.id,
          comment: finalComments.trim(),
        },
        {
          onSuccess: () => {
            setFinalComments("");
            setShowCommentsModal(false);
          },
          onError: (error) => {
            console.error("Failed to submit final comment:", error);
            // You might want to show an error toast here
          },
        }
      );
    }
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
                    <Text style={styles.headerTitle}>Pr. {mentee.firstName} {mentee.lastName}</Text>
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
                className="px-4 text-white"
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
                    className="flex-1 w-full "
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
                    <ProgressCard 
                      data={e} 
                      navigation={router} 
                      menteeId={menteeId} 
                      menteeName={mentee ? `Pr. ${mentee.firstName} ${mentee.lastName}` : ''} 
                    />
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
                className="px-4 text-white"
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
                    className="flex-1 w-full "
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
                    <ProgressCard 
                      data={e} 
                      navigation={router} 
                      menteeId={menteeId} 
                      menteeName={mentee ? `Pr. ${mentee.firstName} ${mentee.lastName}` : ''} 
                    />
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
                    Pr. {mentee.firstName} {mentee.lastName} - Final Comments
                  </Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              {/* Display existing comments */}
              {existingComments.length > 0 && !editingCommentId && (
                <View style={styles.commentsDisplay}>
                  {existingComments.map((comment, index) => (
                    <View key={comment._id} style={index > 0 ? styles.commentSeparator : undefined}>
                      {/* Edit and Delete button row */}
                      <View style={styles.commentHeader}>
                        <TouchableOpacity
                          onPress={() => handleEditComment(comment._id, comment.comment)}
                          style={styles.editButton}
                        >
                          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(comment._id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.commentsText}>{comment.comment}</Text>
                      <Text style={styles.commentMeta}>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Input for new comment or editing (only if less than 2 comments OR editing) */}
              {(existingComments.length < 2 || editingCommentId) && (
                <TextInput
                  style={styles.commentsInput}
                  placeholder={editingCommentId ? "Edit your comment..." : "Write the Comments here..."}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  numberOfLines={6}
                  value={finalComments}
                  onChangeText={setFinalComments}
                  textAlignVertical="top"
                />
              )}

              {existingComments.length >= 2 && !editingCommentId && (
                <Text style={styles.maxCommentsText}>
                  Maximum of 2 final comments allowed.
                </Text>
              )}

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={editingCommentId ? handleCancelEdit : handleCloseModal}
                >
                  <Text style={styles.cancelButtonText}>
                    {editingCommentId ? 'Cancel Edit' : 'Cancel'}
                  </Text>
                </TouchableOpacity>

                {(existingComments.length < 2 || editingCommentId) && (
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!finalComments.trim() || addFinalCommentMutation.isPending || updateFinalCommentMutation.isPending) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmitComments}
                    disabled={!finalComments.trim() || addFinalCommentMutation.isPending || updateFinalCommentMutation.isPending}
                  >
                    <Text style={styles.submitButtonText}>
                      {addFinalCommentMutation.isPending || updateFinalCommentMutation.isPending 
                        ? 'Submitting...' 
                        : editingCommentId 
                          ? 'Update' 
                          : 'Submit'}
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
  commentSeparator: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  commentMeta: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.5)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    gap: 6,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  maxCommentsText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
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

