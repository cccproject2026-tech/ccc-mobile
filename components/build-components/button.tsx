import React from "react";
import { Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

import { Colors, primary_color } from "@/constants/Colors";
import { convertColor } from "@/utils/functions";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
    children: React.ReactNode;
    variant?: ButtonVariant;
    bgColor?: string | undefined;
    textColor?: string | undefined;
    buttonClass?: string | undefined;
    labelClass?: string | undefined;
    buttonStyle?: ViewStyle | undefined;
    labelStyle?: TextStyle | undefined;
    wrapperClass?: string | undefined;
    onPress?: () => void;
    disabled?: boolean;
}

const Button = ({
    children,
    variant = "primary",
    bgColor,
    textColor,
    buttonClass = ``,
    labelClass = ``,
    wrapperClass = ``,
    buttonStyle = {},
    labelStyle = {},
    onPress,
    disabled = false
}: ButtonProps) => {

    const BORDER_COLOR = convertColor("#FFFFFF", 0.6)

    const getVariantStyles = () => {
        const variants = {
            primary: {
                bgColor: bgColor || primary_color,
                textColor: textColor || "#FFFFFF",
                border: convertColor("#FFFFFF", 0.6),
                borderWidth: 1,
            },
            secondary: {
                bgColor: bgColor || "#FFFFFF",
                textColor: textColor || Colors.blueShade,
                border: convertColor("#FFFFFF", 0.6),
                borderWidth: 1,
            },
        };

        return variants[variant];
    };

    const variantStyles = getVariantStyles();


    return (
        <View className={`${wrapperClass}`}>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                className={`w-full h-10 shadow-button rounded-[10px] flex justify-center items-center ${buttonClass}`}
                style={[{
                    backgroundColor: variantStyles.bgColor,
                    borderWidth: variantStyles.borderWidth,
                    borderColor: BORDER_COLOR,
                    borderStyle: "solid",
                    opacity: disabled ? 0.5 : 1
                }, buttonStyle]}
                activeOpacity={0.7}
            >
                <Text
                    className={`${labelClass}`}
                    style={[{
                        color: variantStyles.textColor,
                        // fontFamily: "AlbertBold",
                        fontWeight: 500,
                        fontSize: 15,
                        lineHeight: 22,
                    }, labelStyle]}
                >
                    {children}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default Button