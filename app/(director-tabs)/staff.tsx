import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function StaffScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#808080"
          name="person.badge.key.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Staff Management</ThemedText>
      </ThemedView>
      <ThemedText>Oversee staff performance and organizational structure.</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Department Overview</ThemedText>
        <ThemedText>• Pastoral Team: 4 members</ThemedText>
        <ThemedText>• Youth Ministry: 3 members</ThemedText>
        <ThemedText>• Administration: 5 members</ThemedText>
        <ThemedText>• Facilities: 2 members</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Recent Activities</ThemedText>
        <ThemedText>• Performance Reviews: 6 completed</ThemedText>
        <ThemedText>• New Hires: 2 this quarter</ThemedText>
        <ThemedText>• Training Programs: 3 ongoing</ThemedText>
        <ThemedText>• Staff Meetings: Weekly schedule</ThemedText>
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
