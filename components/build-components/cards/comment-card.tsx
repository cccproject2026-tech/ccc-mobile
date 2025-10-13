import { icons } from "@/constants/images";
import { Image, Text, TouchableOpacity, View, ViewStyle } from "react-native";

export default function CommentCard({ comment, wrapperStyle = {} }: { comment: any, wrapperStyle?: ViewStyle | undefined; }) {
  return (
    <View className={`bg-[#1A4882] rounded-[10px] px-4 py-2.5 mb-4 border border-white/80 relative`} style={[wrapperStyle]}>
      {comment.isHighlighted && (
        <View className="w-3 h-3 rounded-full bg-[#E9E010] absolute top-4 right-4" />
      )}
      <View className="flex-row items-center">
        <Image
          source={comment.avatar}
          className="!w-12 !h-12 rounded-full mr-4"
        />
        <View className="flex-1 pr-5">
          <Text className="text-white/80 text-base font-medium mb-2">
            {comment.user}
          </Text>
          <Text className="text-white text-base leading-5 mb-4">
            {comment.message}
          </Text>

          <View className="flex-row gap-4">
            <TouchableOpacity>
              <Image source={icons.phone} className="w-5 h-5 tint-white/80" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={icons.message} className="w-5 h-5 tint-white/80" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={icons.mail} className="w-5 h-5 tint-white/80" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={icons.whatsapp}
                className="w-5 h-5 tint-white/80"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Text className="text-white/70 text-xs font-normal absolute bottom-4 right-4">
        {comment.timestamp}
      </Text>
    </View>
  );
}
