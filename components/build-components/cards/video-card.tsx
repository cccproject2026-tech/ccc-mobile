import { Image, Text, TouchableOpacity, View } from "react-native";

export default function VideoCard({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) {
  return (
    <TouchableOpacity className="w-full bg-transparent rounded-[10px] py-2 px-2 my-2.5 border border-white/80 max-w-[95%] mx-auto">
      <View className="w-full flex-row items-start gap-2">
        {/* Thumbnail */}
        <View className="w-[130px]">
          <Image
            source={data?.image}
            className="w-[130px] h-[90px] rounded-xl"
            resizeMode="cover"
          />
        </View>

        {/* Text Content */}
        <View className="flex-1">
          <View className="w-full flex-row items-center">
            <Text
              className="text-[14px] leading-[22px] font-medium text-white/70"
              ellipsizeMode="tail"
            >
              introduction
            </Text>
            <View className="w-1.5 h-1.5 rounded-full bg-white mx-2" />
            <Text className="text-[14px] leading-[22px] font-medium text-white/70">
              11 min
            </Text>
          </View>

          <Text
            className="text-white text-[18px] leading-[22px] font-semibold mt-1"
            ellipsizeMode="tail"
            numberOfLines={2}
          >
            {data?.title}
          </Text>

          <Text
            className="py-2 text-[#F4F2F2B5] text-sm font-normal"
            numberOfLines={0}
          >
            {data?.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
