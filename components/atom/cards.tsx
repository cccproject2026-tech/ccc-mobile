import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "../../constants/images";
import { UploadPDFButton } from "./buttons";
import CheckBox from "./checkBox";

export const AppointmentCard = ({
  data,
  dataKey,
}: {
  data: any;
  dataKey: string | number;
}) => {
  return (
    <View key={dataKey} style={styles.appointmentBox}>
      <View style={{ width: 100, height: "100%" }}>
        <Image
          source={data.mode == "duo" ? icons.duoMeet : icons.googleMeet}
          style={styles.appointmentImage}
          resizeMode={"contain"}
        />
      </View>
      <View style={styles.appointmentDetails}>
        <View>
          <Text style={styles.dateTimeText}>
            {data.date} <Text style={styles.timeText}> Time </Text>
            {data.time}
          </Text>
        </View>
        <View style={styles.mentorInfoContainer}>
          <Image source={icons.myProfile} style={styles.mentorImage} />
          <Text style={styles.mentorNameText}>John Ross - {data.role}</Text>
        </View>
        <Text style={styles.modeText}>
          Mode:{" "}
          <Text style={styles.modeBoldText}>
            {data.mode == "duo" ? "Duo" : "Google Meet"}
          </Text>
        </Text>
        <View style={styles.iconRow}>
          <Image source={icons.phone} style={styles.iconStyle} />
          <Image source={icons.message} style={styles.iconStyle} />
          <Image source={icons.mail} style={styles.iconStyle} />
          <Image source={icons.whatsapp} style={styles.iconStyle} />
        </View>
      </View>
      <TouchableOpacity>
        <Image source={icons.forward} style={styles.iconStyle} />
      </TouchableOpacity>
    </View>
  );
};
export const NotificationCard = ({ data }: { data: any }) => {
  return (
    <View style={styles.NotificationBox}>
      <View
        style={{ width: 100, height: "100%", alignItems: "center", padding: 8 }}
      >
        <Image
          source={
            data.type == "course" || data.type == "assignment"
              ? icons.Revitalization2
              : data.type == "note"
              ? icons.edit2
              : icons.profile2
          }
          style={{ width: 60, height: 60 }}
          // resizeMode={"contain"}
        />
      </View>
      <View style={styles.appointmentDetails}>
        <View>
          <Text
            style={{ color: "white", fontSize: 16, fontWeight: "600" ,lineHeight:22 }}
            ellipsizeMode="tail"
          >
            {data.title.toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: "white", fontWeight: "200" }}>
          {data.description}
        </Text>
      </View>
      {!data.read && (
        <View
          style={{
            width: 8,
            height: 8,
            backgroundColor: "yellow",
            borderRadius: 999999,
            position: "absolute",
            top: 16,
            right: 16,
          }}
        ></View>
      )}
      <View style={{ position: "absolute", bottom: 3, right: 6 }}>
        <Text style={{ color: "white", fontWeight: "200" }}>{data.time}</Text>
      </View>
    </View>
  );
};
export const RevitalizationCard = ({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) => {
  const progressPercentage =
    (data?.taskStatus?.inProgress / data.taskStatus.toComplete) * 100 + "%";

  return (
    <TouchableOpacity
      onPress={() =>
        data.assignment
          ? navigation.push({
              pathname:
                "/(pastor-tabs)/profile/my-assignment/detailed-assignment",
              params: { data: JSON.stringify(data) },
            })
          : data.subPhase
          ? navigation.push({
              pathname: "/(pastor-tabs)/roadmap/sub-phases",
              params: { data: JSON.stringify(data) },
            })
          : navigation.push({
              pathname: "/(pastor-tabs)/roadmap/detailed-roadmap",
              params: { data: JSON.stringify(data) },
            })
      }
      style={{
        width: "100%",
        backgroundColor: "#194F82",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#FFFFFF73",
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 110,
            height: "100%",
            alignItems: "center",
            padding: 8,
          }}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={data?.image}
              style={{ width: 110, height: 100, borderRadius: 12 }}
            />
            {data?.phase && (
              <View
                style={{
                  marginHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    color: "black",
                    fontWeight: "500",
                    fontSize: 11,
                    textAlign: "center",
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    right: 0,
                    backgroundColor: "#F1E91A85",
                    padding: 4,
                    borderRadius: 8,
                  }}
                >
                  {data?.phase}
                </Text>
              </View>
            )}
          </View>
          <View className="mt-2" style={{ alignItems: "flex-start" }}>
            <Text style={{ color: "white", fontWeight: "300", fontSize: 11 }}>
              {data?.time}
            </Text>
          </View>
        </View>
        <View style={{ marginLeft: 10, flex: 1, gap: 4 }}>
          <View>
            <Text
              style={{ color: "white", fontSize: 16, fontWeight: "600" }}
              ellipsizeMode="tail"
            >
              {data?.title}
            </Text>
          </View>
          <Text
            className="py-2"
            style={{ color: "#F4F2F2B5", fontWeight: "400", fontSize: 14 }}
          >
            {data?.description}
          </Text>
          <TouchableOpacity
            style={{
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#FFFFFF33",
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginVertical: 4,
              borderRadius: 8,
              maxWidth: "80%",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "white",
                fontWeight: "500",
              }}
            >
              Status{" "}
              <Text
                style={{
                  color: "white",
                  fontWeight: "900",
                  alignItems: "center",
                }}
              >
                •
              </Text>{" "}
              <Text
                style={{
                  color: data?.status == "Due" ? "yellow" : "white",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {data?.status}
              </Text>
            </Text>
          </TouchableOpacity>
          {data?.sessionDate && data?.status == "Not Started" ? (
            <TouchableOpacity
              style={{
                alignItems: "center",
                borderWidth: 1,
                borderColor: "white",
                paddingVertical: 10,
                marginVertical: 12,
                borderRadius: 8,
                width: "80%",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "white",
                  fontWeight: 500,
                  paddingBottom: 4,
                }}
              >
                Session Date :{" "}
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#47729b",
                  padding: 5,
                  marginVertical: 4,
                  width: "75%",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "white",
                    fontWeight: "300",
                    width: "100%",
                  }}
                >
                  {data?.sessionDate}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ) : data?.taskStatus?.started ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "black",
                    borderRadius: 10,
                    width: "50%",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      width: progressPercentage as any,
                      height: 6,
                      borderRadius: 10,
                    }}
                  ></View>
                </View>
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "300",
                    paddingLeft: 4,
                  }}
                >
                  {" "}
                  {data?.taskStatus?.inProgress} /{" "}
                  {data?.taskStatus?.toComplete}
                </Text>
              </View>
              <Text style={{ color: "white", fontSize: 12, fontWeight: "300" }}>
                Tasks Completed
              </Text>
            </>
          ) : data.status == "Completed" ? (
            <Text
              style={{
                fontSize: 12,
                color: "white",
                fontWeight: "300",
              }}
            >
              {" "}
              Completed on : {data.completionDate}
            </Text>
          ) : (
            <></>
          )}
        </View>
      </View>
      {data?.showBothDate &&
        data?.sessionDate &&
        data?.status == "Not Started Yet" && (
          <TouchableOpacity
            style={{
              alignItems: "center",
              borderWidth: 1,
              borderColor: "white",
              paddingVertical: 10,
              marginVertical: 12,
              borderRadius: 8,
              width: "95%",
            }}
            className="flex flex-row justify-evenly mx-auto"
          >
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: "white",
                  fontWeight: 500,
                  paddingBottom: 4,
                }}
              >
                Session Date :{" "}
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#47729b",
                  padding: 5,
                  marginVertical: 4,
                  width: "100%",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "white",
                    fontWeight: "300",
                    width: "100%",
                  }}
                >
                  {data?.sessionDate}
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: "white",
                  fontWeight: 500,
                  paddingBottom: 4,
                }}
              >
                Session Date :{" "}
              </Text>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: "#47729b",
                  padding: 5,
                  marginVertical: 4,
                  width: "100%",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    color: "white",
                    fontWeight: "300",
                    width: "100%",
                  }}
                >
                  {data?.sessionDate}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      {data?.meeting && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: "yellow" }}>
            Meeting scheduled on {data?.meeting?.scheduled}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const RoadMapCard = ({
  data,
  dataKey,
}: {
  data: any;
  dataKey: string;
}) => {
  return (
    <View style={styles.roadmapItem} key={dataKey}>
      <View style={styles.leftContent}>
        <Image
          source={
            data.title == "Survey" ? icons.Assessments2 : icons.Revitalization2
          }
          style={{ width: 22, height: 22 }}
        />
        <Text style={styles.roadmapText}>
          {data.phase} – {data.title}
        </Text>
      </View>
      <View style={[styles.leftContent, { marginLeft: "auto" }]}>
        <Text
          style={[
            styles.statusTextWhite,
            { ...{ color: data.status == "Due" ? "yellow" : "white" } },
          ]}
        >
          {data.status}
        </Text>
        <TouchableOpacity style={styles.arrowButton}>
          <Image source={icons.forward} style={styles.iconStyle} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const CardBox = ({ icon, title }: { icon: any; title: string }) => {
  return (
    <LinearGradient
      colors={[Colors.darkBlueGradientTwo, Colors.lightBlueGradientTwo]}
      style={styles.gradientContainer}
    >
      <Image source={icon} style={styles.icon} />
      <Text className="text-white font-medium text-[16px] text-center">
        {title}
      </Text>
    </LinearGradient>
  );
};

export const MentorCard = ({
  data,
  dataKey,
  navigation,
  onMenuPress,
}: {
  data: any;
  dataKey: string;
  navigation: any;
  onMenuPress: () => void;
}) => {
  return (
    <View style={styles.mentorCard}>
      <View style={styles.mentorDetails} className="px-4">
        <Image
          source={icons.dummyUser}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
          }}
        />
        <Text className="ml-8 font-medium text-white text-[16px]">
          {data.name}
        </Text>
      </View>
      <View style={styles.mentorIconContainer}>
        <Image source={icons.phone} style={styles.MentorIcon} />
        <Image source={icons.message} style={styles.MentorIcon} />
        <Image source={icons.mail} style={styles.MentorIcon} />
        <Image source={icons.whatsapp} style={styles.MentorIcon} />
        <TouchableOpacity onPress={onMenuPress}>
          <Image source={icons.menuVertical} style={styles.MentorIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export const DetailedMentorCard = ({
  data,
  key,
  navigation,
  onMenuPress,
}: {
  data: any;
  key: string;
  navigation: any;
  onMenuPress: () => void;
}) => {
  return (
    <View
      style={{
        backgroundColor: "#1A4882",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.8)",
        padding: 16,
        position: "relative",
      }}
    >
      {/* Three dot menu - top right */}
      <View style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <TouchableOpacity onPress={onMenuPress}>
          <Image source={icons.menuVertical} style={styles.MentorIcon} />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={{ flexDirection: "row" }}>
        {/* Profile Image */}
        <View style={{ marginRight: 16 }}>
          <Image
            source={icons.dummyUser}
            style={{
              width: 100,
              height: 85,
              borderRadius: 10,
            }}
          />
        </View>

        {/* Text content */}
        <View style={{ flex: 1, paddingRight: 20 }}>
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            {data.name}
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "400",
              marginBottom: 8,
            }}
          >
            {data?.role}
          </Text>
          <Text
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 14,
              fontWeight: "400",
              lineHeight: 20,
            }}
          >
            {data?.description}
          </Text>
        </View>
      </View>

      {/* Contact icons - bottom left */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 16,
          gap: 16,
        }}
      >
        <Image source={icons.phone} style={styles.MentorIcon} />
        <Image source={icons.message} style={styles.MentorIcon} />
        <Image source={icons.mail} style={styles.MentorIcon} />
        <Image source={icons.whatsapp} style={styles.MentorIcon} />
      </View>
    </View>
  );
};

