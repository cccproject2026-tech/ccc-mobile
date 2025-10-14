import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";

interface ContactInfoCardProps {
  phone: string;
  email: string;
  phoneIcon: ImageSourcePropType;
  messageIcon: ImageSourcePropType;
  forwardIcon?: ImageSourcePropType;
  flag?: boolean;
}

export default function ContactInfoCard({
  phone,
  email,
  phoneIcon,
  messageIcon,
  forwardIcon,
  flag = false,
}: ContactInfoCardProps) {
  return (
    <View className="flex-row gap-4 items-center w-full">
      <View
        className={`py-2 px-3 flex gap-1 border border-white rounded-[10px] ${
          flag ? "ml-2" : "mx-auto w-full"
        } mt-6 bg-white/20`}
      >
        <Text className="text-base font-medium leading-[22px] text-white">
          Contact Information
        </Text>
        <View className="flex-row items-center">
          <Image source={phoneIcon} className="w-[17px] h-[17px]" />
          <Text className="text-white text-[14px] leading-[22px] font-medium">
            {" "}
            : {phone}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Image source={messageIcon} className="w-[17px] h-[17px]" />
          <Text className="text-white text-[14px] leading-[22px] font-medium">
            {" "}
            : {email}
          </Text>
        </View>
      </View>
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={["#5B4FB5", "#2B7AB5", "#3BADC5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="justify-center items-center"
        >
          {flag && forwardIcon && (
            <View className="flex-row items-center py-[7px] px-10 shadow-2xl">
              <Image
                source={forwardIcon}
                style={[
                  {
                    width: 15,
                    height: 15,
                    transform: [{ scaleX: -1 }],
                  },
                ]}
              />
              <Text className="text-base py-1 leading-[22px] text-white font-medium">
                Status
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
}
