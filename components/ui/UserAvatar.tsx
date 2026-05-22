import { getAvatarSource, type AvatarFields } from "@/utils/avatarSource";
import React from "react";
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  user?: AvatarFields | null;
  size?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

export function UserAvatar({ user, size = 48, style, containerStyle }: Props) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.wrap, dimension, containerStyle]}>
      <Image
        source={getAvatarSource(user)}
        style={[dimension, styles.image, style]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