export const CommentsCard = ({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) => {
  return (
    <View
      style={[styles.NotificationBox, { ...{ backgroundColor: "#1a4882" } }]}
    >
      <View
        style={{ width: 100, height: "100%", alignItems: "center", padding: 8 }}
      >
        <Image
          source={
            data.type == "course" || data.type == "assignment"
              ? icons.dummyUser
              : data.type == "note"
              ? icons.dummyUser2
              : icons.profile2
          }
          style={{ width: 60, height: 60, borderRadius: 999999 }}
          // resizeMode={"contain"}
        />
      </View>
      <View style={styles.appointmentDetails}>
        <View>
          <Text
            style={{ color: "white", fontSize: 14, fontWeight: "400" }}
            ellipsizeMode="tail"
          >
            {data.mentorComment}
          </Text>
        </View>
        <Text style={{ color: "white", fontWeight: "200" }}>
          {data.description}
        </Text>
        <View style={[styles.mentorIconContainer, { ...{ paddingTop: 10 } }]}>
          <Image source={icons.phone} style={styles.MentorIcon} />
          <Image source={icons.message} style={styles.MentorIcon} />
          <Image source={icons.mail} style={styles.MentorIcon} />
          <Image source={icons.whatsapp} style={styles.MentorIcon} />
        </View>
      </View>

      {!data.read && (
        <View
          style={{
            width: 8,
            height: 8,
            backgroundColor: "yellow",
            borderRadius: 999999,
            position: "absolute",
            top: 16,
            right: 16,
          }}
        ></View>
      )}

      <View style={{ position: "absolute", bottom: 3, right: 6 }}>
        <Text style={{ color: "white", fontWeight: "200" }}>{data.time}</Text>
      </View>
    </View>
  );
};

export const ListCard = ({
  listImage = false,
  type = "list",
  list,
}: {
  listImage: boolean;
  type: string;
  list: any;
}) => {
  return (
    <View style={styles.overlay}>
      <View
        style={{
          width: "100%",
          // padding: 10,
          borderRadius: 14,
          // shadowColor: "#000",
          // shadowOffset: { width: 0, height: 2 },
        }}
      >
        {/* <View style={[styles.modalContainer,{...{height:600}}]}> */}
        {/* <ScrollView> */}
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
              flex: 1,
              // paddingHorizontal:10,
              flexDirection: "column",
              // backgroundColor: "#161b5f", // Same as parent's background
              borderRadius: 8,
              // paddingHorizontal: 20,
              paddingVertical: 8,
              // gap: 20,
              borderWidth: 1,
              borderColor: "white",
            }}
          >
            {list?.map((e: any, i: any) => (
              <View
                key={i}
                style={{
                  width: "100%",
                  flexDirection: "row",
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingVertical: 8,
                  gap: 20,
                }}
              >
                {type == "list" ? (
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "900",
                      fontFamily: "AlbertSans-Medium",
                      color: Colors.customWhiteEighty,
                      textAlign: "center",
                    }}
                  >
                    •
                  </Text>
                ) : type == "circle_checkbox" ? (
                  <CheckBox
                    type="circle"
                    value={false}
                    setValue={() => {}}
                  ></CheckBox>
                ) : (
                  <CheckBox
                    type="square"
                    value={false}
                    setValue={() => {}}
                  ></CheckBox>
                )}
                {listImage && (
                  <Image
                    source={icons.dummyUser}
                    style={{ width: 30, height: 30, borderRadius: 999999 }}
                  ></Image>
                )}
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "100",
                    fontFamily: "AlbertSans-Medium",
                    color: Colors.customWhiteEighty,
                    paddingRight: 30,
                  }}
                >
                  {e?.list}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {/* </ScrollView> */}
        {/* </View> */}
      </View>
    </View>
  );
};

