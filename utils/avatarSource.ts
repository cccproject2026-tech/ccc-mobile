import { ImageSourcePropType } from "react-native";
import { icons } from "@/constants/images";

export type AvatarFields = {
  profilePicture?: string | null;
  profileImage?: string | null;
};

/** Resolved URL from API user / mentee / mentor objects. */
export function resolveProfilePictureUrl(
  fields?: AvatarFields | null,
): string | undefined {
  const url =
    fields?.profilePicture?.trim() || fields?.profileImage?.trim() || undefined;
  return url || undefined;
}

/** Image source for React Native `Image` — remote URI or neutral placeholder. */
export function getAvatarSource(
  fields?: AvatarFields | null,
): ImageSourcePropType {
  const url = resolveProfilePictureUrl(fields);
  if (url) return { uri: url };
  return icons.profileUpload;
}
