import { Text, View } from "react-native";

export default function Head({
    showTitle = true
}: {
    showTitle?: boolean | undefined
}) {
    return (
        <View className={"flex flex-1 gap-8 w-full justify-center items-center px-5"}>
            {showTitle && (
                <Text className="font-bold leading-[22px] text-white" style={{
                    fontSize: 26,
                    textTransform: "uppercase"
                }}>
                    Welcome !
                </Text>
            )}
            <View className="flex gap-[18px] w-full">
                {showTitle && (
                    <Text className="font-medium leading-[22px] text-center" style={{
                        fontSize: 16,
                        color: "#E9E010"
                    }}>
                        You are now enrolled in the CCC mentoring program at Andrews University Seminary
                    </Text>
                )}
                {/* <Image
                    source={icons.login}
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                /> */}
            </View>
        </View>
    )
}