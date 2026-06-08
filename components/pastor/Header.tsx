import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../atom/buttons";

/** Open the nearest drawer ancestor (stack → tabs → drawer). Zustand toggle does not move the RN drawer. */
function openDrawerFromNestedScreen(navigation: ReturnType<typeof useNavigation>) {
  let nav: ReturnType<typeof useNavigation> | undefined = navigation;
  for (let i = 0; i < 8 && nav; i += 1) {
    const state = nav.getState?.() as { type?: string } | undefined;
    if (state?.type === "drawer") {
      nav.dispatch(DrawerActions.openDrawer());
      return;
    }
    nav = nav.getParent?.();
  }
  navigation.dispatch(DrawerActions.openDrawer());
}

interface HeaderProps {
  color?: string;
  size?: number;
  showDrawer?: boolean;
  showNotificationIcon?: boolean;
  wrapperClass?: string;
  showNameTag?: boolean;
  showBackButton?: boolean;
  tagName?: string;
  route?:string
}

const image = require("@/assets/logos/CCClogo.png");

export const PastorNavigationHeader: React.FC<HeaderProps> = ({
  color = "#ffffff",
  size = 36,
  showDrawer = true,
  showNotificationIcon = true,
  wrapperClass = ``,
  showNameTag = false,
  tagName = `John Ross`,
  showBackButton = false,
  route ='/(pastor-tabs)/notifications'
}) => {
  const navigation = useNavigation();
  const handleOpenDrawer = () => openDrawerFromNestedScreen(navigation);

   const handlePress = () => {
    router.push(route as any);
  };

  return (
    <View
      className={`flex-row items-center justify-between px-4 ${wrapperClass}`}
      style={{ paddingTop: 10, paddingHorizontal: 16, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
    >
      {showDrawer ? (
        <TouchableOpacity onPress={handleOpenDrawer}>
          <Ionicons name="menu" size={size} color={color} />
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
        <View className="h-10 w-10"></View>
      )}
      {showNameTag && (
        <LinearGradient
          colors={["#7C3AED", "#38BDF8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.text}>{tagName}</Text>
          </View>
        </LinearGradient>
      )}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {showNotificationIcon && (
          <TouchableOpacity
            onPress={() => handlePress()}
            className=""
          >
            <Ionicons name="notifications-outline" size={24} color={color} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleOpenDrawer}>
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
    padding: 2,
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
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "500",
  },
  
  
  
  
  
  
  
  
  
  
  
  
});
