import React from "react";
import { View, ViewStyle } from "react-native";

const Separator = ({
    separatorClass = ``,
    separatorStyle = {}
}: {
    separatorClass?: string | undefined;
    separatorStyle?: ViewStyle | undefined;
}) => {
    return (
        <View className={`my-7 max-w-[95%] mx-4 ${separatorClass}`} style={[{
            height: 2,
            backgroundColor: "rgba(255, 255, 255, 0.2)"
        }, separatorStyle]} />
    )
}

export default Separator;