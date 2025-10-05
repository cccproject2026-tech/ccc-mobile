import { icons } from "@/constants/images";
import { Image, Text, View } from "react-native";

export default function Head({
    showTitle = true
}: {
    showTitle?: boolean | undefined
}) {
    return (
        <View className={"flex flex-1 gap-8 w-full justify-center items-center px-5 mt-[15px]"}>
            {showTitle && (
                <Text className="font-bold leading-[22px] text-white" style={{
                    fontSize: 26,
                    textTransform: "uppercase",
                    fontFamily: "AlbertBold"
                }}>
                    Welcome !
                </Text>
            )}
            <View className="flex gap-[18px] w-full justify-center items-center">
                {showTitle && (
                    <Text className="font-medium leading-[22px] text-center" style={{
                        fontSize: 16,
                        color: "#E9E010",
                        fontFamily: "AlbertBold"
                    }}>
                        You are now enrolled in the CCC mentoring program at Andrews University Seminary
                    </Text>
                )}
                <Image className="w-auto mt-auto" source={icons.communityImage} />
            </View>
        </View>
    )
}