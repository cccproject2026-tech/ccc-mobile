"use client";

import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TextInput, View } from "react-native";

export default function InputField({
  label = "label",
  keyboardType = "default",
  boxClass = "",
  labelTop = 24,
  editable = true,
  value,
  onChangeText,
}: {
  label?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  boxClass?: string;
  labelTop?: number;
  editable?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const labelPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: focused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused, value]);

  const labelStyle = {
    transform: [
      {
        translateY: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -`${labelTop}`],
        }),
      },
      {
        scale: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.box, focused && styles.boxFocused]}
        className={boxClass}
      >
        <Animated.View style={[styles.labelContainer, labelStyle]}>
          <Animated.Text style={styles.label}>{label}</Animated.Text>
        </Animated.View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          keyboardType={keyboardType}
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      {/* {editable ? (
      <View style={[styles.editFieldContainer, styles.halfInput]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.editInput}
          value={value}
          editable={editable}
          onChangeText={(text) => onChangeText?.(text)}
          placeholder={label}
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      ) : (
        <View>
          
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.viewFieldText}>{value}</Text>
        </View>
      </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  viewFieldText: {
    color: '#fff',
    fontSize: 13,
},
  editFieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 13,
  },
  box: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 15,
    justifyContent: "center",
    maxHeight: 34,
    width: "100%"
  },
  boxFocused: {
    borderColor: "rgba(255,255,255,1)",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  labelContainer: {
    position: "absolute",
    left: 3,
    backgroundColor: "transparent",
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  input: {
    marginTop: 10,
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    height: "100%",
    paddingTop: 0,
  },
});
