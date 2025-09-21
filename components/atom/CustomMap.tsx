// components/MapWithPins.tsx
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";
import { icons } from "../../constants/images";

interface User {
  name: string;
  location: string;
  lat: number;
  lng: number;
  color: string;
  profilePic: ImageSourcePropType;
}

interface Navigation {
  navigate: (routeName: string) => void;
}

interface CustomMapProps {
  users: User[];
  style?: ViewStyle;
  navigation: Navigation;
  initialRegion?: Region;
}

const CustomMap: React.FC<CustomMapProps> = ({ 
  users, 
  style = {}, 
  navigation,
  initialRegion = {
    latitude: 20.5937, // Center of India
    longitude: 78.9629,
    latitudeDelta: 30, // Zoom level
    longitudeDelta: 30,
  }
}) => {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);

  const handleMarkerPress = (user: User): void => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleCloseModal = (): void => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleNavigateToProfile = (): void => {
    navigation.navigate("MenteesProfile");
    handleCloseModal();
  };

  return (
    <View style={[styles.container, style]}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {users.map((user, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: user.lat,
              longitude: user.lng,
            }}
            onPress={() => handleMarkerPress(user)}
          >
            {/* Custom Marker with Profile Image */}
            <View style={styles.markerContainer}>
              <View style={[styles.markerRing, { borderColor: user.color }]}>
                <Image source={user.profilePic} style={styles.profileImage} />
              </View>
              <View
                style={[styles.markerPointer, { backgroundColor: user.color }]}
              />
            </View>

            {/* Callout (popup when marker is pressed) */}
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Image source={user.profilePic} style={styles.calloutImage} />
                <View style={styles.calloutText}>
                  <Text style={styles.calloutTitle}>{user.name}</Text>
                  <Text style={styles.calloutSubtitle}>{user.location}</Text>
                </View>
              </View>
              <View
                style={[styles.calloutPointer, { borderTopColor: user.color }]}
              />
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <LinearGradient
                  colors={["#14507C", "#16165C"]}
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "white",
                    padding: 4,
                  }}
                >
                  {selectedUser && (
                    <View style={{ padding: 10, flexDirection: "row" }}>
                      <View
                        style={{
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 10,
                          gap: 4,
                        }}
                      >
                        <Image
                          source={selectedUser.profilePic}
                          style={styles.calloutImage}
                        />
                        <Image
                          source={icons.location}
                          style={{ width: 20, height: 20 }}
                        />
                      </View>
                      <View>
                        <Text style={styles.calloutTitle}>
                          {selectedUser.name}
                        </Text>
                        <Text style={styles.calloutSubtitle}>
                          {selectedUser.location}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 4,
                            marginVertical: 10,
                          }}
                        >
                          <Image
                            source={icons.phone}
                            style={styles.iconStyle}
                          />
                          <Image
                            source={icons.message}
                            style={styles.iconStyle}
                          />
                          <Image source={icons.mail} style={styles.iconStyle} />
                          <Image
                            source={icons.whatsapp}
                            style={styles.iconStyle}
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={handleNavigateToProfile}
                        style={{ position: "absolute", top: 10, right: 10 }}
                      >
                        <Image
                          source={icons.forward}
                          style={styles.iconStyle}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    flex: 1,
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    alignItems: "center",
  },
  iconStyle: {
    width: 18,
    height: 18,
  },
  markerRing: {
    width: 30,
    height: 30,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "white",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  markerPointer: {
    width: 2,
    height: 10,
    borderRadius: 5,
    marginTop: -4,
  },
  calloutContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  calloutText: {
    justifyContent: "center",
  },
  calloutTitle: {
    textDecorationLine: "underline",
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  calloutSubtitle: {
    color: "white",
    fontSize: 14,
  },
  calloutPointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderTopWidth: 8,
    alignSelf: "center",
    marginTop: -2,
  },
});

export default CustomMap;
