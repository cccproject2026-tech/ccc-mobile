import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { PastorNavigationHeader } from "../pastor/Header";
import Header from "./header";

interface ScreenLayoutProps {
  children: React.ReactNode;
  showDrawer?: boolean;
  showNotificationIcon?: boolean;
  showNameTag?: boolean;
  tagName?: string;
  enableScrollView?: boolean;
  enablePastorHeader?: boolean;
  paddingX?: number;
  enableHeader?: boolean;
  showSettings?: boolean;
  headerTitle?: string;
  headerSubTitle?: string;
  hideSearchBar?: boolean;
  route?: string;
}

const ScreenLayout = ({
  children,
  showDrawer = true,
  showNotificationIcon = true,
  showNameTag = false,
  tagName = "John Ross",
  enableScrollView = true,
  enablePastorHeader = true,
  paddingX = 16,
  enableHeader = false,
  showSettings = false,
  headerTitle = ``,
  headerSubTitle = ``,
  hideSearchBar = false,
  route = '(mentor)/(tabs)/notifications',
}: ScreenLayoutProps) => {
  return (
    <LinearGradient
      colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: enableScrollView ? 26 : 150,
              paddingHorizontal: paddingX,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {enablePastorHeader && (
              <PastorNavigationHeader
                showNameTag={showNameTag}
                showDrawer={showDrawer}
                showNotificationIcon={showNotificationIcon}
                tagName={tagName}
                wrapperClass="mt-4"
                route={route}
              />
            )}
            {enableHeader && (
              <Header
                title={headerTitle}
                subTitle={headerSubTitle}
                hideSearchBar={hideSearchBar}
                showSettings={showSettings}
              />
            )}
            <View style={{ flex: 1, paddingBottom: 26 }}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ScreenLayout;
