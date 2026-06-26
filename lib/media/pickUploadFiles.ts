import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { ActionSheetIOS, Alert, Platform } from "react-native";

export type PickedUploadFile = {
  id: string;
  uri: string;
  name: string;
  type?: string | null;
  size?: number | null;
};

type PickUploadFilesOptions = {
  multiple?: boolean;
  includeVideos?: boolean;
  documentTypes?: string | string[];
};

function createFileId(name: string) {
  return `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function inferNameFromUri(uri: string, fallback: string) {
  const segment = uri.split("/").pop();
  if (segment && segment.includes(".")) return decodeURIComponent(segment);
  return fallback;
}

export function hasMediaLibraryAccess(
  permission: ImagePicker.MediaLibraryPermissionResponse,
): boolean {
  return permission.granted || permission.accessPrivileges === "limited";
}

export async function ensureMediaLibraryPermission(): Promise<boolean> {
  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (hasMediaLibraryAccess(existing)) return true;

  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (hasMediaLibraryAccess(requested)) return true;

  Alert.alert(
    "Permission Required",
    "Please allow photo library access to choose images or videos from your gallery.",
  );
  return false;
}

function mapImagePickerAssets(
  assets: ImagePicker.ImagePickerAsset[],
): PickedUploadFile[] {
  return assets.map((asset) => {
    const isVideo = asset.type === "video";
    const fallbackName = isVideo
      ? `video-${Date.now()}.mov`
      : `image-${Date.now()}.jpg`;
    const name = asset.fileName?.trim() || inferNameFromUri(asset.uri, fallbackName);

    return {
      id: createFileId(name),
      uri: asset.uri,
      name,
      type: asset.mimeType || (isVideo ? "video/quicktime" : "image/jpeg"),
      size: asset.fileSize ?? null,
    };
  });
}

function mapDocumentPickerAssets(
  assets: DocumentPicker.DocumentPickerAsset[],
): PickedUploadFile[] {
  return assets.map((asset) => ({
    id: createFileId(asset.name),
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType ?? "application/octet-stream",
    size: asset.size ?? null,
  }));
}

async function pickFromPhotoLibrary(
  options: PickUploadFilesOptions,
): Promise<PickedUploadFile[]> {
  const allowed = await ensureMediaLibraryPermission();
  if (!allowed) return [];

  const includeVideos = options.includeVideos !== false;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: includeVideos ? ["images", "videos"] : ["images"],
    allowsMultipleSelection: options.multiple ?? true,
    selectionLimit: options.multiple === false ? 1 : 0,
    quality: 1,
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });

  if (result.canceled || !result.assets?.length) return [];
  return mapImagePickerAssets(result.assets);
}

async function pickFromDocuments(
  options: PickUploadFilesOptions,
): Promise<PickedUploadFile[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: options.documentTypes ?? "*/*",
    multiple: options.multiple ?? true,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return [];
  return mapDocumentPickerAssets(result.assets);
}

function promptIosUploadSource(
  options: PickUploadFilesOptions,
): Promise<PickedUploadFile[]> {
  return new Promise((resolve) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: "Choose upload source",
        message: "Select photos/videos from your library or browse files.",
        options: ["Photo Library", "Browse Files", "Cancel"],
        cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          void pickFromPhotoLibrary(options).then(resolve);
          return;
        }
        if (buttonIndex === 1) {
          void pickFromDocuments(options).then(resolve);
          return;
        }
        resolve([]);
      },
    );
  });
}

/**
 * Cross-platform upload picker.
 * - Android: document picker (existing behavior).
 * - iOS: photo library + files (DocumentPicker does not open Photos gallery).
 */
export async function pickUploadFiles(
  options: PickUploadFilesOptions = {},
): Promise<PickedUploadFile[]> {
  try {
    if (Platform.OS === "ios") {
      return await promptIosUploadSource(options);
    }

    return await pickFromDocuments(options);
  } catch (error) {
    console.error("pickUploadFiles failed", error);
    Alert.alert("Upload failed", "Could not open the file picker. Please try again.");
    return [];
  }
}

/**
 * Opens the photo library directly (profile photos, image-only flows).
 */
export async function pickImagesFromLibrary(options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<PickedUploadFile[]> {
  try {
    const allowed = await ensureMediaLibraryPermission();
    if (!allowed) return [];

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: options?.allowsEditing ?? false,
      aspect: options?.aspect,
      quality: options?.quality ?? 0.85,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });

    if (result.canceled || !result.assets?.length) return [];
    return mapImagePickerAssets(result.assets);
  } catch (error) {
    console.error("pickImagesFromLibrary failed", error);
    Alert.alert("Upload failed", "Could not open the photo library. Please try again.");
    return [];
  }
}
