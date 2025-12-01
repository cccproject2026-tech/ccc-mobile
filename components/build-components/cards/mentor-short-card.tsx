import { icons } from "@/constants/images";
import { Mentee } from "@/types/mentee.types";
import { Router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function MentorShortCard({
  data,
  dataKey,
  navigation,
  onMenuPress,
}: {
  data: Mentee;
  dataKey: string;
  navigation: Router;
  onMenuPress: () => void;
}) {
  return (
    <View className="bg-[#1A4882] rounded-[10px] border border-white/80 p-[10px] flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Image source={icons.dummyUser} className="w-10 h-10 rounded-lg" />
        <Text className="ml-8 font-medium text-white text-base">
          {data.firstName + " " + data.lastName}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Image source={icons.phone} className="w-6 h-6" />
        <Image source={icons.message} className="w-6 h-6" />
        <Image source={icons.mail} className="w-6 h-6" />
        <Image source={icons.whatsapp} className="w-6 h-6" />
        <TouchableOpacity onPress={onMenuPress}>
          <Image source={icons.menuVertical} className="w-6 h-6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
