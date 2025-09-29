import React from "react"
import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native"
import { SurveyButton } from "./buttons"

interface RoadMapOutcomeModalProps {
  isMenuVisible: boolean
  closeMenu: () => void
}

export const SurveyModal = ({
  isMenuVisible,
  closeMenu,
}: RoadMapOutcomeModalProps) => {

  return (
    <Modal
      visible={isMenuVisible}
      transparent={true}
      onRequestClose={closeMenu}
    >
      <TouchableWithoutFeedback onPress={closeMenu}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={{
                width: "90%",
                height: 245,
                borderRadius: 14,
                elevation: 5,
              }}
              className="bg-white justify-center items-center h-full p-5 gap-5"
            >
              <Text className="text-center font-medium text-base leading-[28px] text-[#176192]">
                On completion of the PMP and CMA assessment tools please schedule a meeting with your mentor.
              </Text>
              <SurveyButton
                title={"Schedule Meeting"}
                onPress={() => { }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
})
