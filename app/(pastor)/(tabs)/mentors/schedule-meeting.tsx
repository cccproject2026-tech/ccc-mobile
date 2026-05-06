import AppGradientBackground from "@/components/layout/AppGradientBackground";
import TopBar from "@/components/director/TopBar";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ScheduleMeetingRedirect() {
  const params = useLocalSearchParams<{ mentorData?: string }>();

  useEffect(() => {
    // Phase 1 flow unification:
    // Redirect legacy mentor scheduling screen into the unified scheduler.
    router.replace({
      pathname: "/schedule-meeting/person",
      params: { mode: "schedule", personData: params.mentorData },
    });
  }, [params.mentorData]);

  return (
    <AppGradientBackground style={{ flex: 1 }}>
      <TopBar role="pastor" showUserName />
      <View style={styles.container}>
        <Text style={styles.title}>Opening scheduler…</Text>
        <Text style={styles.subtle}>Please wait.</Text>
      </View>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  title: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  subtle: { marginTop: 8, color: "rgba(255,255,255,0.75)" },
});

