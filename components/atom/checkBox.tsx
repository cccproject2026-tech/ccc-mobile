import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CheckBoxProps {
  type: "circle" | "square";
  value: boolean;
  setValue: (value: boolean) => void;
}

const CheckBox: React.FC<CheckBoxProps> = ({ type, value, setValue }) => {
  return (
    <View>
      <TouchableOpacity
        style={{
          width: 14,
          height: 14,
          borderRadius: type === "circle" ? 99999 : 4,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: value ? "red" : "white",
        }}
        onPress={() => setValue(!value)}
      >
        {value ? (
          // <RemixIcon name="check-fill" color="#FFFFFFFF"></RemixIcon>
          <></>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

export default CheckBox;

const styles = StyleSheet.create({});
