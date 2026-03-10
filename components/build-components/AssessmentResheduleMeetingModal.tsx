import { useUpdateAppointment } from "@/hooks/appointments/useUpadteAppointment";
import { Appointment, AppointmentPlatform } from "@/types/appointment.types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
const meetingModes: AppointmentPlatform[] = [
  "zoom",
  "google_meet",
  // 'teams',
  // 'phone',
  // 'in_person',
];
export interface ResheduleMeetingModal {
  isModalVisible: boolean;
  setVisisible: (visible: boolean) => void;
}

export const AssessmentResheduleMeetingModal = ({
  isModalVisible,
  setVisisible,
}: ResheduleMeetingModal) => {
  const [selectedMode, setSelectedMode] =
    React.useState<AppointmentPlatform>("zoom");
  const { updateAppointmentAsync, isUpdating } = useUpdateAppointment();
  const [selectedAppointmentForMode, setSelectedAppointmentForMode] =
    React.useState<Appointment | null>(null);

  // Get mode label
  const getModeLabel = useCallback((mode: AppointmentPlatform): string => {
    const labels: Record<AppointmentPlatform, string> = {
      zoom: "Zoom",
      google_meet: "Google Meet",
      teams: "Teams",
      phone: "Phone call",
      in_person: "In Person",
    };
    return labels[mode];
  }, []);

  const handleChooseMode = async () => {
    if (!selectedAppointmentForMode) return;
    try {
      console.log("Changing mode to:", selectedMode);
      await updateAppointmentAsync({
        id: selectedAppointmentForMode.id,
        payload: { platform: selectedMode },
      });
      setVisisible(false);
      //setModeSuccessText(`Meeting Mode has been\nChanged to ${getModeLabel(selectedMode)}`);
      //setShowModeSuccess(true);
      setSelectedAppointmentForMode(null);
    } catch (error) {
      Alert.alert("Error", "Failed to change meeting mode");
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisisible(false)}
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
              onPress={() => {
                setVisisible(false);
                //setSelectedItem(item);
              }}
              style={{ marginLeft: 8 }}
              disabled={isUpdating}
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
              disabled={isUpdating}
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
                {getModeLabel(mode)}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={handleChooseMode}
            style={{
              backgroundColor: isUpdating
                ? "rgba(255, 255, 255, 0.5)"
                : "white",
              borderRadius: 12,
              paddingVertical: 14,
              marginTop: 10,
              marginBottom: 2,
            }}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#1535A8" />
            ) : (
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
            )}
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
};
