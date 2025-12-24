import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ResourcesScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#808080"
          name="folder.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Mentoring Resources</ThemedText>
      </ThemedView>
      <ThemedText>Access tools and materials for effective mentoring.</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Training Materials</ThemedText>
        <ThemedText>• Mentoring Best Practices Guide</ThemedText>
        <ThemedText>• Communication Skills Handbook</ThemedText>
        <ThemedText>• Goal Setting Templates</ThemedText>
        <ThemedText>• Progress Tracking Tools</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Assessment Tools</ThemedText>
        <ThemedText>• Personality Assessment Forms</ThemedText>
        <ThemedText>• Skills Evaluation Checklists</ThemedText>
        <ThemedText>• Growth Planning Worksheets</ThemedText>
        <ThemedText>• Feedback Collection Forms</ThemedText>
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
