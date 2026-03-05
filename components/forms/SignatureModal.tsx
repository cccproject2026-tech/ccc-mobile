import { useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    useWindowDimensions,
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

interface Props {
    visible: boolean;
    onSave: (signature: string) => void;
    onClose: () => void;
}

const webStyle = `
  .m-signature-pad--footer { display: none; margin: 0px; }
  .m-signature-pad { box-shadow: none; border: none; }
  body, html { background-color: transparent; }
`;

type SignatureRef = { readSignature: () => void; clearSignature: () => void } | null;

export function SignatureModal({ visible, onSave, onClose }: Props) {
    const signatureRef = useRef<SignatureRef>(null);
    const [saveRequested, setSaveRequested] = useState(false);
    const { width, height } = useWindowDimensions();

    const handleOK = (signature: string) => {
        if (saveRequested) {
            setSaveRequested(false);
            onSave(signature);
            onClose();
        }
    };

    const handleSave = () => {
        setSaveRequested(true);
        signatureRef.current?.readSignature();
    };

    const handleClear = () => {
        signatureRef.current?.clearSignature();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Sign Here</Text>

                <View style={styles.canvasWrapper}>
                    <SignatureCanvas
                        ref={ref => {
                            signatureRef.current = ref as SignatureRef;
                        }}
                        onOK={handleOK}
                        webStyle={webStyle}
                        autoClear={false}
                        backgroundColor="#ffffff"
                        penColor="#000000"
                        imageType="image/png"
                        style={[styles.canvas, { width: width - 32, height: height * 0.3 }]}
                    />
                </View>

                <View style={styles.buttons}>
                    <Pressable style={styles.button} onPress={handleClear}>
                        <Text style={styles.buttonText}>Clear</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
                        <Text style={styles.buttonTextSecondary}>Cancel</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.buttonPrimary]} onPress={handleSave}>
                        <Text style={styles.buttonTextPrimary}>Save</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
        marginBottom: 24,
    },
    canvasWrapper: {
        flex: 1,
        minHeight: 220,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
        marginBottom: 24,
    },
    canvas: {
        flex: 1,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
    },
    buttonSecondary: {
        borderColor: "rgba(255,255,255,0.5)",
    },
    buttonPrimary: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
    },
    buttonText: {
        color: "#111827",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonTextSecondary: {
        color: "#4b5563",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonTextPrimary: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
