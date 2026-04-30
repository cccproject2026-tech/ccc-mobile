import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export default function PastorCallMentorScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mentors } = useAssignedMentors(user?.id as string);

  const assignedMentor = mentors.find((mentor: any) => {
    const status = String(mentor?.status || "").toLowerCase();
    return status === "accepted" || status === "assigned";
  }) as any;
  const mentorName = assignedMentor?.name || "Mentor not assigned";
  const mentorPhone = assignedMentor?.phoneNumber || "Phone number not available";

  const handleCallMentor = () => {
    if (!assignedMentor?.phoneNumber) return;
    Linking.openURL(`tel:${assignedMentor.phoneNumber}`);
  };

  return (
    <AppGradientBackground style={styles.screen}>
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Call Mentor</Text>
        <Text style={styles.subtitle}>
          View your assigned mentor details and call directly.
        </Text>

        <View style={styles.card}>
          <View style={styles.item}>
            <Text style={styles.label}>Assigned Mentor</Text>
            <Text style={styles.value}>{mentorName}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{mentorPhone}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.callButton, !assignedMentor?.phoneNumber && styles.callButtonDisabled]}
          onPress={handleCallMentor}
          disabled={!assignedMentor?.phoneNumber}
        >
          <Ionicons name="call-outline" size={16} color="#0A3F6B" />
          <Text style={styles.callButtonText}>Call Now</Text>
        </Pressable>
      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  backText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    marginTop: 2,
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    marginTop: 8,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  item: {
    gap: 4,
  },
  label: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  callButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  callButtonDisabled: {
    opacity: 0.5,
  },
  callButtonText: {
    color: "#0A3F6B",
    fontSize: 14,
    fontWeight: "700",
  },
});
