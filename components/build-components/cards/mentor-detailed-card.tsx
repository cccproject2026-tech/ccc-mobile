import { icons } from "@/constants/images";
import { Mentee } from "@/types/mentee.types";
import { Router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function MentorDetailedCard({
  data,
  key,
  navigation,
  onMenuPress,
}: {
  data: Mentee;
  key: string;
  navigation: Router;
  onMenuPress: () => void;
}) {
  return (
    <View className="bg-[#1A4882] rounded-[10px] border border-white/80 p-4 relative">
      <View className="absolute top-4 right-4 z-10">
        <TouchableOpacity onPress={onMenuPress}>
          <Image source={icons.menuVertical} className="w-6 h-6" />
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        <View className="mr-4 w-[35%]">
          <Image
            source={icons.dummyUser}
            className="w-[90%] h-[95px] rounded-[10px]"
          />
          <View className="flex-row mt-4 gap-[13px] w-[90%] justify-between">
            <Image
              source={icons.phone}
              className="flex-1 w-6 h-6"
              resizeMode="contain"
            />
            <Image
              source={icons.message}
              className="flex-1 w-6 h-6"
              resizeMode="contain"
            />
            <Image
              source={icons.mail}
              className="flex-1 w-6 h-6"
              resizeMode="contain"
            />
            <Image
              source={icons.whatsapp}
              className="flex-1 w-6 h-6"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="flex-1 pr-5">
          <Text className="text-white text-base font-medium mb-1">
            {data.firstName + " " + data.lastName}
          </Text>
          <Text className="text-white text-base font-medium mb-2">
            {data?.role}
          </Text>
          <Text className="text-white/70 text-sm font-normal leading-5">
            {data?.description}
          </Text>
        </View>
      </View>
    </View>
  );
}
