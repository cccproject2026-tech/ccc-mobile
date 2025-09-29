import React from "react";
import { Text, View } from "react-native";

import { OtpInput } from "react-native-otp-entry";

interface props {
    digits?: number | undefined;
    focusColor?: string | undefined;
    type: "numeric" | "alphanumeric";
    onTextValue: (text: string) => void;
    onFilledValue: (text: string) => void;
    label?: string | undefined;
    wrapperClass?: string | undefined;
}

export default function OtpInputBox({
    digits = 4,
    focusColor = "#ffffff",
    type = "numeric",
    onTextValue,
    onFilledValue,
    label = "",
    wrapperClass = ``
}: props) {
    return (
        <View className={`flex flex-1 gap-6 ${wrapperClass}`}>
            <Text className="font-medium text-[15px] leading-[22px] text-white text-center">
                {label}
            </Text>
            <OtpInput
                numberOfDigits={digits}
                focusColor={focusColor}
                type={type}
                autoFocus={true}
                blurOnFilled={true}
                onTextChange={(text) => onTextValue(text)}
                onFilled={(text) => onFilledValue(text)}
                theme={{
                    containerStyle: {
                        display: "flex",
                        gap: 9,
                        justifyContent: "center",
                    },
                    pinCodeContainerStyle: {
                        width: 44,
                        height: 35,
                        backgroundColor: "transparent",
                        borderRadius: 8,
                        borderColor: "#ffffff"
                    },
                    pinCodeTextStyle: {
                        color: "#fff",
                        fontSize: 24,
                        textAlign: 'center',
                        fontWeight: "400",
                        letterSpacing: 5,
                    },
                    focusStickStyle: {
                        width: 2,
                    }
                }}
            />
        </View>
    )
}