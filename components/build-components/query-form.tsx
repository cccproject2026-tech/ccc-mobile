import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const QueryForm = () => {
  const [queryText, setQueryText] = useState("");

  const handleSubmit = () => {
    // Your submit logic here
    console.log("Query submitted:", queryText);
  };

  return (
    <>
      <LinearGradient
        colors={["#yourGradientStart", "#yourGradientEnd"]}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <ScrollView className="flex-1">
            <View className="px-6 mt-7 flex-1">
              <Text className="text-white text-base font-normal mb-2.5">
                Submit your question here.
              </Text>

              <View className="border border-white/60 rounded-2xl p-5 min-h-[200px] bg-[#1A4B81]">
                <TextInput
                  className="text-white text-base flex-1 min-h-[100px]"
                  placeholder=""
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline={true}
                  value={queryText}
                  onChangeText={setQueryText}
                  textAlignVertical="top"
                />
                <View className="flex-row justify-end">
                  <Text className="text-white/70 text-sm">(250 Words)</Text>
                </View>
              </View>

              <View className="flex-row justify-end mt-2">
                <TouchableOpacity className="p-1">
                  <View className="w-[30px] h-[30px] rounded-md justify-center items-center border-2 border-white/40">
                    <Ionicons name="add-outline" size={24} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              <View className="h-[0.5px] bg-white/30 my-4" />

              <View className="items-center mt-5">
                <TouchableOpacity
                  className="bg-white px-20 py-3 rounded-xl min-w-[280px]"
                  onPress={handleSubmit}
                >
                  <Text className="text-[#1A4882] text-base font-semibold text-center">
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default QueryForm;