export const InputCard = ({
  title,
  setValue,
  value,
  required,
  description = "",
  fileUpload = false,
  answer = true,
}: {
  title: string;
  setValue: (value: string) => void;
  value: string;
  required: boolean;
  description: string;
  fileUpload?: boolean;
  answer?: boolean;
}) => {
  return (
    <View
      style={{
        width: "100%",
        // backgroundColor: "#176192", // customBlueOne
        borderRadius: 10,
        paddingVertical: 18,
        paddingHorizontal: 12,
        flexDirection: "column",
        alignItems: "flex-start",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.8)", // customWhiteEighty
        marginBottom: 16,
        gap: 10,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 16,
          lineHeight: 22,
          fontWeight: 500,
        }}
      >
        {title} {required && <Text style={{ color: "yellow" }}>*</Text>}
      </Text>
      {fileUpload && (
        <View style={{ paddingVertical: 10, width: "100%" }}>
          <UploadPDFButton
            title={"Upload File"}
            icon={icons.upload}
            style={{ backgroundColor: "#1f1a79", width: "60%" }}
            selectedFile={null}
            setSelectedFile={() => {}}
          ></UploadPDFButton>
        </View>
      )}
      {description !== "" && (
        <Text
          style={{
            color: "#b4c7d6",
            paddingVertical: 5,
            fontSize: 15,
            lineHeight: 22,
            fontWeight: 500,
          }}
        >
          {description}
        </Text>
      )}
      {answer && (
        <>
          <TextInput
            placeholder="Your Answer"
            placeholderTextColor={"#b4c7d6"}
            value={value}
            onChangeText={(val) => setValue(val)}
          ></TextInput>
          <View
            style={{ borderWidth: 0.5, borderColor: "#b4c7d6", width: "100%" }}
          ></View>
        </>
      )}
    </View>
  );
};

