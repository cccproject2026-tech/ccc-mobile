import { icons } from "@/constants/images";
import React from "react";
import { Image, Text, View } from "react-native";

interface Query {
  id: string;
  avatar: any;
  user: string;
  timestamp: string;
  question: string;
  answeredBy: string;
  answerTimestamp: string;
  answeredByRole: string;
  answer: string;
}
export default function QueriesCard({
  answeredQueries,
  waiting = false,
}: {
  answeredQueries: Query[];
  waiting?: boolean;
}) {
  return (
    <View className="px-4 mt-5">
      {answeredQueries.map((query) => (
        <View key={query.id}>
          {}
          <View className="mb-5">
            <View className="flex-row items-center mb-3">
              <Image
                source={query.avatar}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <View className="flex-1 items-start gap-1">
                  <Text className="text-white text-base font-semibold">
                    {query.user}
                  </Text>
                  <Text className="text-white/70 text-xs">
                    {query.timestamp}
                  </Text>
                </View>
              </View>
            </View>
            <Text className="text-white/80 text-base leading-6 mt-2 font-medium">
              {query.question}
            </Text>
          </View>

          {}
          <View className="bg-[#1A4882] rounded-2xl p-4 mb-5 border-white/30 border-[1px]">
            {!waiting ? (
              <>
                <View className="flex-row items-center mb-3">
                  <Image
                    source={query.avatar}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white text-base font-medium">
                        {query.answeredBy}
                      </Text>
                      <Text className="text-white/70 text-xs">
                        {query.answerTimestamp}
                      </Text>
                    </View>
                    <Text className="text-white/80 text-sm">
                      {query.answeredByRole}
                    </Text>
                  </View>
                </View>
                <Text className="text-white text-base leading-6 font-medium">
                  {query.answer}
                </Text>
              </>
            ) : (
              <View className="h-28">
                <View className="bg-[#1A4882] h-24 rounded-2xl flex-row gap-3 px-4">
                  <Image
                    source={icons.loadingIcon}
                    className="w-[25px] h-[25px]"
                  />
                  <Text className="text-[#FFFFFFCC] text-[16px] font-medium">
                    Waiting for response
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View className="h-[0.5px] bg-white/30 my-4" />
        </View>
      ))}
    </View>
  );
}
