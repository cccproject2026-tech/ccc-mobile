import { API_CONFIG } from '@/constants/config/api';
import type { CertificateRecord } from '@/services/certificates.service';
import { getCertificateTemplateBase64 } from '@/utils/certificateAsset';
import {
  buildCertificatePreviewHtml,
  type CertificatePreviewData,
} from '@/utils/certificateTemplate';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Linking } from 'react-native';
import { sharePdfFromHtml } from './pdf';

const API_PUBLIC_ORIGIN =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, '');

export function resolveApiMediaUrl(url: unknown): string | null {
  if (url == null || typeof url !== 'string') return null;
  const value = url.trim();
  if (!value) return null;
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${API_PUBLIC_ORIGIN}${value}`;
  return `${API_PUBLIC_ORIGIN}/${value}`;
}

export function toCertificatePreviewData(
  certificate: CertificateRecord,
  pastorName: string,
): CertificatePreviewData {
  return {
    pastorName: String(certificate.pastorName || pastorName).trim() || pastorName,
    completionDate: certificate.completionDate,
    certificateId: certificate.certificateId,
    duration: certificate.duration,
  };
}

async function downloadAndShareRemotePdf(url: string, fileName: string) {
  const safeName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const baseDir = (FileSystem as any).documentDirectory as string | null | undefined;

  if (!baseDir) {
    await Linking.openURL(url);
    return;
  }

  const targetUri = `${baseDir}${safeName}`;
  const download = await FileSystem.downloadAsync(url, targetUri);
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(download.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Download Certificate',
    });
    return;
  }

  await Linking.openURL(download.uri);
}

export async function downloadCertificatePreviewPdf(
  data: CertificatePreviewData,
  fileName: string,
) {
  const templateImageBase64 = await getCertificateTemplateBase64();
  const html = buildCertificatePreviewHtml(data, templateImageBase64);

  await sharePdfFromHtml({
    html,
    fileName,
  });
}

export async function downloadCertificate(
  certificate: CertificateRecord,
  pastorName: string,
) {
  const fileName = `${String(certificate.certificateId || 'certificate').trim()}.pdf`;
  const previewData = toCertificatePreviewData(certificate, pastorName);

  try {
    await downloadCertificatePreviewPdf(previewData, fileName);
    return;
  } catch (error) {
    console.error('Failed to generate certificate preview PDF', error);
  }

  const remoteUrl = resolveApiMediaUrl(certificate.certificateUrl || certificate.pdfUrl);
  if (remoteUrl) {
    try {
      await downloadAndShareRemotePdf(remoteUrl, fileName);
      return;
    } catch (error) {
      console.error('Failed to download certificate file', error);
      await Linking.openURL(remoteUrl).catch(() => {
        Alert.alert('Download', 'Failed to download certificate. Please try again.');
      });
    }
  }
}

export async function downloadPastorCertificate(options: {
  userId: string;
  pastorName: string;
  fetchCertificate: (userId: string) => Promise<CertificateRecord | null>;
}) {
  const certificate = await options.fetchCertificate(options.userId);

  if (!certificate?.certificateId) {
    Alert.alert('Certificate', 'No certificate is available to download yet.');
    return null;
  }

  await downloadCertificate(certificate, options.pastorName);
  return toCertificatePreviewData(certificate, options.pastorName);
}
