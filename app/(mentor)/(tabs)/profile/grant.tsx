import MicroGrantApplicationCard from '@/components/microgrant/MicroGrantApplicationCard';
import MentorMicroGrantDetailScreen from '@/components/microgrant/MentorMicroGrantDetailScreen';
import { RoadmapSearchField, RoadmapTabStrip } from '@/components/ui/design-system';
import { PastorNavigationHeader } from '@/components/pastor/Header';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import { useMicrograntApplications } from '@/hooks/grant/useMicrograntApplications';
import { MicrograntApplication } from '@/types/grant.type';
import {
  applicantDisplayName,
  churchLabelFromApplication,
  micrograntListDetailSlug,
} from '@/utils/microgrant';
import { getFontSize } from '@/utils/responsive';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TAB_LABELS = ['All', 'New', 'Pending', 'Accepted'] as const;
type MentorMicrograntTab = (typeof TAB_LABELS)[number];

function applicantProfileImage(app: MicrograntApplication): string | undefined {
  const u = app.userId;
  if (u && typeof u === 'object' && u.profilePicture) {
    return String(u.profilePicture);
  }
  return undefined;
}

export default function MentorMicroGrantScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  if (userId) {
    return <MentorMicroGrantDetailScreen />;
  }
  return <MentorMicroGrantListContent />;
}

function MentorMicroGrantListContent() {
  const [activeTab, setActiveTab] = useState<MentorMicrograntTab>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: applications = [], isLoading, isError } = useMicrograntApplications();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const email = (typeof app.userId === 'object' ? app.userId?.email : '')?.toLowerCase() ?? '';
      const church = churchLabelFromApplication(app).toLowerCase();
      const name = applicantDisplayName(app).toLowerCase();
      const matchesQuery = !q || email.includes(q) || church.includes(q) || name.includes(q);
      const matchesTab =
        activeTab === 'All' ? true : app.status === activeTab.toLowerCase();
      return matchesQuery && matchesTab;
    });
  }, [applications, activeTab, searchQuery]);

  const tabData = TAB_LABELS.map((label) => ({ key: label, label }));

  const openDetail = (app: MicrograntApplication) => {
    const slug = micrograntListDetailSlug(app);
    if (!slug) return;
    router.push({
      pathname: '/(mentor)/(tabs)/profile/grant',
      params: { userId: slug },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground>
        <SafeAreaView style={styles.container}>
          <PastorNavigationHeader showDrawer={false} showBackButton wrapperClass="mt-2" />

          <View style={styles.headerBlock}>
            <Text style={styles.title}>Micro grant</Text>
            <Text style={styles.subtitle}>
              Review applications submitted by pastors and mentees. Open View to see the full cover sheet and reporting notes.
            </Text>
          </View>

          <View style={styles.filters}>
            <RoadmapSearchField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, email, or church…"
            />
            <RoadmapTabStrip
              tabs={tabData}
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as MentorMicrograntTab)}
            />
          </View>

          {isError ? (
            <Text style={styles.errorText}>Could not load applications. Try again later.</Text>
          ) : null}

          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading applications…</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyText}>
                {applications.length === 0
                  ? 'No micro grant applications yet.'
                  : 'No applications match your search or filter.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <MicroGrantApplicationCard
                  name={applicantDisplayName(item)}
                  subtitle={churchLabelFromApplication(item)}
                  date={
                    item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : '—'
                  }
                  imageUri={applicantProfileImage(item)}
                  onPress={() => openDetail(item)}
                />
              )}
            />
          )}
        </SafeAreaView>
      </AppGradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerBlock: {
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: getFontSize(24),
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
    marginTop: 8,
  },
  filters: {
    gap: 12,
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: getFontSize(14),
  },
  emptyPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 24,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: getFontSize(14),
    textAlign: 'center',
  },
  errorText: {
    color: '#FFD84E',
    fontSize: getFontSize(14),
    marginBottom: 12,
  },
});
