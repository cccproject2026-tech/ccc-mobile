import { formatMicrograntStatus, micrograntStatusColor } from '@/utils/microgrant';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  status?: string;
}

export default function MicrograntStatusBadge({ status }: Props) {
  const color = micrograntStatusColor(status);

  return (
    <View style={[styles.badge, { borderColor: `${color}55`, backgroundColor: `${color}22` }]}>
      <Text style={[styles.text, { color }]}>Status: {formatMicrograntStatus(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
