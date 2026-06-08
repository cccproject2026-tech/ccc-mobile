import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

export type TextAreaFieldProps = {
  label?: string;
  numberOfLines?: number;
  maxLength?: number;
  inputClassName?: string;
  containerClass?: string;
  boxClass?: string;
  inputClass?: ViewStyle;
  editable?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  containerStyle?: ViewStyle;
} & Pick<TextInputProps, "blurOnSubmit" | "returnKeyType">;

const TextAreaField = forwardRef<TextInput, TextAreaFieldProps>(function TextAreaField(
  {
    label = "Comments",
    numberOfLines = 4,
    maxLength,
    inputClassName = ``,
    containerClass = ``,
    boxClass = ``,
    inputClass,
    editable = true,
    value,
    onChangeText,
    containerStyle = {},
    blurOnSubmit = false,
    returnKeyType = "default",
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]} className={containerClass}>
      <View
        style={[styles.box, inputClass, focused && styles.boxFocused]}
        className={boxClass}
      >
        {!focused && !value && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          style={styles.input}
          className={inputClassName}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          placeholderTextColor="rgba(255,255,255,0.5)"
          textAlignVertical="top"
          blurOnSubmit={blurOnSubmit}
          returnKeyType={returnKeyType}
        />
      </View>
    </View>
  );
});

export default TextAreaField;

const styles = StyleSheet.create({
  container: {
    
    justifyContent: "center",
  },
  box: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 80,
  },
  boxFocused: {
    borderColor: "rgba(255,255,255,1)",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  label: {
    position: "absolute",
    left: 20,
    top: 12,
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  input: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    minHeight: 60,
    paddingTop: 0,
  },
});
