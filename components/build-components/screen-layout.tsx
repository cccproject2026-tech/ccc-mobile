import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { PastorNavigationHeader } from "../pastor/Header";

interface ScreenLayoutProps {
  children: React.ReactNode;
  navigationTagName?: string;
  showDrawer?: boolean;
  showNotificationIcon?: boolean;
  showNameTag?: boolean;
  enableScrollView?: boolean;
  enablePastorHeader?: boolean;
}

const ScreenLayout = ({
  children,
  navigationTagName = "",
  showDrawer = true,
  showNotificationIcon = true,
  showNameTag = false,
  enableScrollView = true,
  enablePastorHeader = true,
}: ScreenLayoutProps) => {
  return (
    <LinearGradient
      colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={100}
          keyboardOpeningTime={0}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 150,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {enablePastorHeader && (
            <PastorNavigationHeader
              showNameTag={showNameTag}
              showDrawer={showDrawer}
              showNotificationIcon={showNotificationIcon}
              tagName={navigationTagName}
              wrapperClass="mt-4"
            />
          )}

          {enableScrollView ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: 26,
                paddingHorizontal: 16,
              }}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 26 }}>
              {children}
            </View>
          )}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ScreenLayout;
