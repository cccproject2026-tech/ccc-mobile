import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { Assessment } from "@/lib/assessments/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Mock images - alternating between community and roadmap images
const assessmentImages = [
  require("@/assets/images/community.png"),
  require("@/assets/images/roadmap.jpg"),
];

// Mock assessments matching the image
const mockAssessments: Assessment[] = Array.from({ length: 6 }, (_, i) => ({
  id: `pmp_${i + 1}`,
  type: "PMP" as const,
  title: "Pastoral Ministry Profile (PMP)",
  description: "This Survey is about Lorem ipsum dolor sit amet, consectetur",
  status: "Not Started" as const,
  guidelines: [],
  sections: [],
}));

export default function SelectAssessmentPage() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  
  const assessments = useMemo(() => mockAssessments, []);
  
  // Initialize with first 3 assessments selected (matching the image)
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(() =>
    new Set(mockAssessments.slice(0, 3).map((a) => a.id))
  );

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

  const isAllSelected =
    filteredAssessments.length > 0 &&
    selectedAssessments.size === filteredAssessments.length;

  return (
    <LinearGradient colors={["#155C93", "#1B2B60"]} style={{ flex: 1 }}>
      <TopBar
        userName="John Doe"
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
      </View>
    </LinearGradient>
  );
}

