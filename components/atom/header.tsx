import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { icons } from "../../constants/images";

interface Navigation {
  navigate: (routeName: string) => void;
  openDrawer: () => void;
}

interface HeaderRightProps {
  navigation: Navigation;
  hideBell?: boolean;
}

interface HeaderTitleProps {
  navigation?: Navigation;
  title?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const HeaderRight: React.FC<HeaderRightProps> = ({
  navigation,
  hideBell = true,
}) => (
  <View
    style={{
      flexDirection: "row",
      paddingRight: 10,
      alignItems: "center",
    }}
  >
    {hideBell && (
      <TouchableOpacity
        style={{ paddingRight: 20 }}
        onPress={() => navigation.navigate("Notification")}
      >
        <Image
          source={icons.notification}
          style={{ width: 30, height: "100%" }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    )}
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Image
        source={icons.logo}
        style={{ width: 30, height: "100%" }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
);

export const HeaderTitle: React.FC<HeaderTitleProps> = ({
  navigation,
  title = "John Ross",
  style = {},
  textStyle = {},
}) => (
  <LinearGradient
    colors={[Colors.lightBlueGradientFour, Colors.darkBlueGradientFour]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      padding: 2,
      borderRadius: 10,
    }}
  >
    <View
      style={[
        {
          backgroundColor: Colors.lightBlueGradientOne,
          borderRadius: 8,
          paddingHorizontal: 30,
          paddingVertical: 8,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            fontSize: 20,
            lineHeight: 30,
            fontWeight: "700",
            paddingVertical: 10,
            fontFamily: "AlbertSans-Medium",
            color: Colors.customWhiteEighty,
            textAlign: "center",
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  </LinearGradient>
);
