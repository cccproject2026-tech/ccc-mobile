import ScheduleMeetingBottomSheet from "@/components/director/ScheduleMeetingBottomSheet";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import type { AssessmentMeetingLink } from "@/lib/assessments/assessmentMeetings";
import { Assessment } from "@/lib/assessments/types";
import { useAuthStore } from "@/stores";
import {
  getFontSize,
  getIconSize,
  getSpacing,
  isIOS,
  moderateScale
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
export interface MenuItem {
  key: string;
  title: string;
  destructive?: boolean;
  icon?: { ios?: string; android?: string };
  onSelect: () => void;
}
const meetingModes = ["Zoom", "Google Meet", "Teams", "Whatsapp", "Phone call"];

export default function AssessmentCard({
  menuItems,
  data,
  onPress,
  onMeetingPress,
  onMeetingIconPress,
  onCustomizedPress,
  onMenuPress,
  meetingInfo,
  hideCompletionMeta,
}: {
  data: Assessment;
  onPress?: (data: Assessment) => void;
  onMeetingPress?: () => void;
  onMeetingIconPress?: () => void;
  onCustomizedPress?: () => void;
  onMenuPress?: () => void;
  menuItems?: MenuItem[];
  meetingInfo?: AssessmentMeetingLink | null;
  /** Mentor assessment library — hide completed/submitted date lines on template cards. */
  hideCompletionMeta?: boolean;
}) {
  // iOS compression factors
  const fontCompress = isIOS ? 0.92 : 1;
  const spacingCompress = isIOS ? 0.85 : 1;
  const imageCompress = isIOS ? 0.92 : 1;
  const cardCompress = isIOS ? 0.96 : 1;
  const { user } = useAuthStore();
  const formatDate = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Update appointment
  const scheduleMeetingBottomSheetRef = React.useRef<BottomSheetModal>(null);

  const handleChooseMode = () => {
    setChangeModeModalVisible(false);
  };
  const [changeModeModalVisible, setChangeModeModalVisible] =
    React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState("Zoom");

  const handleCloseScheduleBottomSheet = () => {
    scheduleMeetingBottomSheetRef.current?.dismiss();
  };

  const handleReschedule = (appointment: any) => {
    scheduleMeetingBottomSheetRef.current?.present();
  };
  const hasScheduledMeeting = !!meetingInfo?.appointmentId;

  /* Change Meeting Mode Modal */
  const changeMeetingMode = () => (
    <Modal
      visible={changeModeModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setChangeModeModalVisible(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={["#264387", "#1D548D", "#176192"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            borderRadius: 24,
            width: Math.min(Dimensions.get("window").width * 0.92, 400),
            paddingHorizontal: 20,
            paddingVertical: 28,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 22,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: "700",
                flex: 1,
                textAlign: "center",
              }}
            >
              Choose your meeting option
            </Text>
            <Pressable
              onPress={() => setChangeModeModalVisible(false)}
              style={{ marginLeft: 8 }}
            >
              <Text style={{ color: "white", fontSize: 28, fontWeight: "400" }}>
                ×
              </Text>
            </Pressable>
          </View>
          {meetingModes.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setSelectedMode(mode)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                minHeight: 36,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  borderWidth: 2,
                  borderColor: selectedMode === mode ? "#3CA1F0" : "#B0B8D1",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                {selectedMode === mode && (
                  <View
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: 6.5,
                      backgroundColor: "#3CA1F0",
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  color: selectedMode === mode ? "#EAF7FF" : "#B0B8D1",
                  fontSize: 19,
                  fontWeight: "500",
                }}
              >
                {mode}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={handleChooseMode}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              paddingVertical: 14,
              marginTop: 10,
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                color: "#1535A8",
                fontSize: 19,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Choose
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Three dots menu button */}
      {user?.role !== "pastor" && onMenuPress && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onMenuPress?.();
          }}
          style={styles.menuBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={getIconSize(20)}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => onPress && onPress(data)}
        activeOpacity={0.8}
      >
        <View style={styles.row}>
          <View style={styles.leftCol}>
            <View style={styles.badgeBox}>
              <Text
                style={[
                  styles.badgeType,
                  { fontSize: getFontSize(38 * fontCompress) },
                ]}
              >
                {data?.type}
              </Text>
              <View style={styles.badgeDivider} />
              <Text
                style={[
                  styles.badgeLabel,
                  {
                    fontSize: getFontSize(9 * fontCompress),
                    lineHeight: getFontSize(16 * fontCompress),
                  },
                ]}
              >
                {data?.type === "CMA"
                  ? "CHURCH ASSESSMENT EVALUATION"
                  : "PASTORAL MINISTRY PROFILE"}
              </Text>
            </View>
            {data?.dueDate && (
              <View style={styles.dueWrap}>
                <Text
                  style={[
                    styles.dueText,
                    { fontSize: getFontSize(12 * fontCompress) },
                  ]}
                >
                  Due : {formatDate(data.dueDate)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.rightCol}>
            <View>
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: getFontSize(15 * fontCompress),
                    lineHeight: getFontSize(20 * fontCompress),
                  },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {data?.title}
              </Text>
            </View>
            <Text
              style={[
                styles.desc,
                {
                  paddingVertical: getSpacing(6 * spacingCompress),
                  fontSize: getFontSize(13 * fontCompress),
                },
              ]}
            >
              {data?.description}
            </Text>
            {user?.role === "pastor" && (
              <TouchableOpacity
                style={[
                  styles.statusPill,
                  {
                    paddingVertical: getSpacing(3 * spacingCompress),
                    paddingHorizontal: getSpacing(7 * spacingCompress),
                    marginVertical: getSpacing(3 * spacingCompress),
                    borderRadius: moderateScale(999),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { fontSize: getFontSize(13 * fontCompress) },
                  ]}
                >
                  Status{" "}
                  <Text style={{ fontWeight: "900", color: "white" }}>•</Text>{" "}
                  <Text
                    style={{
                      fontSize: getFontSize(13 * fontCompress),
                      fontWeight: "500",
                      color:
                        data?.status === "Due"
                          ? "#EAB308"
                          : "rgba(255,255,255,0.92)",
                    }}
                  >
                    {data?.status}
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
            {!hideCompletionMeta && data?.completedOn && (
              <View>
                <Text
                  style={[
                    styles.metaLine,
                    { fontSize: getFontSize(13 * fontCompress) },
                  ]}
                >
                  Completed on :{" "}
                  {formatDate(data.completedOn)}
                </Text>
              </View>
            )}

            {!hideCompletionMeta &&
              data?.status === "Submitted" &&
              (data?.completionDate || data?.completedOn || data?.createdAt) && (
                <View style={{ marginTop: getSpacing(4 * spacingCompress) }}>
                  <Text
                    style={[
                      styles.metaLine,
                      { fontSize: getFontSize(13 * fontCompress) },
                    ]}
                  >
                    Submitted on :{" "}
                    {formatDate(data.completionDate || data.completedOn || data.createdAt)}
                  </Text>
                </View>
              )}

            {user?.role === "pastor" &&
              (data?.status === "Not Started" || data?.status === "Due") && (
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    {
                      paddingVertical: getSpacing(9 * spacingCompress),
                      marginVertical: getSpacing(8 * spacingCompress),
                      width: "72%",
                    },
                  ]}
                  onPress={() => onPress && onPress(data)}
                >
                  <Text
                    style={[
                      styles.primaryBtnText,
                      {
                        fontSize: getFontSize(15 * fontCompress),
                        lineHeight: getFontSize(20 * fontCompress),
                      },
                    ]}
                  >
                    Start Now
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
        {data?.type === "PMP" && (
          <View style={styles.footerPad}>
            {data?.status === "Completed" ? (
              <TouchableOpacity
                style={[
                  styles.secondaryBtn,
                  {
                    paddingVertical: getSpacing(11 * spacingCompress),
                    paddingHorizontal: getSpacing(14 * spacingCompress),
                    marginVertical: getSpacing(8 * spacingCompress),
                    width: "100%",
                  },
                ]}
                onPress={(event) => {
                  // Prevent parent card press from triggering.
              
                  event?.stopPropagation?.();
                  onCustomizedPress?.();
                }}
              >
                <Text
                  style={[
                    styles.secondaryBtnText,
                    {
                      fontSize: getFontSize(14 * fontCompress),
                      lineHeight: getFontSize(18 * fontCompress),
                    },
                  ]}
                >
                  Customized Development Plans
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
      {hasScheduledMeeting && (
        <TouchableOpacity
          style={styles.meetingInner}
          onPress={() => onMeetingPress?.()}
          activeOpacity={0.85}
        >
          <View style={styles.meetingLeft}>
            <View style={styles.meetingIconWrap}>
              <Ionicons name="calendar-outline" size={18} color="#6FD4BE" />
            </View>
            <View style={styles.meetingTextCol}>
              <Text
                style={[
                  styles.meetingLabel,
                  {
                    fontSize: getFontSize(12.5 * fontCompress),
                    lineHeight: getFontSize(16 * fontCompress),
                  },
                ]}
                numberOfLines={1}
              >
                Meeting scheduled on
              </Text>
              {meetingInfo?.meetingDate ? (
                <Text
                  style={[
                    styles.meetingDate,
                    {
                      fontSize: getFontSize(13.5 * fontCompress),
                      lineHeight: getFontSize(18 * fontCompress),
                    },
                  ]}
                  numberOfLines={1}
                >
                  {formatDate(meetingInfo.meetingDate)}
                </Text>
              ) : null}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}
      {changeMeetingMode()}
      <ScheduleMeetingBottomSheet
        ref={scheduleMeetingBottomSheetRef}
        onClose={() => scheduleMeetingBottomSheetRef.current?.dismiss()}
        onSchedule={() => {
          scheduleMeetingBottomSheetRef.current?.dismiss();
        }}
        colorScheme={{
          background: "#1E3A6F",
          text: "#FFFFFF",
          accent: "#FFC107",
          cardBackground: "rgba(255, 255, 255, 0.1)",
        }}
        mode="reschedule"
        // existingAppointment={{
        //   //         id: string,
        //   // userId: string,
        //   mentorId: data.mentorId,
        //   meetingDate: data.meetingDate, // ISO Date
        //   // endTime: string, // ISO Date
        //   // platform: AppointmentPlatform,
        //   // meetingLink?: string,
        //   // notes?: string,
        //   // status: AppointmentStatus,
        //   // createdAt?: string,
        //   // updatedAt?: string,
        // }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    position: "relative",
  },
  menuBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
  },
  leftCol: {
    width: 128,
    alignItems: "center",
  },
  badgeBox: {
    width: "100%",
    height: 138,
    backgroundColor: "#00ABAE",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.75)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  badgeType: {
    color: "#001B4A",
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  badgeDivider: {
    height: 1,
    width: "82%",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 1,
    marginTop: -6,
  },
  badgeLabel: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
    maxWidth: "90%",
  },
  dueWrap: {
    width: "100%",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  dueText: {
    color: "#EAB308",
    fontWeight: "800",
  },
  rightCol: {
    marginLeft: 12,
    flex: 1,
    paddingRight: 22,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  desc: {
    color: roadmapTheme.textMuted,
    fontWeight: "500",
  },
  statusPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    maxWidth: "76%",
  },
  statusText: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  metaLine: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    marginTop: 2,
  },
  primaryBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#153C5A",
    fontWeight: "800",
  },
  footerPad: {
    paddingTop: 8,
  },
  secondaryBtn: {
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(232, 200, 138, 0.28)",
  },
  secondaryBtnText: {
    color: "#0E5A62",
    fontWeight: "800",
  },
  meetingInner: {
    backgroundColor: "transparent",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.45)",
    marginTop: 10,
  },
  meetingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  meetingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  meetingTextCol: {
    flex: 1,
    minWidth: 0,
  },
  meetingLabel: {
    color: "rgba(255,255,255,0.70)",
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  meetingDate: {
    color: "#E8C88A",
    fontWeight: "800",
    marginTop: 2,
  },
  // (legacy styles kept in file previously; no longer used by this component)
});
