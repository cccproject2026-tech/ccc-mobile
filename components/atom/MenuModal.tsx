import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { icons } from "../../constants/images";

interface Navigation {
  navigate: (routeName: string) => void;
}

interface MenuModalProps {
  isVisible: boolean;
  onClose: () => void;
  navigation: Navigation;
}

interface MenuItem {
  title: string;
  image: ImageSourcePropType;
  navigateTo?: string;
}

export const MenuModal: React.FC<MenuModalProps> = ({ isVisible, onClose, navigation }) => {
  const menuList: MenuItem[] = [
    {
      title: "Revitalization Roadmap",
      image: icons.Revitalization2,
    },
    {
      title: "Mentor Notes",
      image: icons.edit2,
    },
    {
      title: "Assessments",
      image: icons.Assessments2,
    },
    {
      title: "Assignments",
      image: icons.assignment,
    },
    {
      title: "Track Progress",
      image: icons.progress2,
    },
    {
      title: "Schedule Meeting",
      image: icons.Appointments2,
      navigateTo: "scheduleMeeting",
    },
    {
      title: "Mark Programme as Completed",
      image: icons.changePass,
    },
  ];

  const handleMenuPress = (item: MenuItem): void => {
    if (item.navigateTo) {
      navigation.navigate(item.navigateTo);
    }
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <LinearGradient
        colors={["#16165C", "#14507C"]}
        style={{
          borderWidth: 1,
          borderColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              width: 50,
              height: 5,
              backgroundColor: "white",
              borderRadius: 2.5,
            }}
          />
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Menu Options
          </Text>

          {menuList.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleMenuPress(item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 15,
                paddingHorizontal: 10,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Image
                source={item.image}
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 15,
                }}
                resizeMode="contain"
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  flex: 1,
                }}
              >
                {item.title}
              </Text>
              <Image
                source={icons.forward}
                style={{
                  width: 16,
                  height: 16,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </Modal>
  );
};
