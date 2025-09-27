import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native"

interface RoadMapOutcomeModalProps {
  isMenuVisible: boolean
  closeMenu: () => void
  onPressForFirstOption?: () => void
  onPressForSecondOption?: () => void
  onPressForThirdOption?: () => void
  onPressForFourthOption?: () => void
  firstOptionLabel?: string
  secondOptionLabel?: string
  thirdOptionLabel?: string
  fourthOptionLabel?: string
}

export const SurveyModal = ({
  isMenuVisible,
  closeMenu,
  onPressForFirstOption,
  onPressForSecondOption,
  onPressForThirdOption,
  onPressForFourthOption,
  firstOptionLabel,
  secondOptionLabel,
  thirdOptionLabel,
  fourthOptionLabel,
}: RoadMapOutcomeModalProps) => {
  const outComeList = [
    {
      outcome: "The church is committed to the revitalization process.",
    },
    {
      outcome:
        "The Church is praying consistently and intentionally for revitalization.",
    },
    {
      outcome:
        "The church understands its current health and is committed to making improvements.",
    },
    {
      outcome:
        "The church is beginning to feel like a warm and welcoming place for new attendees.",
    },
    {
      outcome:
        "Church members have begun to build new relationships with people who have attended a community engagement event and its follow-up event.",
    },
    {
      outcome:
        "Church members will begin to feel a sense of hope for the future and begin expecting God to do something exciting in their church.",
    },
  ]

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
                height: 610,
                borderRadius: 14,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <LinearGradient
                colors={["#16165C", "#14507C"]}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "white",
                  padding: 10,
                }}
              >
                <ScrollView>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "center",
                      marginVertical: 24,
                    }}
                  >
                    <LinearGradient
                      colors={[
                        Colors.lightBlueGradientTwo,
                        Colors.darkBlueGradientTwo,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        padding: 2,
                        borderRadius: 10,
                        marginTop: 10,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#161b5f",
                          borderRadius: 8,
                          paddingHorizontal: 21,
                          paddingVertical: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "500",
                            color: "rgba(255, 255, 255, 0.8)",
                            textAlign: "center",
                          }}
                        >
                          Expected Outcome - First Four Months
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "column",
                        borderRadius: 8,
                        paddingVertical: 8,
                        borderWidth: 1,
                        borderColor: "#1391BC",
                      }}
                    >
                      {outComeList.map((e, i) => (
                        <View
                          key={i}
                          style={{
                            width: "100%",
                            flexDirection: "row",
                            borderRadius: 8,
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            gap: 20,
                          }}
                        >
                          <Text>⭐</Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "400",
                              color: "rgba(255, 255, 255, 0.8)",
                              paddingRight: 30,
                            }}
                          >
                            {e.outcome}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 5,
                      margin: 10,
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Image
                      source={icons.download}
                      style={{ width: 18, height: 18 }}
                    />
                    <Text
                      style={{
                        textDecorationLine: "underline",
                        fontSize: 15,
                        fontWeight: "400",
                        color: "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      Download
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={closeMenu}
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 4,
                    }}
                  >
                    <Image
                      source={icons.close}
                      style={{ width: 18, height: 18 }}
                    />
                  </TouchableOpacity>
                </ScrollView>
              </LinearGradient>
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
