import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import RNPickerSelect from "react-native-picker-select";

interface DropdownItem {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  items?: DropdownItem[];
  placeholder?: string;
  containerStyle?: ViewStyle;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  selectedValue,
  setSelectedValue,
  items = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ],
  placeholder = "Preferred Meeting Option",
  containerStyle,
}) => {
  return (
    <View style={[containerStyle]}>
      <RNPickerSelect
        onValueChange={(value: string | null) => setSelectedValue(value)}
        items={items}
        placeholder={{ label: placeholder, value: null, color: "white" }}
        style={pickerSelectStyles}
        value={selectedValue}
        Icon={() => {
          return <Ionicons name="chevron-down" size={24} color="white" />;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   padding: 0,
  //   borderWidth: 1,
  //   borderColor: "white",
  //   borderRadius: 10,
  // },
});

interface PickerSelectStyles {
  inputIOS: TextStyle;
  inputAndroid: TextStyle;
  iconContainer: ViewStyle;
}

const pickerSelectStyles: PickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 16,
    maxHeight: 34,
    height: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    color: "white",
    backgroundColor: "transparent",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    maxHeight: 34,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    color: "white",
    backgroundColor: "transparent",
  },
  iconContainer: {
    top: 6,
    right: 10,
  },
};

export default CustomDropdown;
