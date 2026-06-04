import { icons } from '@/constants/images';
import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  name: string;
  subtitle: string;
  date: string;
  imageUri?: string;
  onPress: () => void;
}

function resolveAvatarSource(imageUri?: string, name?: string): ImageSourcePropType {
  if (imageUri?.trim()) return { uri: imageUri.trim() };
  if (name?.trim()) {
    return {
      uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=173653&color=ffffff`,
    };
  }
  return icons.profileUpload;
}

interface Props {
  name: string;
  subtitle: string;
  date: string;
  imageUri?: string;
  onPress: () => void;
}

export default function MicroGrantApplicationCard({
  name,
  subtitle,
  date,
  imageUri,
  onPress,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={resolveAvatarSource(imageUri, name)}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>{date}</Text>
        <Pressable style={styles.viewButton} onPress={onPress}>
          <Text style={styles.viewButtonText}>View</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(142, 197, 235, 0.25)',
    backgroundColor: 'rgba(12, 58, 95, 0.92)',
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#cde2f2',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    color: 'rgba(205, 226, 242, 0.8)',
    fontSize: 12,
  },
  viewButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: '#0f4a76',
    fontSize: 14,
    fontWeight: '600',
  },
});