export const AssessmentCard = ({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) => {
  const progressPercentage =
    (data?.taskStatus?.inProgress / data.taskStatus.toComplete) * 100 + "%";

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push({
          pathname: "/(pastor-tabs)/assessments/cma-survey-page",
          params: { data: JSON.stringify(data) },
        });
      }}
      style={{
        width: "100%",
        backgroundColor: "#194F82",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#FFFFFF73",
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            maxWidth: 130,
            width: "100%",
            height: "100%",
            alignItems: "center",
          }}
        >
          <View style={{ position: "relative", width: "100%" }}>
            <View
              className=""
              style={{
                width: "100%",
                minHeight: "100%",
                maxHeight: 160,
                backgroundColor: "#00ABAE",
                borderWidth: 5,
                borderColor: "#BFFEFE",
                borderRadius: 15,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#001B4A",
                  fontSize: 40,
                  fontWeight: "800",
                }}
              >
                {data?.type}
              </Text>
              <View
                style={{
                  height: 2,
                  width: "80%",
                  backgroundColor: "white",
                  borderRadius: 1,
                  marginTop: -6,
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 9,
                  fontWeight: "800",
                  textAlign: "center",
                  marginTop: 8,
                  lineHeight: 18,
                }}
              >
                {data?.type === "CMA"
                  ? "CHURCH ASSESSMENT EVALUATION"
                  : "PASTORAL MINISTRY PROFILE"}
              </Text>
            </View>
          </View>
          {data?.completionDate && (
            <View className="mt-24" style={{ alignItems: "flex-start" }}>
              <Text
                style={{
                  color: data?.status === "Due" ? "yellow" : "white",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                Due:{data?.completionDate}
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginLeft: 10, flex: 1, gap: 4 }}>
          <View>
            <Text
              style={{ color: "white", fontSize: 16, fontWeight: "600" }}
              ellipsizeMode="tail"
            >
              {data?.title}
            </Text>
          </View>
          <Text
            className="py-2"
            style={{ color: "#F4F2F2B5", fontWeight: "400", fontSize: 14 }}
          >
            {data?.description}
          </Text>
          <TouchableOpacity
            style={{
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#FFFFFF33",
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginVertical: 4,
              borderRadius: 8,
              maxWidth: "70%",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "white",
                fontWeight: "500",
              }}
            >
              Status{" "}
              <Text
                style={{
                  color: "white",
                  fontWeight: "900",
                  alignItems: "center",
                }}
              >
                •
              </Text>{" "}
              <Text
                style={{
                  color: data?.status == "Due" ? "yellow" : "white",
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {data?.status}
              </Text>
            </Text>
          </TouchableOpacity>
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "white",
              }}
            >
              Completed on :{data?.completionDate}
            </Text>
          </View>

          {(data && data?.status === "Not Started") ||
          data?.status === "Due" ? (
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                alignItems: "center",
                borderRadius: 10,
                paddingVertical: 7,
                marginVertical: 12,
                width: "70%",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#001FC1",
                  fontWeight: 600,
                  paddingBottom: 4,
                  lineHeight: 0,
                }}
              >
                Start Now
              </Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
      </View>
      {data?.type === "PMP" &&
        (data?.status === "Submitted" ? (
          <LinearGradient
            colors={["#B83AF3", "#21B6E9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 10,
              padding: 2,
              marginVertical: 12,
              width: "95%",
              marginHorizontal: "auto",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#233A6F",
                borderRadius: 8,
                alignItems: "center",
                paddingVertical: 7,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                alignContent: "center",
              }}
            >
              <Text
                className="py-1"
                style={{
                  fontSize: 16,
                  color: "yellow",
                  fontWeight: "600",
                  lineHeight: 20,
                }}
              >
                Customized Development Plans
              </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("Icon clicked!");
                }}
              >
                <Image
                  source={require("../../assets/icons/threeDots.png")}
                  style={{ width: 24, height: 24, resizeMode: "contain" }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </LinearGradient>
        ) : data?.status === "Completed" ? (
          <TouchableOpacity
            className="mx-auto"
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              alignItems: "center",
              paddingVertical: 7,
              marginVertical: 12,
              width: "95%",
            }}
          >
            <Text
              className="py-1"
              style={{
                fontSize: 16,
                color: "#001FC1",
                fontWeight: "600",
                lineHeight: 20,
              }}
            >
              Customized Development Plans
            </Text>
          </TouchableOpacity>
        ) : (
          <></>
        ))}
    </TouchableOpacity>
  );
};

