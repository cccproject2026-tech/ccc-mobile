import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function InputField({
  label = "label",
  keyboardType = "default",
}: {
  label?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
}) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.box, focused && styles.boxFocused]}>
        {!focused && !value && <Text style={styles.label}>{label}</Text>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={keyboardType} // 👈 now controlled by props
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  box: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 20,
    justifyContent: "center",
    maxHeight: 34,
  },
  boxFocused: {
    borderColor: "rgba(255,255,255,1)",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  label: {
    position: "absolute",
    left: 20,
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
  input: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    height: "100%",
    paddingTop: 0,
  },
});
