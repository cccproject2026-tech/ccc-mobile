import { Colors } from "@/constants/Colors";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { useAuthStore } from "@/stores";
import type { AppointmentPlatform } from "@/types/appointment.types";
import {
  appointmentPlatformLabel,
  formatMeetingIdForDisplay,
  getAppointmentJoinUrl,
  parseGoogleMeetCodeFromUrl,
  parseZoomMeetingIdFromUrl,
  truncateMiddle,
  zoomUrlHasPasscodeQuery,
} from "@/utils/meetingLinkDetails";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 18, xxl: 24 } as const;

function normalizeMeetingUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

async function shareContent(label: string, value: string) {
  try {
    await Share.share({ message: value, title: label });
  } catch {
    Alert.alert("Share failed", "Please long-press to copy.");
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const MeetingJoinDetails = ({
  meetingLink,
  platform,
}: {
  meetingLink: string;
  platform: AppointmentPlatform;
}) => {
  const link = meetingLink.trim();
  const zoomId =
    platform === "zoom" ? parseZoomMeetingIdFromUrl(link) : undefined;
  const meetCode =
    platform === "google_meet"
      ? parseGoogleMeetCodeFromUrl(link)
      : undefined;
  const hasZoomPasscode = platform === "zoom" && zoomUrlHasPasscodeQuery(link);

  const details = [
    {
      label: "Platform",
      value: appointmentPlatformLabel(platform),
      isMono: false,
    },
    ...(zoomId
      ? [
          {
            label: "Meeting ID",
            value: formatMeetingIdForDisplay(zoomId),
            isMono: true,
          },
        ]
      : []),
    ...(meetCode ? [{ label: "Meet code", value: meetCode, isMono: true }] : []),
  ];

  return (
    <View style={joinStyles.container}>
      {details.map((detail, idx) => (
        <View key={idx} style={joinStyles.detailCard}>
          <Text style={joinStyles.label}>{detail.label}</Text>
          <View style={joinStyles.valueContainer}>
            <Text
              style={[joinStyles.value, detail.isMono && joinStyles.mono]}
              selectable
              numberOfLines={1}
            >
              {detail.value}
            </Text>
            <Pressable
              accessibilityLabel={`Share ${detail.label}`}
              hitSlop={SPACING.sm}
              onPress={() =>
                shareContent(detail.label, detail.value.replace(/\s/g, ""))
              }
              style={({ pressed }) => [
                joinStyles.iconButton,
                pressed && joinStyles.iconButtonPressed,
              ]}
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ))}

      {hasZoomPasscode && (
        <View style={joinStyles.hintCard}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color="rgba(255,255,255,0.60)"
          />
          <Text style={joinStyles.hint}>
            Your Zoom link includes a passcode — it will be applied automatically.
          </Text>
        </View>
      )}

      <View style={joinStyles.detailCard}>
        <Text style={joinStyles.label}>Link</Text>
        <View style={joinStyles.linkContainer}>
          <Text style={joinStyles.link} selectable numberOfLines={3}>
            {truncateMiddle(link, 56)}
          </Text>
          <Pressable
            style={joinStyles.shareButton}
            onPress={() => shareContent("Meeting link", link)}
          >
            <Ionicons name="share-outline" size={16} color="#153C5A" />
            <Text style={joinStyles.shareText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default function MeetingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { appointmentId } = useLocalSearchParams<{ appointmentId?: string }>();
  const [isOpening, setIsOpening] = useState(false);

  const { appointments, isLoading, refetch } = useAppointments({
    userId: user?.id,
    futureOnly: false,
  });
  const { mentors } = useAssignedMentors(user?.id ?? null);

  const appointment = useMemo(() => {
    if (!appointmentId) return undefined;
    return appointments.find((a) => String(a.id) === String(appointmentId));
  }, [appointments, appointmentId]);

  const meetingLink = useMemo(
    () => getAppointmentJoinUrl(appointment),
    [appointment],
  );
  const mentorName = useMemo(() => {
    if (!appointment?.mentorId) return "Mentor";
    return (
      mentors.find((m) => String(m.id) === String(appointment.mentorId))?.name ||
      "Mentor"
    );
  }, [appointment?.mentorId, mentors]);

  const platform = (appointment?.platform ?? "zoom") as AppointmentPlatform;

  const onJoin = useCallback(async () => {
    if (!meetingLink) return;
    setIsOpening(true);
    try {
      await Linking.openURL(normalizeMeetingUrl(meetingLink));
    } catch {
      Alert.alert("Cannot open link", "Please check the meeting URL.");
    } finally {
      setIsOpening(false);
    }
  }, [meetingLink]);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <LinearGradient
      colors={[...Colors.appBgGradient]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.headerSide}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Meeting details
        </Text>
        <View style={[styles.headerSide, { alignItems: "flex-end" }]}>
          <Pressable
            style={styles.refreshIconButton}
            onPress={onRefresh}
            hitSlop={SPACING.sm}
          >
            <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.9)" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerFill}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.centerText}>Loading meeting…</Text>
          </View>
        ) : !appointment ? (
          <View style={styles.centerFill}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color="rgba(255,255,255,0.6)"
            />
            <Text style={styles.centerTitle}>Meeting not found</Text>
            <Text style={styles.centerText}>
              This appointment may have been removed or is not synced yet.
            </Text>
            <Pressable style={styles.primaryButton} onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={18} color="#153C5A" />
              <Text style={styles.primaryButtonText}>Refresh</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  Meeting with {mentorName}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {formatDate(appointment.meetingDate)} ·{" "}
                  {formatTime(appointment.meetingDate)}
                </Text>
              </View>
              <View style={styles.platformPill}>
                <Text style={styles.platformPillText}>
                  {appointmentPlatformLabel(platform)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {meetingLink ? (
              <>
                <View style={styles.joinButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      isOpening && styles.joinButtonDisabled,
                    ]}
                    onPress={onJoin}
                    disabled={isOpening}
                    activeOpacity={0.8}
                  >
                    <View style={styles.joinButtonContent}>
                      {isOpening ? (
                        <ActivityIndicator size="small" color="#153C5A" />
                      ) : (
                        <>
                          <Ionicons
                            name="videocam"
                            size={20}
                            color="#153C5A"
                          />
                          <Text style={styles.joinButtonText}>Join Meeting</Text>
                          <Ionicons name="arrow-forward" size={18} color="#153C5A" />
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                <MeetingJoinDetails meetingLink={meetingLink} platform={platform} />
              </>
            ) : (
              <View style={styles.emptyLinkCard}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.emptyLinkTitle}>
                    Meeting link not available
                  </Text>
                  <Text style={styles.emptyLinkText}>
                    Your mentor will add the link before the meeting. Tap refresh
                    to check again.
                  </Text>
                </View>
                <Pressable
                  style={styles.miniRefresh}
                  onPress={onRefresh}
                  hitSlop={SPACING.sm}
                >
                  <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerSide: { width: 92, flexDirection: "row", alignItems: "center" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  backText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  refreshIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 6 },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  centerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  centerText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.11)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.20)",
  },
  cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", lineHeight: 20 },
  cardSubtitle: {
    marginTop: 3,
    color: "rgba(255,255,255,0.70)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  platformPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  platformPillText: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 12,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  joinButtonContainer: {
    width: "100%",
    marginBottom: 2,
    backgroundColor: "transparent",
  },
  joinButton: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    overflow: "visible",
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
  },

  joinButtonText: { 
    color: "#153C5A", 
    fontSize: 15, 
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: "transparent",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: { color: "#153C5A", fontSize: 14, fontWeight: "800" },
  emptyLinkCard: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
  },
  emptyLinkTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  emptyLinkText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 17,
  },
  miniRefresh: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

const joinStyles = StyleSheet.create({
  container: { gap: SPACING.sm, marginTop: SPACING.lg },
  detailCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 12,
    gap: 6,
  },
  label: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  value: { 
    color: "rgba(255,255,255,0.95)", 
    fontSize: 15, 
    fontWeight: "800", 
    flex: 1,
    lineHeight: 20,
  },
  mono: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  iconButtonPressed: { backgroundColor: "rgba(255,255,255,0.06)" },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    backgroundColor: "rgba(250, 204, 21, 0.10)",
    borderRadius: 16,
    padding: 12,
  },
  hint: { 
    color: "rgba(255,255,255,0.80)", 
    fontSize: 12, 
    lineHeight: 18, 
    flex: 1, 
    fontWeight: "600" 
  },
  linkContainer: { gap: SPACING.sm },
  link: { 
    color: "rgba(255,255,255,0.85)", 
    fontSize: 12, 
    lineHeight: 18,
    fontWeight: "500",
  },
  shareButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    marginTop: 2,
  },
  shareText: { color: "#153C5A", fontSize: 13, fontWeight: "800" },
});


