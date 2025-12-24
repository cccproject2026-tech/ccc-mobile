import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SessionsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#808080"
          name="clock.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Mentoring Sessions</ThemedText>
      </ThemedView>
      <ThemedText>Schedule and manage your mentoring sessions.</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Upcoming Sessions</ThemedText>
        <ThemedText>• Tomorrow 2:00 PM - Sarah Johnson</ThemedText>
        <ThemedText>• Wednesday 10:00 AM - Michael Chen</ThemedText>
        <ThemedText>• Friday 3:30 PM - Emily Davis</ThemedText>
        <ThemedText>• Saturday 9:00 AM - Group Session</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Session History</ThemedText>
        <ThemedText>• Total Sessions Conducted: 156</ThemedText>
        <ThemedText>• Average Session Rating: 4.8/5</ThemedText>
        <ThemedText>• Most Recent: Yesterday with David Wilson</ThemedText>
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
