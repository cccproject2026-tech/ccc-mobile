import type { AppointmentPlatform } from "@/types/appointment.types";
import {
  appointmentPlatformLabel,
  formatMeetingIdForDisplay,
  parseGoogleMeetCodeFromUrl,
  parseZoomMeetingIdFromUrl,
  truncateMiddle,
  zoomUrlHasPasscodeQuery,
} from "@/utils/meetingLinkDetails";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  meetingLink: string;
  platform: AppointmentPlatform;
};

/** Uses RN Share (no native ExpoClipboard). Users can pick “Copy” from the share sheet where available. */
async function sharePlainText(label: string, value: string) {
  try {
    const result = await Share.share({ message: value, title: label });
    if (result.action === Share.sharedAction) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Shared",
        text2: label,
      });
    }
  } catch {
    Toast.show({
      type: "floating",
      position: "top",
      text1: "Could not open share",
      text2: "Long-press the text above to select and copy.",
    });
  }
}

export function MeetingJoinDetails({ meetingLink, platform }: Props) {
  const link = meetingLink.trim();
  const zoomId =
    platform === "zoom" ? parseZoomMeetingIdFromUrl(link) : undefined;
  const meetCode =
    platform === "google_meet"
      ? parseGoogleMeetCodeFromUrl(link)
      : undefined;
  const zoomPwd = platform === "zoom" && zoomUrlHasPasscodeQuery(link);

  const displayUrl = truncateMiddle(link, 52);

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>Meeting connection</Text>

      <View style={styles.row}>
        <Text style={styles.k}>Platform</Text>
        <Text style={styles.v}>{appointmentPlatformLabel(platform)}</Text>
      </View>

      {zoomId ? (
        <View style={styles.row}>
          <Text style={styles.k}>Meeting ID</Text>
          <View style={styles.valueWithCopy}>
            <Text
              style={styles.vMono}
              selectable
            >
              {formatMeetingIdForDisplay(zoomId)}
            </Text>
            <Pressable
              accessibilityLabel="Share meeting ID"
              hitSlop={10}
              onPress={() =>
                sharePlainText("Meeting ID", zoomId.replace(/\s/g, ""))
              }
              style={styles.copyHit}
            >
              <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.75)" />
            </Pressable>
          </View>
        </View>
      ) : null}

      {meetCode ? (
        <View style={styles.row}>
          <Text style={styles.k}>Meet code</Text>
          <View style={styles.valueWithCopy}>
            <Text style={styles.vMono} selectable>
              {meetCode}
            </Text>
            <Pressable
              accessibilityLabel="Share Meet code"
              hitSlop={10}
              onPress={() => sharePlainText("Meet code", meetCode)}
              style={styles.copyHit}
            >
              <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.75)" />
            </Pressable>
          </View>
        </View>
      ) : null}

      {zoomPwd ? (
        <Text style={styles.hint}>
          Your Zoom link includes a passcode — use Join meeting and your
          browser or app will apply it automatically.
        </Text>
      ) : null}

      <View style={styles.row}>
        <Text style={styles.k}>Link</Text>
        <View style={styles.linkBlock}>
          <Text style={styles.linkText} selectable numberOfLines={3}>
            {displayUrl}
          </Text>
          <Pressable
            accessibilityLabel="Share meeting link"
            style={styles.copyLinkBtn}
            onPress={() => sharePlainText("Meeting link", link)}
          >
            <Ionicons name="share-outline" size={18} color="#153C5A" />
            <Text style={styles.copyLinkText}>Share link</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    marginBottom: 4,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  row: {
    gap: 6,
  },
  k: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
  },
  v: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "600",
  },
  vMono: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
    minWidth: 0,
  },
  valueWithCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyHit: {
    padding: 4,
  },
  hint: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 19,
  },
  linkBlock: {
    gap: 10,
  },
  linkText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 10,
    lineHeight: 19,
  },
  copyLinkBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyLinkText: {
    color: "#153C5A",
    fontSize: 14,
    fontWeight: "800",
  },
});
