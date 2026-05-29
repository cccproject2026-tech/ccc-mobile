import TopBar from "@/components/director/TopBar";
import { useNavigationBack } from "@/hooks/navigation/useNavigationBack";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  role?: "mentor" | "pastor";
  showUserName?: boolean;
  showNotifications?: boolean;
  onMenuPress?: () => void;
  showMenu?: boolean;
};

/** Matches Mentor Sessions / roadmap inner headers: frosted row, reference typography. */
export default function AssessmentFlowHeader({
  title,
  subtitle = "Assessment",
  role = "mentor",
  showUserName = true,
  showNotifications = true,
  onMenuPress,
  showMenu = false,
}: Props) {
  const { handleBack } = useNavigationBack();

  return (
    <>
      <TopBar
        role={role}
        showUserName={showUserName}
        showNotifications={showNotifications}
      />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={22} color={roadmapTheme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          </View>
          {showMenu && onMenuPress ? (
            <TouchableOpacity
              onPress={onMenuPress}
              style={styles.menuButton}
              hitSlop={12}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={roadmapTheme.textPrimary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: roadmapTheme.divider,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.35,
    color: roadmapTheme.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "600",
    color: roadmapTheme.textMuted,
  },
  menuButton: {
    padding: 6,
    marginLeft: 4,
  },
});
