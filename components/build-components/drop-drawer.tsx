import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated } from "react-native";

import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
    ViewStyle,
} from "react-native";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface DrawerItem {
  label: string;
  value: string;
}

interface CustomDrawerDropdownProps {
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
  items?: DrawerItem[];
  placeholder?: string;
  containerStyle?: ViewStyle;
}

const CustomDrawerDropdown: React.FC<CustomDrawerDropdownProps> = ({
  selectedValues,
  setSelectedValues,
  items = [
    {
      label:
        "I would like to find out more about the Center for Community Change",
      value: "option1",
    },
    {
      label: "I am interested in receiving mentoring in community engagement",
      value: "option2",
    },
    { label: "I would like to talk to one of the mentors", value: "option3" },
    {
      label:
        "I am a conference administrator and would like to find out more about partnering with the center",
      value: "option4",
    },
  ],
  placeholder = "Interests",
  containerStyle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleItem = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const toggleExpanded = () => {
    const finalValue = isExpanded ? 0 : 1; 
    Animated.timing(animation, {
      toValue: finalValue,
      duration: 300,
      useNativeDriver: false, 
    }).start();
    setIsExpanded(!isExpanded);
  };

  const isSelected = (value: string) => selectedValues.includes(value);
  const contentHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, items.length * 74], 
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>{placeholder}</Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Expandable Content */}
      {isExpanded && (
        <Animated.View
          style={[styles.contentContainer, { height: contentHeight }]}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.itemContainer,
                index === items.length - 1 && styles.lastItem,
              ]}
              onPress={() => toggleItem(item.value)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  isSelected(item.value) && styles.checkboxSelected,
                ]}
              >
                {isSelected(item.value) && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </View>
              <Text style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  contentContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "transparent",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent:"center",
    alignContent:"center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 3,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "white",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight:"500",
    color: "white",
    lineHeight: 22,
  },
});

export default CustomDrawerDropdown;
