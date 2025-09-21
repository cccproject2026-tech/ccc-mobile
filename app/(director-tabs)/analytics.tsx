import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AnalyticsScreen() {
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
        <ThemedText type="title">Analytics & Reports</ThemedText>
      </ThemedView>
      <ThemedText>Monitor organizational performance and growth metrics.</ThemedText>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Attendance Trends</ThemedText>
        <ThemedText>• Sunday Services: ↑ 12% this month</ThemedText>
        <ThemedText>• Midweek Programs: ↑ 8% this month</ThemedText>
        <ThemedText>• Youth Activities: → Stable</ThemedText>
        <ThemedText>• Special Events: ↑ 25% this quarter</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Financial Overview</ThemedText>
        <ThemedText>• Monthly Donations: $52,000</ThemedText>
        <ThemedText>• Operating Expenses: $38,000</ThemedText>
        <ThemedText>• Net Surplus: $14,000</ThemedText>
        <ThemedText>• Budget Variance: +7%</ThemedText>
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
