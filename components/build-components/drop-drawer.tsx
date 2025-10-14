import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from "react-native";

// Enable layout animation for Android
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
  useCircleIndicator?: boolean;
  editable?: boolean;
}

const defaultItems = [
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
];

const CustomDrawerDropdown: React.FC<CustomDrawerDropdownProps> = ({
  selectedValues,
  setSelectedValues,
  items = defaultItems,
  useCircleIndicator = false,
  placeholder = "Interests",
  containerStyle,
  editable = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeightValue, setContentHeightValue] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleItem = (value: string) => {
    if (!editable) return;
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
    // Close dropdown after selection
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    if (!editable) return;
    const finalValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue: finalValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const isSelected = (value: string) => selectedValues.includes(value);

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeightValue || 0],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Text style={styles.headerText}>
          {selectedValues.length > 0 ? selectedValues.join(", ") : placeholder}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color="white"
        />
      </TouchableOpacity>

      {/* Animated Dropdown Content */}
      <Animated.View
        style={[styles.contentContainer, { height: animatedHeight }]}
      >
        <View
          style={styles.hiddenMeasureContainer}
          onLayout={(e) => setContentHeightValue(e.nativeEvent.layout.height)}
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
              {/* Indicator circle or checkbox in hidden measure container */}
              <View
                style={[
                  useCircleIndicator ? styles.circleIndicator : styles.checkbox,
                  isSelected(item.value) &&
                    (useCircleIndicator
                      ? styles.circleSelected
                      : styles.checkboxSelected),
                ]}
              >
                {isSelected(item.value) &&
                  (useCircleIndicator ? (
                    <Ionicons name="radio-button-on" size={14} color="white" />
                  ) : (
                    <Ionicons name="checkmark" size={14} color="white" />
                  ))}
              </View>

              <Text style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Visible content */}
        <View style={styles.visibleContent}>
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
              {/* Indicator circle or checkbox */}
              <View
                style={[
                  useCircleIndicator ? styles.circleIndicator : styles.checkbox,
                  isSelected(item.value) &&
                    (useCircleIndicator
                      ? styles.circleSelected
                      : styles.checkboxSelected),
                ]}
              >
                {isSelected(item.value) &&
                  (useCircleIndicator ? (
                    // <Ionicons name="radio-button-on" size={14} color="white" />
                    <></>
                  ) : (
                    <Ionicons name="checkmark" size={14} color="white" />
                  ))}
              </View>
              <Text style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
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
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  contentContainer: {
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.8)",
  },
  hiddenMeasureContainer: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
  visibleContent: {
    backgroundColor: "transparent",
  },
  itemContainer: {
    flexDirection: "row",
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
  circleIndicator: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "white",
    borderRadius: 9,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "white",
  },
  circleSelected: {
    backgroundColor: "transparent",
    borderColor: "white",
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    lineHeight: 22,
  },
});

export default CustomDrawerDropdown;
