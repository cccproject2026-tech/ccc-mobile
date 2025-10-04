import * as DocumentPicker from "expo-document-picker";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

// Define button types as a union type for better type safety
type ButtonType = "cancel" | "submit" | "schedule" | "custom" | "start";

// Interface for Button component props
interface ButtonProps {
  title: string;
  onPress: () => void;
  type: ButtonType;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ImageSourcePropType | "";
  iconStyles?: StyleProp<ImageStyle>;
}

// Interface for UploadPDFButton component props
interface UploadPDFButtonProps {
  title: string;
  onPress?: () => void;
  selectedFile: DocumentPicker.DocumentPickerResult | null;
  setSelectedFile: (file: DocumentPicker.DocumentPickerResult) => void;
  icon?: ImageSourcePropType | "";
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  type,
  style = {},
  textStyle = {},
  icon = "",
  iconStyles = {},
}) => {
  // Base styles for better maintainability
  const baseButtonStyle: ViewStyle = {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  };

  const baseTextStyle: TextStyle = {
    fontSize: 16,
  };

  if (type === "cancel") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          baseButtonStyle,
          {
            backgroundColor: "white",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text style={[baseTextStyle, { color: "#001fc1" }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  } else if (type === "submit") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          baseButtonStyle,
          {
            borderWidth: 1,
            borderColor: "white",
            backgroundColor: "#1e366e",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text style={[baseTextStyle, { color: "white" }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  } else if (type === "schedule") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          baseButtonStyle,
          {
            borderWidth: 1,
            borderColor: "white",
            backgroundColor: "#1e366f",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text style={[baseTextStyle, { color: "white" }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  } else if (type === "custom") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            borderWidth: 1,
            borderColor: "white",
            backgroundColor: "#1e366f",
            padding: 8,
            borderRadius: 8,
            flexDirection: "row",
            gap: 10,
            justifyContent: "center",
            alignItems: "center",
          },
          style,
        ]}
      >
        {icon !== "" && (
          <Image
            source={icon as ImageSourcePropType}
            style={[{ width: 15, height: 15 }, iconStyles]}
          />
        )}
        <Text style={[baseTextStyle, { color: "white" }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  } else if (type === "start") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            borderWidth: 1,
            borderColor: "white",
            backgroundColor: "#1e366f",
            padding: 8,
            borderRadius: 8,
            flexDirection: "row",
            gap: 10,
            justifyContent: "center",
            alignItems: "center",
          },
          style,
        ]}
      >
        {icon !== "" && (
          <Image
            source={icon as ImageSourcePropType}
            style={{ width: 15, height: 15 }}
          />
        )}
        <Text style={[baseTextStyle, { color: "white" }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  // Return null if type doesn't match any condition (shouldn't happen with proper typing)
  return null;
};

export const UploadPDFButton: React.FC<UploadPDFButtonProps> = ({
  title,
  onPress,
  selectedFile,
  setSelectedFile,
  icon = "",
  style,
}) => {
  const pickDocument = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      // Handle the result properly based on DocumentPicker's updated API
      if (!result.canceled) {
        setSelectedFile(result);
        console.log("Selected PDF:", result);

        // Call onPress callback if provided
        if (onPress) {
          onPress();
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  return (
    <View
      style={[
        styles.uploadContainer,
        { alignItems: "center", marginTop: 20, width: "100%" },
      ]}
    >
      <Button
        title={title}
        onPress={pickDocument}
        type="custom"
        icon={icon}
        style={style}
      />

      {/* Optional: Display selected file name */}
      {selectedFile && !selectedFile.canceled && (
        <Text style={styles.selectedFileText}>
          Selected: {selectedFile.assets?.[0]?.name || "Unknown file"}
        </Text>
      )}
    </View>
  );
};

export const SurveyButton = ({
  title,
  onPress,
  icon = "",
  className = "",
  bgColor = "#1E366F",
  textColor = "#ffffff",
  disabled = false,
  wrapperClass = ``,
}: {
  title: string;
  onPress: () => void;
  icon?: string | undefined;
  className?: string | undefined;
  bgColor?: string | undefined;
  textColor?: string | undefined;
  disabled?: boolean | undefined;
  wrapperClass?: string | undefined;
}) => {
  return (
    <TouchableOpacity
      className={`max-w-[138px] w-full border border-solid border-white/60 shadow-[#00000040] rounded-[10px] h-[44px] flex flew-row justify-center items-center ${wrapperClass}`}
      onPress={onPress}
      style={{
        backgroundColor: bgColor,
      }}
      disabled={disabled}
    >
      <Text
        className={`font-medium text-[15px] leading-[22px] shadow-[#00000040] text-white ${className}`}
        style={{
          color: textColor,
        }}
      >
        {title} {icon !== "" && icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  uploadContainer: {
    // Add any specific styles for the upload container
  },
  selectedFileText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
