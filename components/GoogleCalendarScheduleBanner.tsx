import GoogleCalendarConnectButton from '@/components/GoogleCalendarConnectButton';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  variant?: 'dark' | 'light';
  onConnectionSynced?: () => void;
};

/** Connect button + helper copy for schedule / appointments screens (ccc-web parity). */
export default function GoogleCalendarScheduleBanner({
  variant = 'dark',
  onConnectionSynced,
}: Props) {
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);

  return (
    <View style={styles.wrap}>
      <GoogleCalendarConnectButton
        variant={variant}
        onConnectionSynced={onConnectionSynced}
        onStatusChange={(status) => setGoogleCalendarConnected(status === 'connected')}
      />
      <Text style={[styles.helper, variant === 'dark' ? styles.helperDark : styles.helperLight]}>
        {googleCalendarConnected
          ? 'Google Calendar is active. Busy-time sync is enabled for scheduling.'
          : 'Connect Google so busy times hide automatically and bookings create Calendar events after OAuth.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  helper: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  helperDark: { color: 'rgba(205, 226, 242, 0.75)' },
  helperLight: { color: 'rgba(11, 28, 88, 0.7)' },
});
