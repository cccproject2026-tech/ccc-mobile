import { useData } from "@/dataContext";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "../../constants/images";
import { useDrawerStore } from "./DrawerStore";
const image = require("@/assets/logos/CCClogo.png");

interface Navigation {
  navigate: (routeName: string) => void;
  closeDrawer?: () => void;
}

interface SubTab {
  name: string;
  iconKey: keyof typeof icons;
  navigateLocation: string;
  iconSize?: { width: number; height: number };
}

type SubTabItem = {
  name: string;
  iconKey: string;
  navigateLocation: string;
  iconSize?: { width: number; height: number };
};

interface DrawerItem {
  name: string;
  iconKey: keyof typeof icons;
  navigateLocation?: string;
  subTabs?: SubTab[];
  iconSize?: { width: number; height: number };
}

interface CustomDrawerContentProps {
  navigation: Navigation;
  state?: any;
  descriptors?: any;
}

export const CustomDrawerContent = (props: CustomDrawerContentProps) => {
  const { currentScreen } = useData();
  const { closeDrawer } = useDrawerStore();

  console.log(currentScreen, "current Screen");
  const PastorScreenDrawerContent = [
    {
      name: "My Mentors",
      iconKey: "myMentors",
      navigateLocation: "/(pastor-tabs)/my-mentors",
    },
    {
      name: "Revitalization Roadmap",
      iconKey: "Revitalization",
      navigateLocation: "/(pastor-tabs)/roadmap/revitalization-roadmap",
    },
    {
      name: "Assessments",
      iconKey: "Assessments",
      navigateLocation: "/(pastor-tabs)/assessments",
    },
    {
      name: "Progress",
      iconKey: "progress",
      navigateLocation: "/(pastor-tabs)/progress/progress",
    },
    {
      name: "Appointments",
      iconKey: "Appointments",
      navigateLocation: "/(pastor-tabs)/appointments",
    },
    {
      name: "Profile",
      iconKey: "profile",
      subTabs: [
        {
          name: "My Profile",
          iconKey: "myProfile",
          navigateLocation: "/(pastor-tabs)/profile/my-profile",
          iconSize: { width: 25, height: 20 },
        },
        {
          name: "Documents",
          iconKey: "document",
          navigateLocation: "/(pastor-tabs)/profile/my-profile",
        },
        {
          name: "Assignments",
          iconKey: "assignment",
          navigateLocation: "/(pastor-tabs)/profile/my-assignment/assignment",
        },
        {
          name: "Certificates",
          iconKey: "certificate",
          navigateLocation: "/(pastor-tabs)/profile/certificate",
        },
        {
          name: "Micro Grant",
          iconKey: "microGrant",
          navigateLocation: "/(pastor-tabs)/profile/grant",
        },
      ],
    },
    {
      name: "Settings",
      iconKey: "settings",
      subTabs: [
        {
          name: "Change Password",
          iconKey: "changePass",
          navigateLocation: "/(pastor-tabs)/profile/my-profile",
        },
        {
          name: "Turn Off Notifications",
          iconKey: "turnOffNotification",
          navigateLocation: "/(pastor-tabs)/notifications",
        },
        {
          name: "Change Mentor",
          iconKey: "changeMentor",
          navigateLocation: "/(pastor-tabs)/roadmap/phase-2/empowerment-cards",
          // navigateLocation: "/(pastor-tabs)/profile/my-profile",
        },
      ],
    },
  ];

  const MentorScreenDrawerContent = [
    {
      name: "My Mentees",
      iconKey: "myMentors",
      navigateLocation: "/(mentor-tabs)/my-mentors",
    },
    {
      name: "Courses",
      iconKey: "Assessments",
      navigateLocation: "Home",
    },
    {
      name: "Revitalization RoadMap",
      iconKey: "Revitalization",
      navigateLocation: "/(mentor-tabs)/roadmap/landing/landing",
    },
    {
      name: "Assessments",
      iconKey: "Assessments",
      navigateLocation: "/(mentor-tabs)/assessments/survey",
    },
    {
      name: "Track Progress",
      iconKey: "progress",
      navigateLocation: "/(mentor-tabs)/progress/progress",
    },
    {
      name: "Schedule",
      iconKey: "Appointments",
      navigateLocation: "/(mentor-tabs)/progress/progress",
    },
    {
      name: "Profile",
      iconKey: "profile",
      navigateLocation: "/(mentor-tabs)/profile/my-profile",
      subTabs: [
        {
          name: "My Profile",
          iconKey: "myProfile",
          navigateLocation: "/(mentor-tabs)/profile/my-profile",
        },
        {
          name: "Documents",
          iconKey: "document",
          navigateLocation: "/(mentor-tabs)/profile/my-profile",
        },
        {
          name: "Certificate",
          iconKey: "certificate",
          navigateLocation: "/(mentor-tabs)/profile/certificate",
        },
        {
          name: "Notes",
          iconKey: "microGrant",
          navigateLocation: "MicroGrant",
        },
        {
          name: "Micro Grant",
          iconKey: "microGrant",
          navigateLocation: "/(mentor-tabs)/profile/grant",
        },
      ],
    },
    {
      name: "Settings",
      iconKey: "settings",
      navigateLocation: "Settings",
      subTabs: [
        {
          name: "Change Password",
          iconKey: "changePass",
          navigateLocation: "/(mentor-tabs)/profile/my-profile",
        },
        {
          name: "Turn Off Notifications",
          iconKey: "turnOffNotification",
          navigateLocation: "/(mentor-tabs)/notifications",
        },
      ],
    },
  ];

  const DirectorScreenDrawerContent = [
    {
      name: "My Mentors",
      iconKey: "myMentors",
      navigateLocation: "Mentors",
    },
    {
      name: "Revitalization RoadMap",
      iconKey: "Revitalization",
      navigateLocation: "Revitalization",
    },
    {
      name: "Assessments",
      iconKey: "Assessments",
      navigateLocation: "Home",
    },
    {
      name: "Progress",
      iconKey: "progress",
      navigateLocation: "Progress",
    },
    {
      name: "Appointments",
      iconKey: "Appointments",
      navigateLocation: "Appointments",
    },
    {
      name: "Profile",
      iconKey: "profile",
      navigateLocation: "profile",
      subTabs: [
        {
          name: "My Profile",
          iconKey: "myProfile",
          navigateLocation: "profile",
        },
        {
          name: "Documents",
          iconKey: "document",
          navigateLocation: "Profile",
        },
        {
          name: "Assignments",
          iconKey: "assignment",
          navigateLocation: "Assignment",
        },
        {
          name: "Certificate",
          iconKey: "certificate",
          navigateLocation: "Certificate",
        },
        {
          name: "Micro Grant",
          iconKey: "microGrant",
          navigateLocation: "MicroGrant",
        },
      ],
    },
    {
      name: "Settings",
      iconKey: "settings",
      navigateLocation: "Settings",
      subTabs: [
        {
          name: "Change Password",
          iconKey: "changePass",
          navigateLocation: "Profile",
        },
        {
          name: "Turn Off Notifications",
          iconKey: "turnOffNotification",
          navigateLocation: "Notification",
        },
        {
          name: "Change Mentor",
          iconKey: "changeMentor",
          navigateLocation: "Profile",
        },
      ],
    },
  ];

  const handleDrawerItemPress = (navigateLocation: string) => {
    console.log(navigateLocation, "navigateLocation");
    router.push(navigateLocation as any);
    closeDrawer();
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.drawerHeader}>
        {/* Profile and App Logo */}
        <View
          style={{
            width: 100,
            height: 70,
            borderRadius: 10000,
            padding: 2,
            paddingLeft: 5,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={icons.myProfile} // Replace with actual user profile image URL
            style={{ width: 50, height: "100%" }}
            resizeMode="contain"
          />
          <Text
            style={{
              paddingLeft: 20,
              color: "white",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            John Ross
          </Text>
        </View>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10000,
            paddingRight: 10,
            paddingTop: 7,
          }}
        >
          {/* <Image
            source={require("../../assets/logos/CCClogo.png")} // Replace with your app logo
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          /> */}
          <TouchableOpacity onPress={closeDrawer}>
            {/* <Text>X</Text> */}
            <Image
              source={image}
              style={{ width: 25, height: 25 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawer Options */}
      <View style={{ padding: 10 }}>
        {(currentScreen == "Pastor"
          ? PastorScreenDrawerContent
          : currentScreen == "Mentor"
            ? MentorScreenDrawerContent
            : DirectorScreenDrawerContent
        ).map((e, i) => (
          <React.Fragment key={i}>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                if (!e.subTabs) {
                  handleDrawerItemPress(e.navigateLocation);
                }
              }}
            >
              <Image
                source={icons[e.iconKey as keyof typeof icons]}
                style={{ width: 20, height: 20 }}
              />
              <Text style={styles.drawerText}>{e.name}</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            {/* <View style={styles.separator} /> */}
            {(e.name == "Profile" || e.name == "Settings") &&
              e.subTabs?.map((ee: SubTabItem, index) => (
                <View style={{ width: "70%", marginLeft: 90 }} key={index}>
                  <TouchableOpacity
                    style={[styles.drawerItem, { ...{} }]}
                    onPress={() => handleDrawerItemPress(ee.navigateLocation)}
                  >
                    <Image
                      source={icons[ee.iconKey as keyof typeof icons]}
                      style={{
                        width: ee.iconSize?.width || 20,
                        height: ee.iconSize?.height || 20,
                        objectFit: "contain"
                      }}

                    />
                    <Text style={styles.drawerText}>{ee.name}</Text>
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  {/* <View style={styles.separator} /> */}
                  {/* <View style={{width:"50%"}}></View> */}
                </View>
              ))}
          </React.Fragment>
        ))}
      </View>
      <View style={{ marginVertical: 10, padding: 10 }}>
        <TouchableOpacity
          style={styles.drawerItem}
          // onPress={() => props.navigation.navigate("")}
          onPress={() => alert("Logged out!")}
        >
          <Image
            source={icons.logout}
            style={{ width: 20, height: 20 }}
          ></Image>
          <Text style={styles.drawerText}>Log out</Text>
        </TouchableOpacity>
      </View>
      {/* You can add more items here */}

      {/* Footer Section */}
      <View style={styles.drawerFooter}>
        <View
          style={{ backgroundColor: "#33688e", borderRadius: 10, padding: 4 }}
        >
          {/* Logout Button */}
          <TouchableOpacity
            // style={styles.footerItem}
            onPress={() => {
              // Implement logout functionality here
              // console.log("Logging out...");
            }}
          >
            <Text style={{ color: "white" }}>Contact Information</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={icons.phone} style={{ width: 15, height: 14 }} />
              <Text style={{ color: "white" }}> : 269-471-6159</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={icons.mail} style={{ width: 15, height: 14 }} />
              <Text style={{ color: "white" }}>
                {" "}
                : communitychange@andrews.edu
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: "100%",
            alignItems: "center",
            height: 30,
            marginVertical: 20,
          }}
        >
          <Image
            source={require("../../assets/icons/footerIcon.png")}
            style={{ width: 20, height: 30 }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 110,
    paddingTop: 50,
    // paddingBottom: 20,
    backgroundColor: "#14517d",
  },
  profilePic: {
    borderRadius: 40,
    marginBottom: 10,
  },
  logo: {},
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  drawerText: {
    color: "#14517d",
    marginLeft: 10,
    fontSize: 18,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginHorizontal: 10,
  },
  drawerFooter: {
    marginTop: "auto", // Push the footer to the bottom
    padding: 10,
    backgroundColor: "#14517d", // Set a background color for the footer
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  footerText: {
    marginLeft: 10,
    fontSize: 18,
    color: "#ff6347", // Red color for the footer text
  },
});
