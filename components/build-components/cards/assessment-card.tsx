import { Assessment } from "@/lib/assessments/types";
import { getFontSize, getIconSize, getSpacing, isIOS, moderateScale, verticalScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function AssessmentCard({
  data,
  onPress,
  onMeetingPress,
  onMeetingIconPress,
  onCustomizedPress,
  onMenuPress,
}: {
  data: Assessment;
  onPress?: (data: Assessment) => void;
  onMeetingPress?: () => void;
  onMeetingIconPress?: () => void;
  onCustomizedPress?: () => void;
  onMenuPress?: () => void;
}) {
  // iOS compression factors
  const fontCompress = isIOS ? 0.92 : 1;
  const spacingCompress = isIOS ? 0.85 : 1;
  const imageCompress = isIOS ? 0.92 : 1;
  const cardCompress = isIOS ? 0.96 : 1;

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: '#194F82',
        borderRadius: moderateScale(10 * cardCompress),
        paddingVertical: getSpacing(14 * spacingCompress),
        paddingHorizontal: getSpacing(14 * spacingCompress), // Add more horizontal padding
        marginVertical: getSpacing(2.5 * spacingCompress),
        borderWidth: 1,
        borderColor: '#FFFFFF73',
        position: 'relative',
      }}
    >
      {/* Three dots menu button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onMenuPress?.();
        }}
        style={{
          position: 'absolute',
          top: getSpacing(14 * spacingCompress),
          right: getSpacing(14 * spacingCompress),
          zIndex: 10,
          padding: getSpacing(4 * spacingCompress),
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={getIconSize(20)} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onPress && onPress(data)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
        <View style={{ width: moderateScale(130 * imageCompress), alignItems: 'center' }}>
          <View
            style={{
              width: '100%',
              height: verticalScale(138 * imageCompress),
              backgroundColor: '#00ABAE',
              borderWidth: moderateScale(5 * cardCompress),
              borderColor: '#BFFEFE',
              borderRadius: moderateScale(15 * cardCompress),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#001B4A',
                fontSize: getFontSize(40 * fontCompress),
                fontWeight: '800',
              }}
            >
              {data?.type}
            </Text>
            <View
              style={{
                height: moderateScale(0.5 * cardCompress),
                width: '80%',
                backgroundColor: 'white',
                borderRadius: moderateScale(1 * cardCompress),
                marginTop: moderateScale(-6 * cardCompress),
              }}
            />
            <Text
              style={{
                color: 'white',
                fontSize: getFontSize(9 * fontCompress),
                fontWeight: '800',
                textAlign: 'center',
                marginTop: getSpacing(8 * spacingCompress),
                lineHeight: getFontSize(18 * fontCompress),
                paddingHorizontal: getSpacing(4 * spacingCompress),
              }}
            >
              {data?.type === 'CMA'
                ? 'CHURCH ASSESSMENT EVALUATION'
                : 'PASTORAL MINISTRY PROFILE'}
            </Text>
          </View>
          {data?.dueDate && (
            <View style={{ alignItems: 'center', width: '100%', marginTop: getSpacing(3 * spacingCompress) }}>
              <Text
                style={{
                  fontSize: getFontSize(12 * fontCompress),
                  fontWeight: '700',
                  color: data?.status === 'Due' ? '#EAB308' : 'white',
                }}
              >
                Due : {data?.dueDate}
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginLeft: getSpacing(10 * spacingCompress), flex: 1 }}>
          <View>
            <Text
              style={{
                color: 'white',
                fontSize: getFontSize(15 * fontCompress),
                lineHeight: getFontSize(20 * fontCompress),
                fontWeight: '600',
              }}
              ellipsizeMode="tail"
            >
              {data?.title}
            </Text>
          </View>
          <Text
            style={{
              paddingVertical: getSpacing(6 * spacingCompress),
              color: '#F4F2F2B5',
              fontSize: getFontSize(13 * fontCompress),
            }}
          >
            {data?.description}
          </Text>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#FFFFFF33',
              paddingVertical: getSpacing(3 * spacingCompress),
              paddingHorizontal: getSpacing(7 * spacingCompress),
              marginVertical: getSpacing(3 * spacingCompress),
              borderRadius: moderateScale(8 * cardCompress),
              maxWidth: '70%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: getFontSize(13 * fontCompress), fontWeight: '500', color: 'white' }}>
              Status{' '}
              <Text style={{ fontWeight: '900', color: 'white' }}>•</Text>{' '}
              <Text
                style={{
                  fontSize: getFontSize(13 * fontCompress),
                  fontWeight: '500',
                  color: data?.status === 'Due' ? '#EAB308' : 'white',
                }}
              >
                {data?.status}
              </Text>
            </Text>
          </TouchableOpacity>
          {data?.completionDate && (
            <View>
              <Text style={{ fontSize: getFontSize(13 * fontCompress), fontWeight: '500', color: 'white' }}>
                Completed on : {data?.completionDate}
              </Text>
            </View>
          )}

          {((data?.status === 'Not Started') || (data?.status === 'Due')) && (
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                alignItems: 'center',
                borderRadius: moderateScale(10 * cardCompress),
                paddingVertical: getSpacing(4 * spacingCompress),
                marginVertical: getSpacing(8 * spacingCompress),
                width: '70%',
              }}
              onPress={() => onPress && onPress(data)}
            >
              <Text
                style={{
                  fontSize: getFontSize(15 * fontCompress),
                  color: '#001FC1',
                  fontWeight: '600',
                  paddingBottom: getSpacing(3 * spacingCompress),
                  lineHeight: getFontSize(20 * fontCompress),
                }}
              >
                Start Now
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {data?.type === 'PMP' && (
        <View style={{
          paddingTop: 5
        }}>
          {data?.status === 'Submitted' && data?.meetingDate ? (
            <LinearGradient
              colors={['#B83AF3', '#21B6E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: moderateScale(10 * cardCompress),
                padding: moderateScale(2 * cardCompress),
                marginVertical: getSpacing(8 * spacingCompress),
                width: '95%',
                alignSelf: 'center',
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: '#233A6F',
                  borderRadius: moderateScale(8 * cardCompress),
                  alignItems: 'center',
                  paddingVertical: getSpacing(5 * spacingCompress),
                  paddingHorizontal: getSpacing(14 * spacingCompress), // Add horizontal padding
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
                onPress={onMeetingPress}
              >
                <Text
                  style={{
                    fontSize: getFontSize(14 * fontCompress),
                    color: '#EAB308',
                    fontWeight: '600',
                    lineHeight: getFontSize(18 * fontCompress),
                    paddingVertical: getSpacing(3 * spacingCompress),
                  }}
                >
                  Meeting Scheduled on {data?.meetingDate}
                </Text>
                <TouchableOpacity onPress={onMeetingIconPress}>
                  <Image
                    source={require("../../../assets/icons/threeDots.png")}
                    style={{
                      width: getIconSize(20 * imageCompress),
                      height: getIconSize(20 * imageCompress),
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </LinearGradient>
          ) : data?.status === 'Completed' ? (
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                backgroundColor: 'white',
                borderRadius: moderateScale(10 * cardCompress),
                alignItems: 'center',
                paddingVertical: getSpacing(5 * spacingCompress),
                paddingHorizontal: getSpacing(14 * spacingCompress), // Add horizontal padding
                marginVertical: getSpacing(8 * spacingCompress),
                width: '95%',
              }}
              onPress={onCustomizedPress}
            >
              <Text
                style={{
                  paddingVertical: getSpacing(3 * spacingCompress),
                  fontSize: getFontSize(14 * fontCompress),
                  color: '#001FC1',
                  fontWeight: '600',
                  lineHeight: getFontSize(18 * fontCompress),
                }}
              >
                Customized Development Plans
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
      </TouchableOpacity>
    </View>
  );
}