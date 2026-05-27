import { getPersonNameInitial } from "@/utils/personNameInitial";
import React from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  name?: string | null;
  photoUri?: string | null;
  size: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
  initialColor?: string;
  fallbackBackgroundColor?: string;
};

export function PastorDisplayAvatar({
  name,
  photoUri,
  size,
  style,
  initialColor = "#FFFFFF",
  fallbackBackgroundColor = "rgba(255,255,255,0.16)",
}: Props) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  const photo = photoUri?.trim();

  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={[dimension, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        dimension,
        styles.fallback,
        { backgroundColor: fallbackBackgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.initial,
          { fontSize: Math.round(size * 0.42), color: initialColor },
        ]}
      >
        {getPersonNameInitial(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontWeight: "800",
  },
});
