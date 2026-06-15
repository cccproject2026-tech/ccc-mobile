import {
  certificateText,
  formatCertificateDate,
  type CertificatePreviewData,
} from '@/utils/certificateTemplate';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const CERTIFICATE_TEMPLATE = require('@/assets/images/certi.png');
const CERTIFICATE_ASPECT_RATIO = 1402 / 1122;

type Props = CertificatePreviewData & {
  width?: number;
};

export default function CertificatePreview({
  pastorName,
  completionDate,
  certificateId,
  duration,
  width = 320,
}: Props) {
  const height = width / CERTIFICATE_ASPECT_RATIO;

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={CERTIFICATE_TEMPLATE}
        style={styles.templateImage}
        resizeMode="contain"
      />

      <Text style={styles.pastorName} numberOfLines={1}>
        {certificateText(pastorName, 'Pastor')}
      </Text>

      <Text style={[styles.detail, styles.completionDate]} numberOfLines={1}>
        {formatCertificateDate(completionDate)}
      </Text>

      <Text style={[styles.detail, styles.duration]} numberOfLines={1}>
        {certificateText(duration, '12 Months')}
      </Text>

      <Text style={[styles.detail, styles.certificateId]} numberOfLines={1}>
        {certificateText(certificateId)}
      </Text>

      <Text style={[styles.detail, styles.status]} numberOfLines={1}>
        Completed
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  templateImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  pastorName: {
    position: 'absolute',
    left: '23%',
    right: '18%',
    top: '42.4%',
    textAlign: 'center',
    color: '#082d72',
    fontFamily: 'Georgia',
    fontWeight: '700',
    fontSize: 11,
  },
  detail: {
    position: 'absolute',
    top: '77.6%',
    textAlign: 'center',
    color: '#082d72',
    fontFamily: 'Georgia',
    fontWeight: '600',
    fontSize: 6,
  },
  completionDate: {
    left: '18.5%',
    width: '10%',
  },
  duration: {
    left: '32%',
    width: '10%',
  },
  certificateId: {
    left: '58%',
    width: '15%',
    fontSize: 5,
  },
  status: {
    left: '74%',
    width: '10%',
  },
});
