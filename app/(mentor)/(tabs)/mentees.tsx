import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function MenteesScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#808080"
          name="person.2.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">My Mentees</ThemedText>
      </ThemedView>
      <ThemedText>Manage and track your mentees' progress.</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Active Mentees</ThemedText>
        <ThemedText>• Sarah Johnson - Leadership Track</ThemedText>
        <ThemedText>• Michael Chen - Career Development</ThemedText>
        <ThemedText>• Emily Davis - Personal Growth</ThemedText>
        <ThemedText>• David Wilson - Ministry Preparation</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Progress Updates</ThemedText>
        <ThemedText>• 3 mentees completed monthly goals</ThemedText>
        <ThemedText>• 2 mentees need follow-up sessions</ThemedText>
        <ThemedText>• 1 mentee ready for program graduation</ThemedText>
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
