import React from "react"
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

interface TabProps {
  data: { tab: string }
  tabs: string
  setTabs: (tab: string) => void
  onPress: () => void
}

export const Tab = ({ data, tabs, setTabs, onPress }: TabProps) => {
  const isActive = tabs === data.tab

  return (
    <TouchableOpacity
      style={[
        styles.tabContainer,
        isActive && styles.activeTabContainer
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.tabText,
          isActive && styles.activeTabText
        ]}
      >
        {data.tab}
      </Text>
      {data.tab === "Due" && (
        <View style={styles.badge} className="rounded-full">
          <Text style={styles.badgeText}>1</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    flexDirection: "row",
    gap: 8,
    minWidth: 80,
    height: 32,
    position: "relative",
  },
  activeTabContainer: {
    backgroundColor: "white",
  },
  tabText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1A4882",
  },
  badge: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: -8,
    width: 15,
    height: 15,
    borderRadius: 10,
  },
  badgeText: {
    color: "#1A4882",
    fontSize: 11,
    fontWeight: "600",
  },
})