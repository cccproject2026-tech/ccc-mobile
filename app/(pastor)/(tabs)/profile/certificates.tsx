import CertificatePreviewModal from '@/components/certificate/CertificatePreviewModal';
import TopBar from '@/components/director/TopBar';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import {
  CommonCard,
  PrimaryButton,
  SectionHeader,
  roadmapTheme,
} from '@/components/ui/design-system';
import { icons } from '@/constants/images';
import { useProfile } from '@/hooks/profile/useProfile';
import { usePastorCertificate } from '@/hooks/pastor/usePastorCertificate';
import { useFieldMentorInvitationActions } from '@/hooks/pastor/useFieldMentorInvitation';
import { certificatesService, hasRealCertificate } from '@/services/certificates.service';
import { toCertificatePreviewData } from '@/utils/certificateDownload';
import type { CertificatePreviewData } from '@/utils/certificateTemplate';
import { formatCertificateDate } from '@/utils/certificateTemplate';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CertificateActionButton({
  label,
  icon,
  variant,
  disabled,
  loading,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  variant: 'light' | 'dark';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  const isLight = variant === 'light';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[certBtnStyles.shell, disabled && certBtnStyles.shellDisabled]}
    >
      <View
        style={[
          certBtnStyles.fill,
          isLight ? certBtnStyles.fillLight : certBtnStyles.fillDark,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isLight ? '#1E366F' : '#FFFFFF'} />
        ) : (
          icon
        )}
        <Text
          style={isLight ? certBtnStyles.labelLight : certBtnStyles.labelDark}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export default function PastorCertificatesScreen() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } =
    useProfile();
  const {
    data: certificate,
    isLoading: isCertificateLoading,
    isError: isCertificateError,
  } = usePastorCertificate(user?.id);

  const {
    handleAccept,
    handleReject,
    isLoading: isInvitationLoading,
  } = useFieldMentorInvitationActions();

  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [certificatePreviewData, setCertificatePreviewData] =
    useState<CertificatePreviewData | null>(null);
  const [certificateFileName, setCertificateFileName] = useState('certificate.pdf');
  const [autoDownloadCertificate, setAutoDownloadCertificate] = useState(false);

  const pastorName = useMemo(() => {
    const first = profileData?.user?.firstName ?? user?.firstName ?? '';
    const last = profileData?.user?.lastName ?? user?.lastName ?? '';
    return `${first} ${last}`.trim() || 'Pastor';
  }, [profileData?.user, user?.firstName, user?.lastName]);

  const hasIssuedCertificate = Boolean(profileData?.user?.hasIssuedCertificate);
  const hasCertificate = hasRealCertificate(certificate);

  const fieldMentorInvitation = profileData?.user?.fieldMentorInvitation;
  const hasFieldMentorInvitation = useMemo(
    () => profileData?.user?.role === 'pastor' && Boolean(fieldMentorInvitation),
    [fieldMentorInvitation, profileData?.user?.role],
  );
  const invitationExpired = useMemo(
    () =>
      Boolean(
        fieldMentorInvitation?.expiresAt &&
          new Date(fieldMentorInvitation.expiresAt) < new Date(),
      ),
    [fieldMentorInvitation?.expiresAt],
  );

  const openCertificatePreview = useCallback(
    async (download: boolean) => {
      if (!user?.id) return;

      try {
        setIsDownloadingCertificate(true);
        const loadedCertificate =
          certificate ?? (await certificatesService.getUserCertificate(user.id));

        if (!loadedCertificate?.certificateId) {
          Alert.alert('Certificate', 'No certificate is available to download yet.');
          setIsDownloadingCertificate(false);
          return;
        }

        const previewData = toCertificatePreviewData(loadedCertificate, pastorName);
        setCertificatePreviewData(previewData);
        setCertificateFileName(`${loadedCertificate.certificateId}.pdf`);
        setAutoDownloadCertificate(download);
        setShowCertificatePreview(true);
      } catch (error: any) {
        console.error('Failed to open certificate:', error);
        setIsDownloadingCertificate(false);
        Alert.alert(
          'Certificate',
          error?.response?.data?.message ||
            error?.message ||
            'Unable to load certificate. Please try again.',
        );
      }
    },
    [certificate, pastorName, user?.id],
  );

  const isLoading = isProfileLoading || (hasIssuedCertificate && isCertificateLoading);

  if (isLoading) {
    return (
      <AppGradientBackground style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.centerStateText}>Loading certificates…</Text>
        </View>
      </AppGradientBackground>
    );
  }

  if (isProfileError || !profileData?.user) {
    return (
      <AppGradientBackground style={styles.container}>
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={40} color="rgba(255,255,255,0.45)" />
          <Text style={styles.centerStateText}>
            Failed to load certificate information. Please try again.
          </Text>
          <PrimaryButton label="Go Back" onPress={() => router.back()} style={styles.centerButton} />
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground style={styles.container}>
        <TopBar role="pastor" />
        <SectionHeader
          title="Certificates"
          subtitle="View and download your programme completion certificate."
          showBackButton
          alwaysShowBack
          showDivider
          variant="compact"
          onBackPress={() => router.back()}
          style={styles.header}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
        >
          {hasIssuedCertificate && hasCertificate ? (
            <>
              <CommonCard style={styles.card}>
                <View style={styles.certificateHero}>
                  <View style={styles.certificateIconWrap}>
                    <Image source={icons.certificateBadge} style={styles.certificateIcon} />
                  </View>
                  <View style={styles.certificateHeroText}>
                    <Text style={styles.certificateTitle}>Programme completion</Text>
                    <Text style={styles.certificateSubtitle}>
                      Certificate issued to {pastorName}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <DetailRow
                  label="Certificate ID"
                  value={String(certificate?.certificateId ?? '—')}
                />
                <DetailRow
                  label="Completion date"
                  value={formatCertificateDate(
                    certificate?.completionDate ?? certificate?.issuedAt,
                  )}
                />
                <DetailRow
                  label="Duration"
                  value={String(certificate?.duration ?? '12 Months')}
                />
                {certificate?.programName ? (
                  <DetailRow label="Programme" value={String(certificate.programName)} />
                ) : null}
                {certificate?.issuedByName || certificate?.directorName ? (
                  <DetailRow
                    label="Issued by"
                    value={String(certificate.issuedByName ?? certificate.directorName)}
                  />
                ) : null}
              </CommonCard>

              <View style={styles.actions}>
                <CertificateActionButton
                  label="View"
                  variant="light"
                  disabled={isDownloadingCertificate}
                  loading={isDownloadingCertificate}
                  onPress={() => openCertificatePreview(false)}
                  icon={<Ionicons name="eye-outline" size={17} color="#1E366F" />}
                />
                <CertificateActionButton
                  label="Download"
                  variant="dark"
                  disabled={isDownloadingCertificate}
                  onPress={() => openCertificatePreview(true)}
                  icon={<Ionicons name="download-outline" size={17} color="#FFFFFF" />}
                />
              </View>
            </>
          ) : hasIssuedCertificate && isCertificateError ? (
            <CommonCard style={styles.card}>
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={36} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyTitle}>Could not load certificate</Text>
                <Text style={styles.emptySubtitle}>
                  Your certificate was issued, but we could not fetch the details right now.
                </Text>
                <PrimaryButton
                  label="Try again"
                  onPress={() => openCertificatePreview(false)}
                  style={styles.centerButton}
                />
              </View>
            </CommonCard>
          ) : (
            <CommonCard style={styles.card}>
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Image source={icons.certificateBadge} style={styles.emptyIcon} />
                </View>
                <Text style={styles.emptyTitle}>No certificate yet</Text>
                <Text style={styles.emptySubtitle}>
                  Complete the revitalization programme to receive your completion certificate.
                  Your director will issue it when you finish.
                </Text>
              </View>
            </CommonCard>
          )}

          {hasFieldMentorInvitation ? (
            <CommonCard style={styles.card}>
              <View style={styles.invitationHeader}>
                <Ionicons name="ribbon-outline" size={22} color={roadmapTheme.accentMint} />
                <Text style={styles.invitationTitle}>Field mentor invitation</Text>
              </View>
              <Text style={styles.invitationText}>
                You have been invited to serve as a field mentor.
              </Text>
              {invitationExpired ? (
                <Text style={styles.invitationExpired}>This invitation has expired.</Text>
              ) : (
                <View style={styles.invitationActions}>
                  <CertificateActionButton
                    label="Not interested"
                    variant="light"
                    disabled={isInvitationLoading}
                    onPress={() => handleReject(fieldMentorInvitation?.token)}
                    icon={<Ionicons name="close-outline" size={17} color="#1E366F" />}
                  />
                  <CertificateActionButton
                    label={isInvitationLoading ? 'Accepting…' : 'Accept'}
                    variant="dark"
                    disabled={isInvitationLoading}
                    onPress={() => handleAccept(fieldMentorInvitation?.token)}
                    icon={<Ionicons name="checkmark-outline" size={17} color="#FFFFFF" />}
                  />
                </View>
              )}
            </CommonCard>
          ) : null}
        </ScrollView>

        {certificatePreviewData ? (
          <CertificatePreviewModal
            visible={showCertificatePreview}
            data={certificatePreviewData}
            fileName={certificateFileName}
            isDownloading={isDownloadingCertificate}
            autoDownload={autoDownloadCertificate}
            onClose={() => setShowCertificatePreview(false)}
            onDownloadingChange={setIsDownloadingCertificate}
            onAutoDownloadComplete={() => setAutoDownloadCertificate(false)}
          />
        ) : null}
      </AppGradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    gap: 12,
  },
  certificateHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  certificateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(111,212,190,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(111,212,190,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certificateIcon: {
    width: 28,
    height: 28,
  },
  certificateHeroText: {
    flex: 1,
    gap: 4,
  },
  certificateTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  certificateSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIcon: {
    width: 32,
    height: 32,
    opacity: 0.85,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invitationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  invitationText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
  },
  invitationExpired: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontStyle: 'italic',
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  centerStateText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  centerButton: {
    marginTop: 8,
    maxWidth: 220,
  },
});

const certBtnStyles = StyleSheet.create({
  shell: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  shellDisabled: {
    opacity: 0.55,
  },
  fill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 12,
    width: '100%',
  },
  fillLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF4',
  },
  fillDark: {
    backgroundColor: '#1E366F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  labelLight: {
    color: '#1E366F',
    fontSize: 14,
    fontWeight: '800',
  },
  labelDark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