export const ProgressCard = ({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) => {
  const progressPercentage =
    (data?.taskStatus?.inProgress / data.taskStatus.toComplete) * 100 + "%";

  return (
    <TouchableOpacity
      onPress={() =>
        data.subPhase
          ? navigation.push({
              pathname: "/(pastor-tabs)/roadmap/sub-phases",
              params: { data: JSON.stringify(data) },
            })
          : navigation.push({
              pathname: "/(pastor-tabs)/roadmap/detailed-roadmap",
              params: { data: JSON.stringify(data) },
            })
      }
      style={{
        width: "100%",
        backgroundColor: "#194F82",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#FFFFFF73",
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: 110,
            height: "100%",
            alignItems: "center",
            padding: 8,
          }}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={data?.image}
              style={{ width: 110, height: 100, borderRadius: 12 }}
            />
          </View>
          <View className="mt-2" style={{ alignItems: "flex-start" }}>
            <Text style={{ color: "white", fontWeight: "300", fontSize: 11 }}>
              {data?.time}
            </Text>
          </View>
        </View>
        <View style={{ marginLeft: 20, flex: 1, gap: 10 }}>
          <View>
            <Text
              style={{ color: "white", fontSize: 16, fontWeight: "600" }}
              ellipsizeMode="tail"
            >
              {data?.title}
            </Text>
          </View>
          {data?.description && (
            <Text
              className="py-2"
              style={{ color: "#F4F2F2B5", fontWeight: "400", fontSize: 14 }}
            >
              {data?.description}
            </Text>
          )}
          {data.status && data.type !== "assessment" && (
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "#FFFFFF33",
                paddingVertical: 4,
                paddingHorizontal: 8,
                marginVertical: 4,
                borderRadius: 10,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "white",
                  fontWeight: "500",
                }}
              >
                Status{" "}
                <Text
                  style={{
                    color: "white",
                    fontWeight: "900",
                    alignItems: "center",
                  }}
                >
                  •
                </Text>{" "}
                <Text
                  style={{
                    color: data?.status == "Due" ? "yellow" : "white",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {data?.status}
                </Text>
              </Text>
            </TouchableOpacity>
          )}
          {data.type === "assessment" && data.completed && (
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "#FFFFFF33",
                paddingVertical: 4,
                paddingHorizontal: 8,
                marginVertical: 4,
                borderRadius: 10,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  color: "yellow",
                  fontSize: 12,
                  fontWeight: "500",
                  alignSelf: "flex-start",
                }}
              >
                {data?.completed}
              </Text>
            </TouchableOpacity>
          )}
          {data?.progress === "1" && (
            <View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <View
                  style={{
                    backgroundColor: "black",
                    borderRadius: 10,
                    width: "80%",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      width: "70%",
                      height: 8,
                      borderRadius: 10,
                    }}
                  ></View>
                </View>
                <Text className="text-white text-xs leading-[18px] font-medium">
                  {" "}
                  6/8
                </Text>
              </View>
              <Text className="font-medium text-sm leading-[18px] text-[#F4F2F2B5]">
                Tasks Completed
              </Text>
            </View>
          )}
          {data.completedTime && (
            <Text className="font-medium text-sm leading-[18px] text-[#F4F2F2B5]">
              Completed on : {data?.completedTime}
            </Text>
          )}
          {data?.dueDate && (
            <Text
              style={{
                color: "#F4F2F2B5",
                fontSize: 12,
                fontWeight: "500",
                textAlign: "right",
              }}
              ellipsizeMode="tail"
            >
              Due :{data?.dueDate}
            </Text>
          )}
          {data?.submittedDate && (
            <Text
              style={{
                color: "#F4F2F2B5",
                fontSize: 12,
                fontWeight: "500",
                textAlign: "right",
              }}
              ellipsizeMode="tail"
            >
              Submitted :{data?.submittedDate}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Appointment Card Styling

  appointmentBox: {
    width: "100%",
    backgroundColor: "#14517d", // customBlueOne
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)", // customWhiteEighty
    marginBottom: 16,
  },
  appointmentImage: {
    width: "100%",
    height: 100,
    borderRadius: 16,
    flex: 1,
  },
  appointmentDetails: {
    marginLeft: 10,
    flex: 1,
    gap: 4,
  },
  dateTimeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "AlbertSans-Medium",
  },
  timeText: {
    color: "#FFC107", // customYellow
    fontFamily: "AlbertSans-Medium",
    marginHorizontal: 4,
  },
  mentorInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mentorNameText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "AlbertSans-SemiBold",
    marginTop: 4,
  },
  modeText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },
  modeBoldText: {
    textDecorationLine: "underline",
    fontFamily: "AlbertSans-SemiBold",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 8,
  },
  iconStyle: {
    width: 18,
    height: 18,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // customWhiteTwenty
    marginHorizontal: 16,
    marginTop: 32,
  },

  // RoadMap Card Styling

  roadmapItem: {
    backgroundColor: "#124b74",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)", // customWhiteEighty
  },
  leftContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roadmapText: {
    color: "#FFFFFF", // white
    fontFamily: "AlbertMedium",
    fontSize: 14,
    paddingHorizontal: 4,
  },
  statusText: {
    color: "#FFD700", // customYellow
    fontFamily: "AlbertMedium",
    fontSize: 14,
    padding: 8,
  },
  statusTextWhite: {
    color: "#FFFFFF", // white
    fontFamily: "AlbertMedium",
    fontSize: 12,
    padding: 8,
  },
  arrowButton: {
    padding: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // customWhiteTwenty
    marginHorizontal: 16,
    marginTop: 32,
  },

  // Card Box styling

  gradientContainer: {
    height: 100,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16, // rounded-xl
    borderWidth: 1,
    borderColor: "#FFFFFF", // white
    padding: 10,
    width: "50%",
  },
  icon: {
    width: 28,
    height: 28,
  },

  //   Mentor Card Styling

  mentorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A4882", // bg-customBlueFour
    paddingVertical: 12, // py-2
    borderRadius: 8, // rounded-lg
    borderWidth: 1, // border
    borderColor: "rgba(255, 255, 255, 0.8)", // border-customWhiteEighty
  },
  mentorDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mentorImage: {
    width: 40,
    height: 40,
    borderRadius: 2, // rounded-md
    marginHorizontal: 8, // mx-2
  },
  mentorText: {
    color: "#FFFFFF", // text-white
    fontFamily: "AlbertMedium", // font-albertMedium
    fontSize: 12, // text-sm
    paddingHorizontal: 4, // px-1
  },
  mentorIconContainer: {
    flexDirection: "row",
    gap: 14, // gap-1
    paddingHorizontal: 8, // px-2
  },
  MentorIcon: {
    width: 18,
    height: 18,
  },

  // Notification Card Styling

  NotificationBox: {
    width: "100%",
    backgroundColor: "#14517d", // customBlueOne
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)", // customWhiteEighty
  },

  // ListCard styling

  overlay: {
    paddingVertical: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    color: "#176192",
    fontSize: 14,
    paddingLeft: 8,
    paddingVertical: 8,
  },
  // separator: {
  //   borderWidth: 0.4,
  //   marginVertical: 4,
  // },
});
