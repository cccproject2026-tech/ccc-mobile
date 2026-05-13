import { icons } from "@/constants/images"
import { roadmapTheme } from "@/components/ui/design-system"
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

    const snapPoints = useMemo(() => ["78%"], [])

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
        icon: "map-outline",
        onPress: () => handleAction("revitalization-roadmap"),
      },
      {
        id: "assessments",
        label: "Assessments",
        icon: "document-text-outline",
        onPress: () => handleAction("assessments"),
      },
      {
        id: "track-progress",
        label: "Track Progress",
        icon: "stats-chart-outline",
        onPress: () => handleAction("track-progress"),
      },
      {
        id: "schedule-meeting",
        label: "Schedule Meeting",
        icon: "calendar-outline",
        onPress: () => handleAction("schedule-meeting"),
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
          colors={["#0F3B5C", "#1A4F7A", "#2389C2"]}
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
                <Ionicons name="close" size={22} color="#FFFFFF" />
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
                      size={21}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.menuItemText}>{action.label}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="rgba(255,255,255,0.5)"
                  />
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
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    width: 40,
    height: 4,
  },
  menuGradient: {
    flex: 1,
    paddingTop: 18,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  menuHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  menuAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.22)",
  },
  menuHeaderName: {
    color: roadmapTheme.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  menuItems: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
    borderRadius: 16,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  menuIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  menuItemText: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    letterSpacing: -0.1,
  },
})

