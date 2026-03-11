import { icons } from "@/constants/images"
import { Mentee } from "@/types/mentee.types"
import { Ionicons } from "@expo/vector-icons"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet"
import { LinearGradient } from "expo-linear-gradient"
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react"
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"



interface MenuAction {
  id: string
  label: string
  icon: string
  onPress: () => void
}

export interface MenteeMenuBottomSheetRef {
  present: () => void
  dismiss: () => void
}

interface MenteeMenuBottomSheetProps {
  mentee: Mentee | null
  onClose?: () => void
  onAction?: (action: string, mentee: Mentee) => void
}

const MenteeMenuBottomSheet = forwardRef<MenteeMenuBottomSheetRef, MenteeMenuBottomSheetProps>(
  ({ mentee, onClose, onAction }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const { bottom } = useSafeAreaInsets()

    const snapPoints = useMemo(() => ["85%"], [])

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }))

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    )

    const handleDismiss = () => {
      onClose?.()
    }

    const handleAction = (actionId: string) => {
      if (mentee && onAction) {
        onAction(actionId, mentee)
      }
      bottomSheetRef.current?.dismiss()
    }

    const menuActions: MenuAction[] = [
      {
        id: "revitalization-roadmap",
        label: "Revitalization Roadmap",
        icon: "clipboard",
        onPress: () => handleAction("revitalization-roadmap"),
      },
      {
        id: "mentor-notes",
        label: "Mentor Notes",
        icon: "create",
        onPress: () => handleAction("mentor-notes"),
      },
      {
        id: "assessments",
        label: "Assessments",
        icon: "checkmark-done",
        onPress: () => handleAction("assessments"),
      },
      {
        id: "assignments",
        label: "Assignments",
        icon: "book",
        onPress: () => handleAction("assignments"),
      },
      {
        id: "track-progress",
        label: "Track Progress",
        icon: "stats-chart",
        onPress: () => handleAction("track-progress"),
      },
      {
        id: "schedule-meeting",
        label: "Schedule Meeting",
        icon: "calendar",
        onPress: () => handleAction("schedule-meeting"),
      },
      {
        id: "mark-complete",
        label: "Mark Programme as Completed",
        icon: "checkmark-circle",
        onPress: () => handleAction("mark-complete"),
      },
    ]

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundComponent={() => null}
        handleIndicatorStyle={styles.handleIndicator}
        onDismiss={handleDismiss}
      >
        <LinearGradient
          colors={["#1A3A6B", "#2B4E7E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.menuGradient, { paddingBottom: bottom }]}
        >
          <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderContent}>
                <Image
                  source={
                    mentee?.profilePicture
                      ? { uri: mentee.profilePicture }
                      : icons.myProfile
                  }
                  style={styles.menuAvatar}
                  resizeMode="cover"
                />
                <Text style={styles.menuHeaderName}>
                  {mentee?.firstName + " " + mentee?.lastName || ""}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => bottomSheetRef.current?.dismiss()}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  activeOpacity={0.85}
                  style={styles.menuItem}
                  onPress={action.onPress}
                >
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name={action.icon as any}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.menuItemText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheetScrollView>
        </LinearGradient>
      </BottomSheetModal>
    )
  }
)

export default MenteeMenuBottomSheet

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 40,
    height: 4,
  },
  menuGradient: {
    flex: 1,
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  menuHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  menuAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  menuHeaderName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
})

