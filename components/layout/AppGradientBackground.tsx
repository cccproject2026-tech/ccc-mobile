import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

const GradientDepthContext = React.createContext(false);

export default function AppGradientBackground({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const isNested = React.useContext(GradientDepthContext);
  if (isNested) {
    // Avoid nested full-screen gradients; keep layout the same.
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }
  return (
    <GradientDepthContext.Provider value={true}>
      <LinearGradient colors={[...Colors.appBgGradient]} style={[{ flex: 1 }, style]}>
        {children}
      </LinearGradient>
    </GradientDepthContext.Provider>
  );
}


