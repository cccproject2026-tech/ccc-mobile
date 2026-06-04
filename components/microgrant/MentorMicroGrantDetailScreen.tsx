import { Button } from '@/components/atom/buttons';
import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import MicrograntStatusBadge from '@/components/microgrant/MicrograntStatusBadge';
import { PastorNavigationHeader } from '@/components/pastor/Header';
import { useMicrograntApplication } from '@/hooks/grant/useMicrograntApplications';
import { normalizeMicrograntSupportingDocs, MICROGRANT_PAGE_DESCRIPTION, MICROGRANT_PAGE_TITLE } from '@/utils/microgrant';
import { getFontSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MentorMicroGrantDetailScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  const { data, isLoading, error } = useMicrograntApplication(userId || '');

  if (isLoading) {
    return (
      <AppGradientBackground>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading application...</Text>
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  if (!data) {
    return (
      <AppGradientBackground>
        <SafeAreaView style={styles.centered}>
          <Text style={styles.errorText}>
            {error?.message || 'Application not found or you may not have access.'}
          </Text>
          <Button title="Back to list" type="submit" onPress={() => router.back()} style={{ width: 160 }} />
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  const formTitle = MICROGRANT_PAGE_TITLE;

  const answers = data.application.answers ?? {};
  const docs = normalizeMicrograntSupportingDocs(
    data.application.supportingDocs ?? data.application.supportingDoc
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground>
        <SafeAreaView style={styles.container}>
          <PastorNavigationHeader showDrawer={false} showBackButton wrapperClass="mt-2" />

          <KeyboardSafeContainer
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            useSafeAreaBottom
            extraScrollHeight={24}
          >
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>{formTitle}</Text>
              <Text style={styles.heroSubtitle}>{MICROGRANT_PAGE_DESCRIPTION}</Text>

              <View style={styles.applicantCard}>
                <Text style={styles.applicantEmail}>{data.user.email}</Text>
                <Text style={styles.applicantRole}>{data.user.role}</Text>
                <Text style={styles.receivedLabel}>Application received on</Text>
                <Text style={styles.receivedDate}>
                  {data.application.createdAt
                    ? new Date(data.application.createdAt).toLocaleDateString()
                    : '-'}
                </Text>
                <MicrograntStatusBadge status={data.application.status} />
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepRail}>
                {[1, 2].map((step, index) => (
                  <React.Fragment key={step}>
                    <Pressable
                      style={[styles.stepDot, activeStep === step && styles.stepDotActive]}
                      onPress={() => setActiveStep(step as 1 | 2)}
                    >
                      <Text style={styles.stepDotText}>{step}</Text>
                    </Pressable>
                    {index === 0 ? <View style={styles.stepLine} /> : null}
                  </React.Fragment>
                ))}
              </View>

              <View style={styles.stepLabels}>
                <Pressable
                  style={[styles.stepCard, activeStep === 1 && styles.stepCardActive]}
                  onPress={() => setActiveStep(1)}
                >
                  <Text style={styles.stepCardTitle}>Cover Sheet</Text>
                  <Text style={styles.stepCardSubtitle}>Answers and supporting documents</Text>
                </Pressable>
                <Pressable
                  style={[styles.stepCard, activeStep === 2 && styles.stepCardActive]}
                  onPress={() => setActiveStep(2)}
                >
                  <Text style={styles.stepCardTitle}>Reporting Procedures</Text>
                </Pressable>
              </View>
            </View>

            {activeStep === 1 ? (
              <View style={styles.contentPanel}>
                <Text style={styles.requiredHint}>* Indicates required question</Text>

                {Object.entries(answers).map(([label, value]) => (
                  <View key={label} style={styles.answerBlock}>
                    <Text style={styles.answerLabel}>
                      {label} <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <Text style={styles.answerValue}>{String(value ?? '')}</Text>
                  </View>
                ))}

                <Text style={styles.docsTitle}>Supporting Documents</Text>
                {docs.length === 0 ? (
                  <Text style={styles.emptyDocs}>No documents uploaded</Text>
                ) : (
                  docs.map((doc, idx) => (
                    <View key={`${doc.name}-${idx}`} style={styles.docRow}>
                      <Text style={styles.docName}>{doc.name}</Text>
                      {doc.url !== '#' ? (
                        <Pressable onPress={() => Linking.openURL(doc.url)}>
                          <Ionicons name="download-outline" size={20} color="#8ec5eb" />
                        </Pressable>
                      ) : null}
                    </View>
                  ))
                )}

                <View style={styles.footerActions}>
                  <Button title="Next" type="submit" onPress={() => setActiveStep(2)} style={{ width: 120 }} />
                </View>
              </View>
            ) : (
              <View style={styles.contentPanel}>
                <Text style={styles.reportItem}>Grant report required upon completion</Text>
                <Text style={styles.reportItem}>Unused funds must be returned</Text>

                <View style={styles.footerActions}>
                  <Button title="Back" type="cancel" onPress={() => setActiveStep(1)} style={{ width: 120 }} />
                  <Button title="Back to list" type="cancel" onPress={() => router.back()} style={{ width: 140 }} />
                </View>
              </View>
            )}
          </KeyboardSafeContainer>
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
  scrollContent: {
    paddingBottom: 32,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: getFontSize(14),
  },
  errorText: {
    color: '#FFD84E',
    fontSize: getFontSize(14),
    textAlign: 'center',
  },
  heroCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    gap: 12,
  },
  heroTitle: {
    color: '#fff',
    fontSize: getFontSize(20),
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
  },
  applicantCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
    gap: 6,
  },
  applicantEmail: {
    color: '#111',
    fontSize: getFontSize(16),
    fontWeight: '700',
  },
  applicantRole: {
    color: '#666',
    fontSize: getFontSize(13),
    textTransform: 'capitalize',
  },
  receivedLabel: {
    color: '#666',
    fontSize: getFontSize(12),
    marginTop: 8,
  },
  receivedDate: {
    color: '#111',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepRail: {
    alignItems: 'center',
    paddingTop: 8,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: '#8ec5eb',
    backgroundColor: 'rgba(142, 197, 235, 0.2)',
  },
  stepDotText: {
    color: '#fff',
    fontWeight: '700',
  },
  stepLine: {
    width: 3,
    height: 40,
    backgroundColor: 'rgba(142, 197, 235, 0.5)',
    marginVertical: 4,
  },
  stepLabels: {
    flex: 1,
    gap: 10,
  },
  stepCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 14,
  },
  stepCardActive: {
    borderColor: 'rgba(142, 197, 235, 0.4)',
    backgroundColor: 'rgba(10, 53, 88, 0.9)',
  },
  stepCardTitle: {
    color: '#fff',
    fontSize: getFontSize(16),
    fontWeight: '600',
  },
  stepCardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: getFontSize(13),
    marginTop: 4,
  },
  contentPanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    gap: 8,
  },
  requiredHint: {
    color: '#FFD84E',
    fontSize: getFontSize(13),
    textAlign: 'right',
    marginBottom: 8,
  },
  answerBlock: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginTop: 8,
  },
  answerLabel: {
    color: '#fff',
    fontSize: getFontSize(14),
    fontWeight: '600',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#FF6B6B',
  },
  answerValue: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: getFontSize(14),
    lineHeight: getFontSize(20),
  },
  docsTitle: {
    color: '#fff',
    fontSize: getFontSize(15),
    fontWeight: '600',
    marginTop: getSpacing(8),
  },
  emptyDocs: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: getFontSize(14),
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    marginTop: 8,
  },
  docName: {
    color: '#fff',
    fontSize: getFontSize(14),
    flex: 1,
    marginRight: 12,
  },
  reportItem: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: getFontSize(14),
    lineHeight: getFontSize(22),
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
});
