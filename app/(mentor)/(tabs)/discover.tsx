import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function DiscoverScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#808080"
          name="chart.bar.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Discover</ThemedText>
      </ThemedView>
      <ThemedText>Explore mentorship insights and community engagement.</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Mentorship Insights</ThemedText>
        <ThemedText>• Active Mentees: 12</ThemedText>
        <ThemedText>• Sessions This Month: 18</ThemedText>
        <ThemedText>• Completion Rate: 87%</ThemedText>
        <ThemedText>• Average Progress: 65%</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Community Engagement</ThemedText>
        <ThemedText>• Upcoming Events: 5</ThemedText>
        <ThemedText>• Training Opportunities: 3</ThemedText>
        <ThemedText>• Resource Library: 42 items</ThemedText>
        <ThemedText>• Network Connections: 28</ThemedText>
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

