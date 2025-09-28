import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDrawerStore } from "../atom/DrawerStore";
import { Button } from "../atom/buttons";

interface HeaderProps {
  color?: string;
  size?: number;
  showDrawer?: boolean;
  showNotificationIcon?: boolean;
  wrapperClass?: string;
  showNameTag?: boolean;
  showBackButton?: boolean;
}

const image = require("@/assets/logos/CCClogo.png");

export const PastorNavigationHeader: React.FC<HeaderProps> = ({
  color = "#ffffff",
  size = 36,
  showDrawer = true,
  showNotificationIcon = true,
  wrapperClass = ``,
  showNameTag = false,
  showBackButton = false,
}) => {
  const { toggleDrawer } = useDrawerStore();

  return (
    <View
      className={`flex-row items-center justify-between px-8 ${wrapperClass}`}
    >
      {showDrawer ? (
        <TouchableOpacity onPress={toggleDrawer} className="">
          {<Ionicons name="menu" size={size} color={color} />}
        </TouchableOpacity>
      ) : showBackButton ? (
        <Button
          title={"Back"}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderWidth: 0,
            paddingHorizontal: 12,
          }}
          icon={icons.forward}
          iconStyles={{ transform: [{ scaleX: -1 }] }}
          textStyle={{ color: "white", fontWeight: 600 }}
          onPress={() => router.back()}
          type={"custom"}
        />
      ) : (
        <></>
      )}
      {showNameTag && (
        <LinearGradient
          colors={["#7C3AED", "#38BDF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.text}>John Ross</Text>
          </View>
        </LinearGradient>
      )}
      <View className="flex-row gap-4 items-center">
        {showNotificationIcon && (
          <TouchableOpacity
            onPress={() => router.push("/(pastor-tabs)/notifications")}
            className=""
          >
            <Ionicons name="notifications-outline" size={24} color={color} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={toggleDrawer}>
          <Image
            source={image}
            style={{ width: 25, height: 25 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    padding: 2, // thickness of the gradient border
    borderRadius: 12,
  },
  innerContainer: {
    backgroundColor: Colors.lightBlueGradientOne,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#E2E8F0", // light text color
    fontSize: 18,
    fontWeight: "500",
  },
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
});
