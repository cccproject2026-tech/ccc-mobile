import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Organization Settings</ThemedText>
      </ThemedView>
      <ThemedText>Configure organizational policies and system preferences.</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">System Configuration</ThemedText>
        <ThemedText>• User Access Controls</ThemedText>
        <ThemedText>• Data Backup Settings</ThemedText>
        <ThemedText>• Security Protocols</ThemedText>
        <ThemedText>• Integration Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Organizational Policies</ThemedText>
        <ThemedText>• Staff Guidelines</ThemedText>
        <ThemedText>• Financial Procedures</ThemedText>
        <ThemedText>• Communication Standards</ThemedText>
        <ThemedText>• Emergency Protocols</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
