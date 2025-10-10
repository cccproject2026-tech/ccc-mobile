import React from "react"

import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView, ScrollView } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

import { Colors } from "@/constants/Colors"
import { PastorNavigationHeader } from "../pastor/Header"

interface ScreenLayoutProps {
    children: React.ReactNode;
    navigationTagName?: string | undefined;
    showDrawer?: boolean | undefined;
    showNotificationIcon?: boolean | undefined;
    showNameTag?: boolean | undefined;
}

const ScreenLayout = ({
    children,
    navigationTagName = "",
    showDrawer = true,
    showNotificationIcon = true,
    showNameTag = false
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
                >
                    <PastorNavigationHeader
                        showNameTag={showNameTag}
                        showDrawer={showDrawer}
                        showNotificationIcon={showNotificationIcon}
                        tagName={navigationTagName}
                        wrapperClass="mt-4"
                    />
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 26,
                            paddingHorizontal: 25,
                        }}
                    >
                        {children}
                    </ScrollView>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default ScreenLayout