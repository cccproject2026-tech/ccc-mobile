import GradientCalendar from "@/components/atom/calendar";
import { AppointmentCard } from "@/components/atom/cards";
import { ResponseModal } from "@/components/atom/modals";
import { Search } from "@/components/atom/Search";
import { Header } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RootStackParamList = {
  Home: undefined;
  scheduleMeeting: { data: object; navigatedFrom: string };
  Appointments: undefined;
};

interface AppointmentsProps {
  navigation: NativeStackNavigationProp<RootStackParamList, "Appointments">;
}

interface Appointment {
  date: string;
  time: string;
  name: string;
  role: string;
  mode: string;
}

interface ResponseModalState {
  visible: boolean;
  message: string;
  buttonText: string;
}

const Appointments: React.FC<AppointmentsProps> = ({ navigation }) => {
  const [selected, setSelected] = React.useState<string>("");
  const [responseModal, setResponseModal] = React.useState<ResponseModalState>({
    visible: false,
    message: "",
    buttonText: "",
  });

  const dummyAppointments: Appointment[] = [
    {
      date: "04 Aug 24",
      time: "11:30 hrs EST",
      name: "John Ross",
      role: "Mentor",
      mode: "duo",
    },
    {
      date: "11 Aug 24",
      time: "11:30 hrs EST",
      name: "John Ross",
      role: "Field Mentor",
      mode: "meet",
    },
  ];

  const scheduleMeeting = () => {
    navigation.navigate("scheduleMeeting", {
      data: {},
      navigatedFrom: "surveyScreen",
    });
  };

  const onsubmitPress = () => {
    setResponseModal((prev) => ({
      ...prev,
      visible: true,
      buttonText: "",
      message: "Survey Submitted Successfully",
    }));
    setTimeout(() => {
      setResponseModal((prev) => ({
        ...prev,
        visible: true,
        buttonText: "Schedule Meeting",
        message:
          "On completion of the PMP and CMA assessment tools please schedule a meeting with your mentor.",
      }));
    }, 2000);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {/* <View style={styles.scrollContainer}> */}
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.scrollContainer}>
          <PastorNavigationHeader />
          <View style={{ width: "100%", alignItems: "center", flex: 1 }}>
            {/* Header */}
            <Header
              title="Appointments"
              hideSearchBar={true}
              showSettings={false}
              showNewMeeting={true}
            />

            <View style={{ width: "100%" }}>
              <View style={styles.separator} />
            </View>

            <View style={{ width: "95%", marginTop: 25 }}>
              <Search placeholder={"Enter a date (dd-mm-yyyy)"} />
            </View>

            {/* Main content */}
            <ScrollView
              contentContainerStyle={{
                paddingTop: 20,
                paddingBottom: 150,
                paddingHorizontal: 10,
                width: "100%",
                flex: 1
              }}
            >
              <View
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Calendar */}
                <View
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    borderColor: "white",
                    paddingVertical: 20,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "white",
                      fontWeight: "500",
                      marginBottom: 10,
                    }}
                  >
                    Monthly Meeting Calendar
                  </Text>
                  <GradientCalendar
                    selected={selected}
                    setSelected={setSelected}
                    showDateTime={false}
                  />
                </View>

                {/* Today's appointments */}
                <View style={styles.appointmentsContainer}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.upcomingText}>
                      You have {dummyAppointments.length} Appointments Today
                    </Text>
                  </View>
                  {dummyAppointments.map((e, i) => (
                    <AppointmentCard key={i} data={e} dataKey={i} />
                  ))}
                </View>

                {/* New appointments */}
                <View style={styles.appointmentsContainer}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.upcomingText}>New Appointment</Text>
                  </View>
                  {dummyAppointments.map((e, i) => (
                    <AppointmentCard key={i} data={e} dataKey={i} />
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Response Modal */}
            <ResponseModal
              buttonText={responseModal.buttonText}
              buttonPress={scheduleMeeting}
              isModalVisible={responseModal.visible}
              responseText={responseModal.message}
              closeMenu={() =>
                setResponseModal((prev) => ({
                  ...prev,
                  visible: false,
                  message: "",
                }))
              }
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
      {/* </View> */}
    </>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 8,
  },
  appointmentsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    position: "relative",
    width: "100%",
    borderWidth: 1,
    borderColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  rowBetween: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  upcomingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "AlbertSans-Bold",
    textAlign: "center",
  },
});
