import AppGradientBackground from "@/components/layout/AppGradientBackground";
import TopBar from "@/components/director/TopBar";
import { useAuthStore } from "@/stores";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ScheduleFlowScreen() {
  const params = useLocalSearchParams<{
    mentorData?: string;
    mode?: "create" | "reschedule";
    appointmentId?: string;
  }>();

  const { user } = useAuthStore();

  useEffect(() => {
    // Phase 1 flow unification:
    // Redirect legacy schedule-flow route into the unified full-screen flow.
    router.replace({
      pathname: "/schedule-meeting/person",
      params: {
        mode: params.mode === "reschedule" ? "reschedule" : "schedule",
        appointmentId: params.appointmentId,
        personData: params.mentorData,
      },
    });
  }, [params.appointmentId, params.mentorData, params.mode]);

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar role="pastor" showUserName />
      <View style={styles.container}>
        <Text style={styles.title}>Opening scheduler…</Text>
        <Text style={styles.subtle}>Please wait.</Text>
        {!user?.id ? (
          <Text style={styles.subtle}>You may need to sign in again.</Text>
        ) : null}
      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchWrap: { marginBottom: 12 },
  center: { paddingTop: 30, alignItems: "center", gap: 10 },
  subtle: { color: "rgba(255,255,255,0.75)", textAlign: "center" },
  mentorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 10,
  },
  mentorName: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  mentorRole: {
    marginTop: 3,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontSize: 12,
  },
  pick: { color: "rgba(250, 204, 21, 0.95)", fontWeight: "900" },
  backButton: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: { color: "#153C5A", fontWeight: "800" },
});

