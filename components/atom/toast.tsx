import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BaseToastProps } from "react-native-toast-message";


export const FloatingToast = ({ text1, text2, props }: BaseToastProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{text1}</Text>
                    {text2 ? <Text style={styles.subtitle}>{text2}</Text> : null}
                </View>

                {props?.actionLabel && (
                    <TouchableOpacity onPress={props?.onPress}>
                        <Text style={styles.action}>{props.actionLabel}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "92%",
        borderRadius: 24,
        backgroundColor: "#fff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#ccc",
        paddingVertical: 16,
        paddingHorizontal: 18,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 8,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        color: "#000",
        fontSize: 15,
        fontWeight: "600",
    },
    subtitle: {
        color: "gray",
        marginTop: 2,
        fontSize: 13,
    },
    action: {
        color: "#C084FC",
        fontWeight: "600",
        marginLeft: 12,
    },
});
