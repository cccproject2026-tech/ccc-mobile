import { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

interface Props {
    fieldName: string;
    placeholderText?: string;
    required?: boolean;
    clearButtonLabel?: string;
    value: string | null;
    onChange: (value: string | null) => void;
    error?: string;
}

export function DigitalSignatureInput({
    fieldName,
    placeholderText,
    required,
    clearButtonLabel = "Clear",
    value,
    onChange,
    error,
}: Props) {
    const signatureRef = useRef<SignatureCanvas | null>(null);
    const [hasSigned, setHasSigned] = useState<boolean>(!!value);

    const handleOK = (signature: string) => {
        setHasSigned(true);
        onChange(signature);
    };

    const handleClear = () => {
        signatureRef.current?.clearSignature();
        setHasSigned(false);
        onChange(null);
    };

    const webStyle = `
      .m-signature-pad--footer { display: none; margin: 0px; }
      .m-signature-pad { box-shadow: none; border: none; }
      body, html { background-color: transparent; }
    `;

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>{fieldName}</Text>
                {required && <Text style={styles.required}>*</Text>}
            </View>

            <View style={styles.canvasContainer}>
                {!hasSigned && !!placeholderText && (
                    <Text style={styles.placeholder}>{placeholderText}</Text>
                )}
                <SignatureCanvas
                    ref={ref => {
                        // @ts-expect-error - ref type from library
                        signatureRef.current = ref;
                    }}
                    onOK={handleOK}
                    webStyle={webStyle}
                    autoClear={false}
                    backgroundColor="transparent"
                    clearText={clearButtonLabel}
                    descriptionText=""
                />
            </View>

            <View style={styles.actionsRow}>
                <Pressable onPress={handleClear} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>{clearButtonLabel}</Text>
                </Pressable>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    required: {
        color: "#f97373",
        marginLeft: 4,
        fontSize: 16,
    },
    canvasContainer: {
        height: 200,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
        backgroundColor: "rgba(15,23,42,0.9)",
        justifyContent: "center",
    },
    placeholder: {
        position: "absolute",
        top: 12,
        left: 12,
        right: 12,
        color: "#9cc2ff",
        fontSize: 14,
        zIndex: 1,
    },
    actionsRow: {
        marginTop: 8,
        alignItems: "flex-end",
    },
    clearButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
    },
    clearButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "500",
    },
    errorText: {
        marginTop: 6,
        color: "#fecaca",
        fontSize: 13,
    },
});

