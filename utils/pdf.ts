import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

export async function sharePdfFromHtml({
  html,
  fileName,
}: {
  html: string;
  fileName: string;
}) {
  try {
    const { uri } = await Print.printToFileAsync({ html });

    const safeName = fileName.toLowerCase().endsWith(".pdf")
      ? fileName
      : `${fileName}.pdf`;
    const baseDir = (FileSystem as any).documentDirectory as
      | string
      | null
      | undefined;
    if (!baseDir) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        ...(Platform.OS === "ios" ? { UTI: "com.adobe.pdf" } : null),
      });
      return;
    }
    const targetUri = `${baseDir}${safeName}`;

    // Keep a stable filename for share sheets.
    await FileSystem.copyAsync({ from: uri, to: targetUri });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert("Download", "Sharing is not available on this device.");
      return;
    }

    await Sharing.shareAsync(targetUri, {
      mimeType: "application/pdf",
      ...(Platform.OS === "ios" ? { UTI: "com.adobe.pdf" } : null),
    });
  } catch (error) {
    console.error("Failed to generate/share PDF", error);
    Alert.alert("Download", "Failed to generate PDF. Please try again.");
  }
}
