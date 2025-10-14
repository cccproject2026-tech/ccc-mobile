import { Button, CommentCard, ScreenLayout, Separator } from "@/components/build-components";
import TextAreaField from "@/components/build-components/text-area";
import { primary_color } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function CommentsScreen() {
  const { data: dataParam } = useLocalSearchParams();
  const data = dataParam ? JSON.parse(dataParam as string) : null;

  const dummyComments = [
    {
      id: 1,
      user: "John Doe (Mentor)",
      avatar: icons.dummyUser,
      message: "Needs improvement. Refer XYZ document",
      timestamp: "9:41 am",
      isHighlighted: true,
    },
    {
      id: 2,
      user: "Robin Roe (Project Manager)",
      avatar: icons.dummyUser,
      message: "Needs improvement. Refer XYZ document",
      timestamp: "Yesterday",
      isHighlighted: false,
    },
    {
      id: 3,
      user: "John Doe (Mentor)",
      avatar: icons.dummyUser,
      message:
        "No need to spend time researching this area. Focus on the other areas",
      timestamp: "Yesterday",
      isHighlighted: false,
    },
    {
      id: 4,
      user: "John Doe (Mentor)",
      avatar: icons.dummyUser,
      message: "Needs improvement. Refer XYZ document",
      timestamp: "Yesterday",
      isHighlighted: false,
    },
  ];

  return (
    <ScreenLayout
      enablePastorHeader={true}
      showNameTag={true}
      tagName="John Doe"
      enableHeader={true}
      headerTitle="Jump-start"
      headerSubTitle="My Mentee > John Doe > Revitalization Roadmap "
      showSettings={true}
      hideSearchBar={true}
    >
      <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
        <View style={{ display: "flex", gap: 42 }}>
          <TextAreaField inputClass={{ backgroundColor: primary_color }} />
          <Button
            onPress={() => { }}
            wrapperClass="max-w-[200px] w-[200px] mx-auto"
            buttonClass="!w-[200px] !h-11"
            variant="secondary"
          >
            Submit
          </Button>
          <Separator />
        </View>
        <Text style={{ color: "#FFFFFF" }}>
          All Comments
        </Text>
        {/* Comments List */}
        <View className="flex-1 mt-4">
          {dummyComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} wrapperStyle={{ backgroundColor: primary_color }} />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}