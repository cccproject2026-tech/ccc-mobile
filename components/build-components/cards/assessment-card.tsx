import ScheduleMeetingBottomSheet from "@/components/director/ScheduleMeetingBottomSheet";
import { Colors } from "@/constants/Colors";
import { Assessment } from "@/lib/assessments/types";
import { useAuthStore } from "@/stores";
import {
  getFontSize,
  getIconSize,
  getSpacing,
  isIOS,
  moderateScale,
  verticalScale,
} from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as DropdownMenu from "zeego/dropdown-menu";
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
}: {
  data: Assessment;
  onPress?: (data: Assessment) => void;
  onMeetingPress?: () => void;
  onMeetingIconPress?: () => void;
  onCustomizedPress?: () => void;
  onMenuPress?: () => void;
  menuItems?: MenuItem[];
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
  console.log("AssessmentCard rendered with data:", JSON.stringify(data));
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
    <View
      style={{
        width: "100%",
        backgroundColor: "#194F82",
        borderRadius: moderateScale(10 * cardCompress),
        paddingVertical: getSpacing(14 * spacingCompress),
        paddingHorizontal: getSpacing(14 * spacingCompress), // Add more horizontal padding
        marginVertical: getSpacing(2.5 * spacingCompress),
        borderWidth: 1,
        borderColor: "#FFFFFF73",
        position: "relative",
      }}
    >
      {/* Three dots menu button */}
      {user?.role !== "pastor" && onMenuPress && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onMenuPress?.();
          }}
          style={{
            position: "absolute",
            top: getSpacing(14 * spacingCompress),
            right: getSpacing(14 * spacingCompress),
            zIndex: 10,
            padding: getSpacing(4 * spacingCompress),
          }}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <View
            style={{
              width: moderateScale(130 * imageCompress),
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "100%",
                height: verticalScale(138 * imageCompress),
                backgroundColor: "#00ABAE",
                borderWidth: moderateScale(5 * cardCompress),
                borderColor: "#BFFEFE",
                borderRadius: moderateScale(15 * cardCompress),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#001B4A",
                  fontSize: getFontSize(40 * fontCompress),
                  fontWeight: "800",
                }}
              >
                {data?.type}
              </Text>
              <View
                style={{
                  height: moderateScale(0.5 * cardCompress),
                  width: "80%",
                  backgroundColor: "white",
                  borderRadius: moderateScale(1 * cardCompress),
                  marginTop: moderateScale(-6 * cardCompress),
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: getFontSize(9 * fontCompress),
                  fontWeight: "800",
                  textAlign: "center",
                  marginTop: getSpacing(8 * spacingCompress),
                  lineHeight: getFontSize(18 * fontCompress),
                  paddingHorizontal: getSpacing(4 * spacingCompress),
                }}
              >
                {data?.type === "CMA"
                  ? "CHURCH ASSESSMENT EVALUATION"
                  : "PASTORAL MINISTRY PROFILE"}
              </Text>
            </View>
            {data?.dueDate && (
              <View
                style={{
                  //alignItems: "center",
                  width: "100%",
                  marginLeft: getSpacing(10),
                  marginTop: getSpacing(3 * spacingCompress),
                }}
              >
                <Text
                  style={{
                    fontSize: getFontSize(12 * fontCompress),
                    fontWeight: "700",
                    color: "#EAB308",
                  }}
                >
                  Due : {formatDate(data.dueDate)}
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              marginLeft: getSpacing(10 * spacingCompress),
              flex: 1,
              paddingRight: getSpacing(24 * spacingCompress),
            }}
          >
            <View>
              <Text
                style={{
                  color: "white",
                  fontSize: getFontSize(15 * fontCompress),
                  lineHeight: getFontSize(20 * fontCompress),
                  fontWeight: "600",
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {data?.title}
              </Text>
            </View>
            <Text
              style={{
                paddingVertical: getSpacing(6 * spacingCompress),
                color: "#F4F2F2B5",
                fontSize: getFontSize(13 * fontCompress),
              }}
            >
              {data?.description}
            </Text>
            {user?.role === "pastor" && (
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#FFFFFF33",
                  paddingVertical: getSpacing(3 * spacingCompress),
                  paddingHorizontal: getSpacing(7 * spacingCompress),
                  marginVertical: getSpacing(3 * spacingCompress),
                  borderRadius: moderateScale(8 * cardCompress),
                  maxWidth: "70%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: getFontSize(13 * fontCompress),
                    fontWeight: "500",
                    color: "white",
                  }}
                >
                  Status{" "}
                  <Text style={{ fontWeight: "900", color: "white" }}>•</Text>{" "}
                  <Text
                    style={{
                      fontSize: getFontSize(13 * fontCompress),
                      fontWeight: "500",
                      color: data?.status === "Due" ? "#EAB308" : "white",
                    }}
                  >
                    {data?.status}
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
            {data?.completedOn && (
              <View>
                <Text
                  style={{
                    fontSize: getFontSize(13 * fontCompress),
                    fontWeight: "500",
                    color: "white",
                  }}
                >
                  Completed on :{" "}
                  {formatDate(data.completedOn)}
                </Text>
              </View>
            )}

            {data?.status === "Submitted" &&
              (data?.completionDate || data?.completedOn || data?.createdAt) && (
                <View style={{ marginTop: getSpacing(4 * spacingCompress) }}>
                  <Text
                    style={{
                      fontSize: getFontSize(13 * fontCompress),
                      fontWeight: "500",
                      color: "white",
                    }}
                  >
                    Submitted on :{" "}
                    {formatDate(data.completionDate || data.completedOn || data.createdAt)}
                  </Text>
                </View>
              )}

            {user?.role === "pastor" &&
              (data?.status === "Not Started" || data?.status === "Due") && (
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    alignItems: "center",
                    borderRadius: moderateScale(10 * cardCompress),
                    paddingVertical: getSpacing(4 * spacingCompress),
                    marginVertical: getSpacing(8 * spacingCompress),
                    width: "70%",
                  }}
                  onPress={() => onPress && onPress(data)}
                >
                  <Text
                    style={{
                      fontSize: getFontSize(15 * fontCompress),
                      color: "#001FC1",
                      fontWeight: "600",
                      paddingBottom: getSpacing(3 * spacingCompress),
                      lineHeight: getFontSize(20 * fontCompress),
                    }}
                  >
                    Start Now
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
            {data?.type === "PMP" && (
          <View
            style={{
              paddingTop: 5,
            }}
          >
            {data?.status === "Completed" ? (
              <TouchableOpacity
                style={{
                  alignSelf: "center",
                  backgroundColor: "white",
                  borderRadius: moderateScale(10 * cardCompress),
                  alignItems: "center",
                  paddingVertical: getSpacing(5 * spacingCompress),
                  paddingHorizontal: getSpacing(14 * spacingCompress), // Add horizontal padding
                  marginVertical: getSpacing(8 * spacingCompress),
                  width: "95%",
                }}
                onPress={(event) => {
                  // Prevent parent card press from triggering.
              
                  event?.stopPropagation?.();
                  onCustomizedPress?.();
                }}
              >
                <Text
                  style={{
                    paddingVertical: getSpacing(3 * spacingCompress),
                    fontSize: getFontSize(14 * fontCompress),
                    color: "#001FC1",
                    fontWeight: "600",
                    lineHeight: getFontSize(18 * fontCompress),
                  }}
                >
                  Customized Development Plans
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
      {/* data?.status === "Submitted" && data?.meetingDate */}
      {1 == 1 && (
        <LinearGradient
          colors={["#B83AF3", "#21B6E9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: moderateScale(8 * cardCompress),
            padding: moderateScale(2 * cardCompress),
            alignSelf: "center",
            paddingVertical: getSpacing(1 * spacingCompress),
            paddingHorizontal: getSpacing(1 * spacingCompress), // Add horizontal padding
            marginVertical: getSpacing(8 * spacingCompress),
            width: "95%",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#194F82",
              borderRadius: moderateScale(8 * cardCompress),
              alignItems: "center",
              paddingVertical: getSpacing(5 * spacingCompress),
              paddingHorizontal: getSpacing(14 * spacingCompress), // Add horizontal padding
              flexDirection: "row",
              justifyContent: "space-between",
            }}
            onPress={onMeetingPress}
          >
            <Text
              style={{
                fontSize: getFontSize(14 * fontCompress),
                color: "#E9E010",
                fontWeight: "600",
                lineHeight: getFontSize(18 * fontCompress),
                paddingVertical: getSpacing(3 * spacingCompress),
              }}
            >
              Meeting Scheduled on {data?.meetingDate}
            </Text>

            {/* Absolutely positioned right icons */}
            <View style={styles.rightIconsContainer}>
              {1 == 1 && (
                // Use Zeego menu if menuItems provided
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Pressable hitSlop={12} style={styles.iconButton}>
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color="#EAF7FF"
                      />
                    </Pressable>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    {menuItems?.map((item: MenuItem) =>
                      item.key.startsWith("separator") ? (
                        <DropdownMenu.Separator key={item.key} />
                      ) : (
                        <DropdownMenu.Item
                          key={item.key}
                          destructive={item.destructive}
                          onSelect={() => {
                            if (item.title == "Change Mode") {
                              setChangeModeModalVisible(true);
                            } else {
                              handleReschedule(data);
                            }
                            //item.onSelect();
                          }}
                        >
                          <DropdownMenu.ItemTitle>
                            {item.title}
                          </DropdownMenu.ItemTitle>
                          {item.icon && (
                            <DropdownMenu.ItemIcon
                              ios={{
                                name:
                                  Platform.OS === "android"
                                    ? item.icon.android || "ic_menu_view"
                                    : item.icon.ios || "circle",
                                destructive: item.destructive,
                              }}
                            />
                          )}
                        </DropdownMenu.Item>
                      ),
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              )}
            </View>
          </TouchableOpacity>
        </LinearGradient>
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
  card: {
    backgroundColor: Colors.customBlueOne,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
  },
  cardInner: {
    flexDirection: "row",
    gap: 12,
  },
  thumbnailWrap: {
    width: 85,
    height: 85,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    position: "relative",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 32,
  },
  dateTime: {
    color: "#EAF7FF",
    fontSize: 14,
    fontWeight: "600",
  },
  timeHighlight: {
    color: "#d7f96c",
    fontWeight: "700",
  },
  rightIconsContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 5,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingRight: 32,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  personName: {
    color: "#EAF7FF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  modeRow: {
    marginTop: 6,
    paddingRight: 32,
  },
  modeLabel: {
    color: "#CFE9F3",
    fontSize: 13,
  },
  modeValue: {
    color: "#EAF7FF",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
});
