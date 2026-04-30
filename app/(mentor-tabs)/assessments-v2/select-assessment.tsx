import { useAssessments } from "@/hooks/assessments";
import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { ApiAssessment, Assessment } from "@/lib/assessments/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppGradientBackground from "@/components/layout/AppGradientBackground";

// Mock images - alternating between community and roadmap images
const assessmentImages = [
  require("@/assets/images/community.png"),
  require("@/assets/images/roadmap.jpg"),
];

// Helper function to map API assessment to component Assessment type
const mapApiAssessmentToAssessment = (apiAssessment: ApiAssessment): Assessment => {
  // Infer type from name or default to 'PMP'
  const inferType = (name: string): 'CMA' | 'PMP' => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('cma') || nameLower.includes('church')) {
      return 'CMA';
    }
    return 'PMP';
  };

  return {
    id: apiAssessment._id,
    type: inferType(apiAssessment.name),
    title: apiAssessment.name,
    description: apiAssessment.description,
    status: 'Not Started' as const,
    guidelines: apiAssessment.instructions,
    sections: apiAssessment.sections.map((section) => ({
      title: section.title,
      subtitle: section.description,
      questionGroups: section.layers.map((layer) => ({
        id: layer._id,
        questions: [
          {
            id: layer._id,
            text: layer.title, // Layer title is the question
            type: 'radio' as const,
            options: layer.choices.map((c) => ({
              label: c.text,
              value: c._id,
            })),
            required: false,
          },
        ],
      })),
    })),
  };
};

export default function SelectAssessmentPage() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(
    new Set()
  );

  // Use TanStack Query hook for assessments
  const { data: apiAssessments, isLoading: loading, error: queryError, refetch } = useAssessments();

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Map API assessments to component Assessment type
  const assessments = useMemo(() => {
    if (!apiAssessments) return [];
    return apiAssessments.map(mapApiAssessmentToAssessment);
  }, [apiAssessments]);

  // Initialize with first 3 assessments selected if available
  useEffect(() => {
    if (assessments.length > 0 && selectedAssessments.size === 0) {
      setSelectedAssessments(
        new Set(assessments.slice(0, 3).map((a) => a.id))
      );
    }
  }, [assessments, selectedAssessments.size]);

  const error = queryError ? 'Failed to load assessments. Please try again.' : null;

  const filteredAssessments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return assessments;
    return assessments.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }, [search, assessments]);

  const toggleSelection = (assessmentId: string) => {
    setSelectedAssessments((prev) => {
      const next = new Set(prev);
      if (next.has(assessmentId)) {
        next.delete(assessmentId);
      } else {
        next.add(assessmentId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedAssessments.size === filteredAssessments.length) {
      // Deselect all
      setSelectedAssessments(new Set());
    } else {
      // Select all visible items
      setSelectedAssessments(new Set(filteredAssessments.map((a) => a.id)));
    }
  };

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar
        userName="Mentor"
        showUserName
        notifications={3}
        role="mentor"
      />

      <View style={{ paddingHorizontal: 16 }}>
        {/* Close and Share Icons */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="close" size={24} color="#E2E8F0" />
          </Pressable>
          <Pressable hitSlop={10}>
            <MaterialCommunityIcons
              name="redo"
              size={24}
              color={
                selectedAssessments.size === 0
                  ? "rgba(255, 255, 255, 0.5)"
                  : "#fff"
              }
            />
          </Pressable>
        </View>

        {/* Search Bar with Select All */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
          }}
        >
          <View style={{ flex: 1 }}>
            <SearchBar
              value={search}
              onChangeValue={setSearch}
              placeholder="Search"
            />
          </View>
        </View>
        <Pressable onPress={handleSelectAll} hitSlop={8} style={{ marginTop: 14, alignSelf: "flex-end" }}>
          <Text
            style={{
              color: "#E2E8F0",
              fontSize: 16,
              fontWeight: "500",
            }}
          >
            Select All
          </Text>
        </Pressable>
      </View>

      {/* Assessment Cards List */}
      <View style={{ flex: 1, marginTop: 16 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#E2E8F0" />
            <Text style={{ color: '#E2E8F0', marginTop: 12 }}>
              Loading assessments...
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
        ) : filteredAssessments.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: '#E2E8F0', fontSize: 16, textAlign: 'center' }}>
              {search.trim() ? 'No assessments found matching your search.' : 'No assessments available.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: bottom + 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {filteredAssessments.map((assessment, index) => {
              const isSelected = selectedAssessments.has(assessment.id);
              const imageIndex = index % assessmentImages.length;
              const imageSource = assessmentImages[imageIndex];

              return (
                <View
                  key={assessment.id}
                  style={{
                    padding: 12,
                    borderColor: "#FFFFFF73",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#FFFFFF73",
                  }}
                >
                  {/* Checkbox */}
                  <Pressable
                    onPress={() => toggleSelection(assessment.id)}
                    hitSlop={8}
                    style={{ marginTop: 4 }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: isSelected ? "#5EB3D1" : "#D9D9D9",
                        backgroundColor: isSelected ? "#5EB3D1" : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#0E2C3A" />
                      )}
                    </View>
                  </Pressable>

                  {/* Image Thumbnail */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      backgroundColor: "#194F82",
                      borderRadius: 12,
                      borderWidth: 1,
                      padding: 12,
                      borderColor: "#FFFFFF73",
                    }}
                  >
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: "#0D4C78",
                      }}
                    >
                      <Image
                        source={imageSource}
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "cover",
                        }}
                      />
                    </View>

                    {/* Title and Description */}
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 16,
                          fontWeight: "700",
                          lineHeight: 22,
                        }}
                        numberOfLines={1}
                      >
                        {assessment.title}
                      </Text>
                      <Text
                        style={{
                          color: "#E2E8F0",
                          fontSize: 14,
                          lineHeight: 20,
                        }}
                        numberOfLines={2}
                      >
                        {assessment.description}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </AppGradientBackground>
  );
}

