import { Button } from '@/components/atom/buttons';
import { InputCard } from '@/components/atom/cards';
import CheckBox from '@/components/atom/checkBox';
import { HeaderTitle } from '@/components/atom/header';
import { ResponseModal } from '@/components/atom/modals';
import SimpleSuccessModal from '@/components/atom/SimpleSuccessModal';
import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import MicrograntStatusBadge from '@/components/microgrant/MicrograntStatusBadge';
import TopBar from '@/components/director/TopBar';
import { customColors } from '@/constants/config/customColors';
import { useGrant } from '@/hooks/grant/useGrant';
import { useAuthStore } from '@/stores';
import { MicrograntApplicationDetail, MicrograntPickedFile } from '@/types/grant.type';
import {
  MICROGRANT_CONFIRMATION_LABELS,
  MICROGRANT_PAGE_DESCRIPTION,
  MICROGRANT_PAGE_TITLE,
  MICROGRANT_QUESTION_LABELS,
  MICROGRANT_REPORTING_TEXT,
  MicrograntQuestionKey,
  createEmptyMicrograntAnswers,
  normalizeMicrograntSupportingDocs,
} from '@/utils/microgrant';
import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MAX_FILES = 5;

export default function Grant() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    form,
    isLoading,
    isSubmitting,
    error,
    fetchGrantForm,
    fetchApplicationByUserId,
    submitCompleteApplication,
    resetState,
  } = useGrant();

  const [step, setStep] = useState<1 | 2>(1);
  const [formAnswers, setFormAnswers] = useState(createEmptyMicrograntAnswers());
  const [supportingDocs, setSupportingDocs] = useState<MicrograntPickedFile[]>([]);
  const [confirmations, setConfirmations] = useState({
    reviewed: false,
    uploadsIncluded: false,
  });
  const [otherNote, setOtherNote] = useState('');
  const [formId, setFormId] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] = useState<MicrograntApplicationDetail | null>(null);
  const [responseModal, setResponseModal] = useState({
    visible: false,
    message: '',
    buttonText: 'OK',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadPage = useCallback(async () => {
    if (!user?.id) {
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    try {
      const existing = await fetchApplicationByUserId(user.id);
      if (existing?.application) {
        setApplicationData(existing);
        setHasApplied(true);
        setPageLoading(false);
        return;
      }

      const formRes = await fetchGrantForm();
      const id = formRes?.data?._id;
      if (id) {
        setFormId(id);
        setHasApplied(false);
      }
    } catch {
      setResponseModal({
        visible: true,
        message: 'Could not load micro grant. Please try again.',
        buttonText: 'OK',
      });
    } finally {
      setPageLoading(false);
    }
  }, [fetchApplicationByUserId, fetchGrantForm, user?.id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const isCoverSheetValid = useMemo(
    () => MICROGRANT_QUESTION_LABELS.every((label) => formAnswers[label].trim() !== ''),
    [formAnswers]
  );

  const handleInputChange = (fieldLabel: MicrograntQuestionKey, value: string) => {
    setFormAnswers((prev) => ({ ...prev, [fieldLabel]: value }));
    if (validationErrors[fieldLabel]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldLabel];
        return updated;
      });
    }
  };

  const pickSupportingDocs = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.length) return;

    const picked = res.assets.slice(0, MAX_FILES).map((asset) => ({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType || 'application/octet-stream',
    }));

    setSupportingDocs((prev) => [...prev, ...picked].slice(0, MAX_FILES));
  };

  const handleClearForm = () => {
    Alert.alert('Clear Form', 'Are you sure you want to clear all form data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setFormAnswers(createEmptyMicrograntAnswers());
          setSupportingDocs([]);
          setConfirmations({ reviewed: false, uploadsIncluded: false });
          setOtherNote('');
          setValidationErrors({});
          setStep(1);
          resetState();
        },
      },
    ]);
  };

  const handleNext = () => {
    if (!isCoverSheetValid) {
      Alert.alert('Validation Error', 'Please fill all required fields before continuing.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      return;
    }
    if (!formId) {
      Alert.alert('Error', 'Form id is missing. Please refresh and try again.');
      return;
    }
    if (!isCoverSheetValid) {
      Alert.alert('Validation Error', 'Please complete all required cover sheet fields.');
      setStep(1);
      return;
    }
    if (!confirmations.reviewed || !confirmations.uploadsIncluded) {
      Alert.alert('Validation Error', 'Please complete the confirmations before submitting.');
      return;
    }

    const payloadAnswers: Record<string, string> = { ...formAnswers };
    if (otherNote.trim()) {
      payloadAnswers.Other = otherNote.trim();
    }

    try {
      await submitCompleteApplication(user.id, formId, payloadAnswers, supportingDocs);
      setShowSuccessModal(true);

      const appRes = await fetchApplicationByUserId(user.id);
      if (appRes?.application) {
        setApplicationData(appRes);
        setHasApplied(true);
      }

      setFormAnswers(createEmptyMicrograntAnswers());
      setSupportingDocs([]);
      setConfirmations({ reviewed: false, uploadsIncluded: false });
      setOtherNote('');
      setStep(1);
    } catch (err: any) {
      setResponseModal({
        visible: true,
        message: err?.response?.data?.message || err.message || 'Failed to submit application',
        buttonText: 'OK',
      });
    }
  };

  const onBackPress = () => {
    if (hasApplied) {
      router.back();
      return;
    }
    if (step > 1) setStep(1);
    else router.back();
  };

  const submittedAnswers = applicationData?.application?.answers ?? {};
  const submittedDocs = normalizeMicrograntSupportingDocs(
    applicationData?.application?.supportingDocs ??
      applicationData?.application?.supportingDoc
  );

  if (pageLoading || isLoading) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: getFontSize(16) }}>
            Loading micro grant...
          </Text>
        </View>
      </AppGradientBackground>
    );
  }

  if (error && !form && !hasApplied) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#fff', fontSize: getFontSize(18), textAlign: 'center', marginBottom: 16 }}>
            Failed to load micro grant
          </Text>
          <Button title="Retry" type="submit" onPress={loadPage} style={{ width: '50%' }} />
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <>
      <AppGradientBackground style={{ flex: 1 }}>
        <TopBar
          showDrawer={false}
          showBackButton
          onPressBack={onBackPress}
          showNotifications
          onProfilePress={() => {}}
          role="pastor"
        />

        <KeyboardSafeContainer
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'android' ? bottom : bottom * 1.5,
            paddingHorizontal: getSpacing(16),
            flexGrow: 1,
          }}
          style={{ flex: 1, width: '100%' }}
          useSafeAreaBottom
          extraScrollHeight={24}
        >
          <HeaderTitle
            title={MICROGRANT_PAGE_TITLE}
            textStyle={{
              fontWeight: '700',
              color: '#ffffff',
              fontFamily: 'AlbertBold',
              fontSize: getFontSize(isSmallDevice ? 16 : 18),
              textAlign: 'center',
            }}
          />

          <Text
            style={{
              color: 'white',
              fontSize: getFontSize(14),
              lineHeight: getFontSize(20),
              fontWeight: '500',
              textAlign: 'center',
              marginVertical: getSpacing(8),
            }}
          >
            {MICROGRANT_PAGE_DESCRIPTION}
          </Text>

          {hasApplied && applicationData ? (
            <SubmittedApplicationView
              applicationData={applicationData}
              submittedAnswers={submittedAnswers}
              submittedDocs={submittedDocs}
              onBackHome={() => router.back()}
            />
          ) : (
            <>
              {step === 1 && (
                <>
                  <StepHeader
                    step={1}
                    title="Cover Sheet"
                    subtitle="Please answer the questions succinctly following prompts"
                  />
                  <Text style={styles.requiredHint}>* Indicates required questions</Text>

                  {MICROGRANT_QUESTION_LABELS.map((label) => (
                    <View key={label}>
                      <InputCard
                        title={label}
                        value={formAnswers[label]}
                        setValue={(v: string) => handleInputChange(label, v)}
                        description=""
                        required
                        answer
                      />
                      {validationErrors[label] ? (
                        <Text style={styles.errorText}>{validationErrors[label]}</Text>
                      ) : null}
                    </View>
                  ))}

                  <View style={styles.uploadSection}>
                    <Text style={styles.uploadLabel}>
                      Please upload here any supporting documents or media (photos, videos, publications, etc.)
                    </Text>
                    <Pressable style={styles.uploadBox} onPress={pickSupportingDocs}>
                      <Text style={styles.uploadHint}>
                        Tap to choose files (up to {MAX_FILES}, max 10 MB each)
                      </Text>
                    </Pressable>
                    {supportingDocs.map((file, index) => (
                      <Text key={`${file.name}-${index}`} style={styles.fileName}>
                        {file.name}
                      </Text>
                    ))}
                  </View>
                </>
              )}

              {step === 2 && (
                <View style={{ gap: 20, paddingVertical: 12 }}>
                  <View style={styles.panel}>
                    {MICROGRANT_REPORTING_TEXT.map((text, i) => (
                      <View key={i} style={styles.reportRow}>
                        <Text style={styles.star}>*</Text>
                        <Text style={styles.reportText}>{text}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.panel}>
                    <Text style={styles.reviewIntro}>
                      Please review the grant application thoroughly before submission to ensure that all sections have accurate information.
                    </Text>

                    <View style={styles.checkboxRow}>
                      <CheckBox
                        type="square"
                        value={confirmations.reviewed}
                        setValue={(val) =>
                          setConfirmations((prev) => ({ ...prev, reviewed: val }))
                        }
                      />
                      <Text style={styles.checkboxLabel}>
                        {MICROGRANT_CONFIRMATION_LABELS.reviewed}
                      </Text>
                    </View>

                    <View style={styles.checkboxRow}>
                      <CheckBox
                        type="square"
                        value={confirmations.uploadsIncluded}
                        setValue={(val) =>
                          setConfirmations((prev) => ({
                            ...prev,
                            uploadsIncluded: val,
                          }))
                        }
                      />
                      <Text style={styles.checkboxLabel}>
                        {MICROGRANT_CONFIRMATION_LABELS.uploadsIncluded}
                      </Text>
                    </View>

                    <InputCard
                      title="Other"
                      value={otherNote}
                      setValue={setOtherNote}
                      description="Optional"
                      required={false}
                      answer
                    />
                  </View>
                </View>
              )}

              <View style={styles.actions}>
                <Button title="Clear Form" type="cancel" onPress={handleClearForm} style={styles.actionBtn} />
                <Button
                  title={step === 2 ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
                  type="submit"
                  disabled={isSubmitting || (step === 2 && (!confirmations.reviewed || !confirmations.uploadsIncluded))}
                  onPress={() => (step === 2 ? handleSubmit() : handleNext())}
                  style={styles.actionBtn}
                />
              </View>
            </>
          )}
        </KeyboardSafeContainer>
      </AppGradientBackground>

      <SimpleSuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Micro Grant application submitted successfully."
      />

      <ResponseModal
        buttonText={responseModal.buttonText}
        buttonPress={() => setResponseModal((prev) => ({ ...prev, visible: false }))}
        isModalVisible={responseModal.visible}
        responseText={responseModal.message}
        closeMenu={() => setResponseModal((prev) => ({ ...prev, visible: false, message: '' }))}
      />
    </>
  );
}

function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.stepHeader}>
      <Text style={styles.stepTitle}>
        {step}. {title}
      </Text>
      {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function SubmittedApplicationView({
  applicationData,
  submittedAnswers,
  submittedDocs,
  onBackHome,
}: {
  applicationData: MicrograntApplicationDetail;
  submittedAnswers: Record<string, string | string[] | null>;
  submittedDocs: { name: string; url: string }[];
  onBackHome: () => void;
}) {
  const app = applicationData.application;

  return (
    <View style={{ gap: 16, paddingVertical: 12 }}>
      <View style={styles.submittedPanel}>
        <Text style={styles.submittedTitle}>My Micro Grant Application</Text>
        <Text style={styles.submittedEmail}>{applicationData.user.email}</Text>
        <MicrograntStatusBadge status={app.status} />

        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Submitted on</Text>
            <Text style={styles.metaValue}>
              {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
            </Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Last updated</Text>
            <Text style={styles.metaValue}>
              {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : '-'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.submittedPanel}>
        <Text style={styles.sectionTitle}>Submitted Answers</Text>
        {Object.entries(submittedAnswers).map(([label, value]) => (
          <View key={label} style={styles.answerBox}>
            <Text style={styles.answerLabel}>{label}</Text>
            <Text style={styles.answerValue}>{String(value || '-')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.submittedPanel}>
        <Text style={styles.sectionTitle}>Supporting Documents</Text>
        {submittedDocs.length === 0 ? (
          <Text style={styles.emptyDocs}>No supporting documents uploaded.</Text>
        ) : (
          submittedDocs.map((doc, index) => (
            <View key={`${doc.name}-${index}`} style={styles.docRow}>
              <Text style={styles.docName}>{doc.name}</Text>
              {doc.url !== '#' ? (
                <Pressable onPress={() => Linking.openURL(doc.url)}>
                  <Text style={styles.openLink}>Open</Text>
                </Pressable>
              ) : null}
            </View>
          ))
        )}
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Button title="Back" type="submit" onPress={onBackHome} style={{ width: 140 }} />
      </View>
    </View>
  );
}

const styles = {
  stepHeader: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: getSpacing(10),
    backgroundColor: '#14517d',
    marginVertical: getSpacing(16),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    width: '100%' as const,
  },
  stepTitle: {
    color: 'white',
    fontSize: getFontSize(16),
    fontWeight: '600' as const,
  },
  stepSubtitle: {
    color: 'white',
    fontSize: getFontSize(14),
    marginTop: getSpacing(4),
  },
  requiredHint: {
    color: 'yellow',
    fontSize: getFontSize(14),
    fontWeight: '500' as const,
    textAlign: 'right' as const,
    marginBottom: getSpacing(8),
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: getFontSize(12),
    marginTop: getSpacing(-12),
    marginBottom: getSpacing(8),
    marginLeft: getSpacing(4),
  },
  uploadSection: {
    marginTop: getSpacing(12),
    gap: 8,
  },
  uploadLabel: {
    color: 'white',
    fontSize: getFontSize(14),
    fontWeight: '500' as const,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  uploadHint: {
    color: '#cde2f2',
    fontSize: getFontSize(13),
    textAlign: 'center' as const,
  },
  fileName: {
    color: 'white',
    fontSize: getFontSize(13),
  },
  panel: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
  },
  reportRow: {
    flexDirection: 'row' as const,
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 16,
  },
  star: {
    fontSize: 15,
    color: customColors.customWhiteEighty,
  },
  reportText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: customColors.customWhite,
    paddingRight: 20,
  },
  reviewIntro: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: customColors.customWhite,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: customColors.customWhite,
  },
  actions: {
    flexDirection: isSmallDevice ? ('column' as const) : ('row' as const),
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: getSpacing(16),
    marginTop: getSpacing(24),
  },
  actionBtn: {
    flex: isSmallDevice ? undefined : 1,
    width: isSmallDevice ? ('100%' as const) : undefined,
    minHeight: getSpacing(44),
  },
  submittedPanel: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    gap: 12,
  },
  submittedTitle: {
    color: '#fff',
    fontSize: getFontSize(22),
    fontWeight: '600' as const,
  },
  submittedEmail: {
    color: '#d9ebf8',
    fontSize: getFontSize(15),
  },
  metaRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 8,
  },
  metaBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
  },
  metaLabel: {
    color: '#cde2f2',
    fontSize: getFontSize(13),
  },
  metaValue: {
    color: '#fff',
    fontSize: getFontSize(18),
    fontWeight: '600' as const,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: getFontSize(18),
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  answerBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(11, 53, 87, 0.4)',
    padding: 12,
    marginTop: 8,
  },
  answerLabel: {
    color: '#fff',
    fontSize: getFontSize(14),
    fontWeight: '600' as const,
  },
  answerValue: {
    color: '#d9ebf8',
    fontSize: getFontSize(14),
    marginTop: 6,
  },
  emptyDocs: {
    color: '#cde2f2',
    fontSize: getFontSize(14),
  },
  docRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(11, 53, 87, 0.4)',
    padding: 12,
    marginTop: 8,
  },
  docName: {
    color: '#fff',
    fontSize: getFontSize(14),
    flex: 1,
    marginRight: 12,
  },
  openLink: {
    color: '#8ec5eb',
    fontSize: getFontSize(14),
    fontWeight: '600' as const,
  },
};
