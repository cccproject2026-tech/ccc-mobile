import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import { Image, StyleSheet, TouchableOpacity, View } from "react-native"
import { useDrawerStore } from "../atom/DrawerStore"

interface HeaderProps {
  color?: string
  size?: number
}

const image = require("@/assets/logos/CCClogo.png")

export const PastorNavigationHeader: React.FC<HeaderProps> = ({
  color = "#ffffff",
  size = 30,
}) => {
  const { toggleDrawer } = useDrawerStore()

  return (
      <View className="flex-row items-center justify-between px-8">
        <TouchableOpacity onPress={toggleDrawer} className="">
          <Ionicons name="menu" size={size} color={color} />
        </TouchableOpacity>
        <View className="flex-row gap-4 items-center">
            <TouchableOpacity onPress={() => router.push("/(pastor-tabs)/notifications")} className="">
                <Ionicons name="notifications-outline" size={24} color={color} />
            </TouchableOpacity>
          <TouchableOpacity onPress={toggleDrawer}>
            <Image
              source={image}
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  // container: {
  //   // position: "absolute",
  //   top: 30, // Adjust based on your status bar height
  //   zIndex: 1000,
  //   width: "100%",
  //   paddingHorizontal: 16,
  // },
  // hamburgerButton: {
  //   padding: 8,
  //   // backgroundColor: 'rgba(0, 0, 0, 0.1)',
  //   borderRadius: 8,
  // },
})
