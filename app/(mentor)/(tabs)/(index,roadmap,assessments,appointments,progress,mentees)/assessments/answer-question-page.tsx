import { QuestionFields } from "@/components/build-components";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import AssessmentFlowHeader from "@/components/mentor";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { getFontSize, getSpacing } from "@/utils/responsive";
import { router, Stack } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import KeyboardSafeContainer from "@/components/layout/KeyboardSafeContainer";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnswerQuestionPage() {
  const questions = [
    {
      id: "membership",
      question: "What is your current church membership?",
      placeholder: "Enter your church membership details...",
      required: true,
    },
    {
      id: "active_members",
      question: "How many active members do you have currently?",
      placeholder: "Enter number of active members...",
      required: true,
    },
    {
      id: "baptisms",
      question: "How many baptisms in the last two years?",
      placeholder: "Enter number of baptisms...",
      required: false,
    },
  ];

  const handleAnswersChange = (answers: unknown) => {
    console.log("Answers updated:", answers);
  };

  const handleSubmit = (answers: unknown) => {
    console.log("Form submitted:", answers);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground style={styles.flex}>
        <SafeAreaView style={styles.scrollContainer}>
          <AssessmentFlowHeader title="Church Assessment Evaluation (CMA)" />

          <KeyboardSafeContainer
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
          >
            <ScrollView
              contentContainerStyle={styles.innerScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <QuestionFields
                questions={questions}
                onAnswersChange={handleAnswersChange}
                onSubmit={handleSubmit}
                wrapperClass="pt-4"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() =>
                    router.push("/(mentor)/assessments/survey-form" as any)
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardSafeContainer>
        </SafeAreaView>
      </AppGradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: getSpacing(32),
  },
  innerScroll: {
    paddingBottom: 80,
    paddingHorizontal: getSpacing(16),
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: getSpacing(24),
    gap: getSpacing(16),
    width: "80%",
    alignSelf: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: getSpacing(14),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: getFontSize(16),
    fontWeight: "600",
    color: roadmapTheme.textActive,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingVertical: getSpacing(14),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  submitButtonText: {
    fontSize: getFontSize(16),
    fontWeight: "600",
    color: "#fff",
  },
});
