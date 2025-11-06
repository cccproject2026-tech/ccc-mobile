import SearchBar from "@/components/director/SearchBar";
import TopBar from "@/components/director/TopBar";
import { menteeProfiles } from "@/constants/mockMentees";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AssignToPage() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;

  const [search, setSearch] = useState("");
  // Initialize with first 3 mentees selected (matching the image)
  const mentees = useMemo(() => Object.values(menteeProfiles).slice(0, 8), []);
  const [selectedMentees, setSelectedMentees] = useState<Set<string>>(() =>
    new Set(mentees.slice(0, 3).map((m) => m.id))
  );

  const filteredMentees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return mentees;
    return mentees.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [search, mentees]);

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
    if (selectedMentees.size === filteredMentees.length) {
      // Deselect all
      setSelectedMentees(new Set());
    } else {
      // Select all visible items
      setSelectedMentees(new Set(filteredMentees.map((m) => m.id)));
    }
  };

  const selectedMenteeNames = useMemo(() => {
    return Array.from(selectedMentees)
      .map((id) => mentees.find((m) => m.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3); // Show max 3 names
  }, [selectedMentees, mentees]);

  const handleAssign = () => {
    // TODO: Implement assign logic
    console.log("Assigning assessment to:", Array.from(selectedMentees));
    router.back();
  };

  return (
    <LinearGradient colors={["#155C93", "#1B2B60"]} style={{ flex: 1 }}>
      <TopBar
        userName="John Doe"
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
          <Text style={styles.selectAllText}>Select All</Text>
        </Pressable>
      </View>

      {/* Mentees List */}
      <View style={{ flex: 1, marginTop: 16 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filteredMentees.map((mentee) => {
            const isSelected = selectedMentees.has(mentee.id);

            return (
              <View
                key={mentee.id}
                style={[
                  styles.menteeCard,
                  
                ]}
              >
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
                      styles.checkbox,,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#0E2C3A" />
                    )}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom Action Bar */}
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
          disabled={selectedMentees.size === 0}
        >
          <LinearGradient
            colors={["#7C3AED", "#38BDF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.assignButtonGradient}
          >
            <View style={styles.assignButtonInner}>
              <Text style={styles.assignButtonText}>Assign</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
});

