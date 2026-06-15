import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export interface CertificateRecord {
  certificateId?: string;
  certificateUrl?: string;
  pdfUrl?: string;
  issuedAt?: string;
  issuedByName?: string;
  pastorName?: string;
  completionDate?: string;
  duration?: string;
  programName?: string;
  mentorName?: string;
  directorName?: string;
  [key: string]: unknown;
}

export const hasRealCertificate = (
  certificate: CertificateRecord | null | undefined,
): boolean =>
  Boolean(certificate?.certificateId) &&
  Boolean(certificate?.certificateUrl || certificate?.pdfUrl);

export function unwrapCertificate(value: unknown): CertificateRecord | null {
  const body =
    value && typeof value === 'object' && 'data' in value
      ? (value as { data?: unknown }).data
      : value;
  if (!body || typeof body !== 'object') return null;

  const data =
    'data' in body && (body as { data?: unknown }).data
      ? (body as { data: unknown }).data
      : body;
  if (!data || typeof data !== 'object') return null;

  if (Array.isArray(data)) {
    const first = data.find((item) => item && typeof item === 'object');
    return first ? (first as CertificateRecord) : null;
  }

  const certificates = (data as { certificates?: unknown }).certificates;
  if (Array.isArray(certificates)) {
    const first = certificates.find((item) => item && typeof item === 'object');
    return first ? (first as CertificateRecord) : null;
  }

  const certificate =
    'certificate' in data && (data as { certificate?: unknown }).certificate
      ? (data as { certificate: unknown }).certificate
      : data;

  return certificate && typeof certificate === 'object'
    ? (certificate as CertificateRecord)
    : null;
}

export const certificatesService = {
  getUserCertificate: async (userId: string): Promise<CertificateRecord | null> => {
    try {
      const response = await apiClient.get(
        ENDPOINTS.CERTIFICATES.GET_USER_CERTIFICATE(userId),
      );
      return unwrapCertificate(response.data);
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },
};
