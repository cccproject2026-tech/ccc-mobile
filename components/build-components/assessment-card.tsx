import React from "react";
import { Text, View } from "react-native";

export default function AssessmentCard({
  type = `PMP`,
  dueDate = ``,
  dueDateClass = ``,
  wrapperClass = ``,
  submitDate = ``,
}: {
  type?: string | undefined;
  dueDate?: string | undefined;
  dueDateClass?: string | undefined;
  wrapperClass?: string | undefined;
  submitDate?: string | undefined;
}) {
  return (
    <View>
      <View
        style={{
          marginVertical: 10,
          paddingHorizontal: 16,
          width: "100%",
        }}
        className={wrapperClass}
      >
        <View
          className=""
          style={{
            width: "100%",
            minHeight: "100%",
            maxHeight: 180,
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
              fontSize: 70,
              fontWeight: "800",
            }}
          >
            {type}
          </Text>
          <View
            style={{
              height: 2,
              width: "50%",
              backgroundColor: "white",
              borderRadius: 1,
              marginTop: -6,
            }}
          />
          <Text
            style={{
              color: "white",
              fontSize: 15,
              fontWeight: "800",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 22,
              maxWidth: "50%",
            }}
          >
            {type === "CMA"
              ? "CHURCH ASSESSMENT EVALUATION"
              : "PASTORAL MINISTRY PROFILE"}
          </Text>
        </View>
      </View>
      <View className="flex flex-row justify-between">
        <View className="mt-10 px-5">
          {dueDate && (
            <Text
              className={`text-xs leading-[18px] font-bold ${dueDateClass}`}
            >
              Due :{dueDate}
            </Text>
          )}
        </View>
        <View className="mt-10 px-5">
          {submitDate && (
            <Text
              className={`text-xs leading-[18px] font-bold ${dueDateClass}`}
            >
              Submitted :{submitDate}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
