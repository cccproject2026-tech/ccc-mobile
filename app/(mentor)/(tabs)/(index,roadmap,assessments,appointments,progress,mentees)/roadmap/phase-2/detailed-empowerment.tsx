import { Button, UploadPDFButton } from "@/components/atom/buttons";
// import { CheckBox } from "@/components/atom/checkBox"
import { OptionsModal } from "@/components/atom/modals";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Tab } from "@/components/atom/tab";
import { DatePicker, Header, TextArea } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { DocumentPickerResult } from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailedEmpowerment() {
  const { data: dataParam } = useLocalSearchParams();
  const data = dataParam ? JSON.parse(dataParam as string) : null;

  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState();
  const [date, setDate] = useState<Date>(new Date(2024, 10, 7));
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);

  const [formTab, setFormTab] = useState<number>(2);

  const availableTabs = [
    { tab: "Over View" },
    { tab: "Comments" },
    { tab: "Queries" },
  ];

  const [tabs, setTabs] = React.useState("Over View");
  const [surveyGuideLines, setSurveyGuideLines] = React.useState(false);

  const handleTabPress = (tabName: string) => {
    if (tabName === "Over View") {
      setTabs(tabName);
    } else if (tabName === "Comments") {
      router.push({
        pathname: "/(pastor-tabs)/(tabs)/roadmap/comments",
        params: { data: JSON.stringify(data) },
      });
    } else if (tabName === "Queries") {
      router.push({
        pathname: "/(pastor-tabs)/(tabs)/roadmap/queries",
        params: { data: JSON.stringify(data) },
      });
    }
  };

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader showNameTag={true} wrapperClass="mt-5" />

            {/* Header Section */}
            <Header
              title="Church Empowerment Phase"
              subTitle="Revitalization Roadmap"
              hideSearchBar={true}
            />

            {/* Tabs Section */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 15,
                width: "100%",
                justifyContent: "center",
              }}
            >
              {availableTabs.map((e, i) => (
                <Tab
                  key={i}
                  data={e}
                  tabs={tabs}
                  setTabs={setTabs}
                  onPress={() => handleTabPress(e.tab)}
                />
              ))}
            </View>

            {/* Content Section */}
            {formTab === 1 ? (
              <View
                style={{
                  marginVertical: 10,
                  paddingTop: 20,
                  paddingBottom: 150,
                  paddingHorizontal: 10,
                  width: "100%",
                }}
              >
                {tabs == "Over View" ? (
                  <View style={{ width: "100%" }}>
                    <View style={{ width: "100%", paddingHorizontal: 10 }}>
                      <Image
                        source={icons.detailedRoadmapImage}
                        style={{ width: "100%", height: 181, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 15,
                          left: 20,
                          backgroundColor: "#233C7896",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          shadowColor: "#233C7896",
                          shadowOffset: { width: 4, height: 4 },
                          shadowOpacity: 0.9,
                          shadowRadius: 10,
                          elevation: 5,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "bold",
                          }}
                        >
                          {data?.title}
                        </Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                      <View style={{ alignItems: "flex-end", padding: 4 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "white",
                            fontWeight: "300",
                            marginTop: 10,
                          }}
                        >
                          {data?.time}
                        </Text>
                      </View>
                      {/* Separator */}
                      <View className="h-[0.5px] bg-white/30 mt-3" />

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Roadmap</Text>
                        <TextArea
                          label=""
                          numberOfLines={1}
                          inputClass={{ minHeight: 10, maxHeight: 50 }}
                        />
                      </View>

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Description</Text>
                        <TextArea label="" />
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />
                      <View
                        style={{
                          width: "100%",
                          alignItems: "center",
                          marginVertical: 20,
                        }}
                      >
                        <UploadPDFButton
                          title={"Upload Team Schedule"}
                          onPress={() => {
                            setFormTab(2);
                            router.push("/assessments/pmp-survey-page");
                          }}
                          style={{ width: 250, backgroundColor: "white" }}
                          textStyle={{ color: "#001FC1" }}
                          icon={icons.attachPin}
                          selectedFile={null}
                          setSelectedFile={(file: DocumentPickerResult) => {
                            // TODO: Implement file handling
                            console.log("Selected file:", file);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            ) : formTab === 2 ? (
              <View
                style={{
                  marginVertical: 10,
                  paddingTop: 20,
                  paddingBottom: 150,
                  paddingHorizontal: 10,
                  width: "100%",
                }}
              >
                {tabs == "Over View" ? (
                  <View style={{ width: "100%" }}>
                    <View style={{ width: "100%", paddingHorizontal: 10 }}>
                      <Image
                        source={icons.detailedRoadmapImage}
                        style={{ width: "100%", height: 181, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 15,
                          left: 20,
                          backgroundColor: "#233C7896",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          shadowColor: "#233C7896",
                          shadowOffset: { width: 4, height: 4 },
                          shadowOpacity: 0.9,
                          shadowRadius: 10,
                          elevation: 5,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "bold",
                          }}
                        >
                          {data?.title}
                        </Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                      <View style={{ alignItems: "flex-end", padding: 4 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "white",
                            fontWeight: "300",
                            marginTop: 10,
                          }}
                        >
                          {data?.time}
                        </Text>
                      </View>
                      {/* Separator */}
                      <View className="h-[0.5px] bg-white/30 mt-3" />

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Roadmap</Text>
                        <TextArea
                          label=""
                          numberOfLines={1}
                          inputClass={{ minHeight: 10, maxHeight: 50 }}
                        />
                      </View>

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Description</Text>
                        <TextArea label="" />
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>
                          List of prayer opportunities
                        </Text>
                        <TextArea
                          label="|Enter list of prayer opportunities here..."
                          inputClass={{ minHeight: 150, maxHeight: 500 }}
                        />
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />
                      <View
                        style={{
                          width: "100%",
                          alignItems: "center",
                          marginVertical: 20,
                        }}
                      >
                        <UploadPDFButton
                          title={"Upload List of Player Opportunities"}
                          onPress={() => {
                            setFormTab(3);
                          }}
                          style={{ width: 350, backgroundColor: "white" }}
                          textStyle={{ color: "#001FC1" }}
                          icon={icons.attachPin}
                          selectedFile={null}
                          setSelectedFile={(file: DocumentPickerResult) => {
                            // TODO: Implement file handling
                            console.log("Selected file:", file);
                          }}
                        />
                      </View>
                      <View className="h-[0.5px] bg-white/30 my-6" />
                      <Button
                        type="submit"
                        title={"Submit"}
                        onPress={function (): void {
                          setFormTab(3);
                        }}
                        style={{
                          width: 100,
                          marginHorizontal: "auto",
                          backgroundColor: "white",
                        }}
                        textStyle={{ color: "#001FC1" }}
                      />
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            ) : formTab === 3 ? (
              <View
                style={{
                  marginVertical: 10,
                  paddingTop: 20,
                  paddingBottom: 150,
                  paddingHorizontal: 10,
                  width: "100%",
                }}
              >
                {tabs == "Over View" ? (
                  <View style={{ width: "100%" }}>
                    <View style={{ width: "100%", paddingHorizontal: 10 }}>
                      <Image
                        source={icons.detailedRoadmapImage}
                        style={{ width: "100%", height: 181, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 15,
                          left: 20,
                          backgroundColor: "#233C7896",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          shadowColor: "#233C7896",
                          shadowOffset: { width: 4, height: 4 },
                          shadowOpacity: 0.9,
                          shadowRadius: 10,
                          elevation: 5,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "bold",
                          }}
                        >
                          {data?.title}
                        </Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                      <View style={{ alignItems: "flex-end", padding: 4 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "white",
                            fontWeight: "300",
                            marginTop: 10,
                          }}
                        >
                          {data?.time}
                        </Text>
                      </View>
                      {/* Separator */}
                      <View className="h-[0.5px] bg-white/30 mt-3" />

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Roadmap</Text>
                        <TextArea
                          label=""
                          numberOfLines={1}
                          inputClass={{ minHeight: 10, maxHeight: 50 }}
                        />
                      </View>

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Description</Text>
                        <TextArea label="" />
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>
                          List of prayer opportunities
                        </Text>
                        <TextArea
                          label="|Enter list of prayer opportunities here..."
                          inputClass={{ minHeight: 150, maxHeight: 500 }}
                        />
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />
                      <Button
                        type="submit"
                        title={"Mark as Complete"}
                        onPress={function (): void {
                          setFormTab(4);
                        }}
                        style={{
                          width: 200,
                          marginHorizontal: "auto",
                          backgroundColor: "white",
                        }}
                        textStyle={{ color: "#001FC1" }}
                      />
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            ) : formTab === 4 ? (
              <View
                style={{
                  marginVertical: 10,
                  paddingTop: 20,
                  paddingBottom: 150,
                  paddingHorizontal: 10,
                  width: "100%",
                }}
              >
                {tabs == "Over View" ? (
                  <View style={{ width: "100%" }}>
                    <View style={{ width: "100%", paddingHorizontal: 10 }}>
                      <Image
                        source={icons.detailedRoadmapImage}
                        style={{ width: "100%", height: 181, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 15,
                          left: 20,
                          backgroundColor: "#233C7896",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          shadowColor: "#233C7896",
                          shadowOffset: { width: 4, height: 4 },
                          shadowOpacity: 0.9,
                          shadowRadius: 10,
                          elevation: 5,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "bold",
                          }}
                        >
                          {data?.title}
                        </Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                      <View style={{ alignItems: "flex-end", padding: 4 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "white",
                            fontWeight: "300",
                            marginTop: 10,
                          }}
                        >
                          {data?.time}
                        </Text>
                      </View>
                      {/* Separator */}
                      <View className="h-[0.5px] bg-white/30 mt-3" />

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Roadmap</Text>
                        <TextArea
                          label=""
                          numberOfLines={1}
                          inputClass={{ minHeight: 10, maxHeight: 50 }}
                        />
                      </View>

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Description</Text>
                        <TextArea label="" />
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>
                          List of prayer opportunities
                        </Text>
                        <TextArea
                          label="|Enter list of prayer opportunities here..."
                          inputClass={{ minHeight: 150, maxHeight: 500 }}
                        />
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />

                      <View className="flex gap-[37px]">
                        <View className="flex-row items-center justify-center gap-3">
                          <Text className="text-base font-medium leading-[22px] text-white">
                            Month 3 Meeting date :
                          </Text>
                          <DatePicker
                            value={date}
                            onChange={setDate}
                            placeholder="Select Date"
                            format="DD/MM/YY"
                            minDate={new Date(2020, 0, 1)}
                            maxDate={new Date(2030, 11, 31)}
                          />
                        </View>
                        <View className="flex-row items-center justify-center gap-3">
                          <Text className="text-base font-medium leading-[22px] text-white">
                            Month 4 Meeting date :
                          </Text>
                          <DatePicker
                            value={date}
                            onChange={setDate}
                            placeholder="Select Date"
                            format="DD/MM/YY"
                            minDate={new Date(2020, 0, 1)}
                            maxDate={new Date(2030, 11, 31)}
                          />
                        </View>
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />

                      <Button
                        type="submit"
                        title={"Mark as Complete"}
                        onPress={function (): void {
                          setFormTab(1);
                        }}
                        style={{
                          width: 200,
                          marginHorizontal: "auto",
                          backgroundColor: "white",
                        }}
                        textStyle={{ color: "#001FC1" }}
                      />
                    </View>
                  </View>
                ) : (
                  <></>
                )}
              </View>
            ) : (
              <></>
            )}
          </ScrollView>
        </SafeAreaView>

        {/* Modals */}
        <OptionsModal
          isMenuVisible={isModalVisible}
          closeMenu={() => setIsModalVisible(false)}
          onPressForFirstOption={() => {
            setIsRoadmapModalVisible(true);
            setIsModalVisible(false);
          }}
          onPressForSecondOption={() => console.log("pressed 2 ")}
          firstOptionLabel={"Expected outcome - 4 Months"}
          secondOptionLabel={"Expected Outcome - 6 Months"}
          thirdOptionLabel={"Expected Outcome - 9 Months"}
          fourthOptionLabel={"Expected Outcome - End of year"}
        />
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
          onPressForFirstOption={() => console.log("pressed 1 ")}
          onPressForSecondOption={() => console.log("pressed 2 ")}
          firstOptionLabel={"Expected outcome - 4 Months"}
          secondOptionLabel={"Expected Outcome - 6 Months"}
          thirdOptionLabel={"Expected Outcome - 9 Months"}
          fourthOptionLabel={"Expected Outcome - End of year"}
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
  sectionMargin: {
    marginVertical: 8,
    flexDirection: "column",
    gap: 5,
  },
  whiteText: {
    color: "#D9D9D9",
    fontSize: 14,
    paddingVertical: 4,
  },
  summaryContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#138BB6",
  },
});
