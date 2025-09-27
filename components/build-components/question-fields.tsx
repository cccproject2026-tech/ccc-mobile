import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

interface Question {
  id: string;
  question: string;
  placeholder?: string;
  required?: boolean;
}

interface AnswerQuestionProps {
  questions: Question[];
  onAnswersChange?: (answers: { [key: string]: string }) => void;
  onSubmit?: (answers: { [key: string]: string }) => void;
  submitButtonText?: string;
  showSubmitButton?: boolean;
  wrapperClass?: string;
}

export default function AnswerQuestion({
  questions,
  onAnswersChange,
  onSubmit,
  wrapperClass,
}: AnswerQuestionProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const handleAnswerChange = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    onAnswersChange?.(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit?.(answers);
  };

  const isFormValid = () => {
    const requiredQuestions = questions.filter((q) => q.required);
    return requiredQuestions.every((q) => answers[q.id]?.trim());
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      className={`${wrapperClass}`}
    >
      <View>
        <Text className="text-white font-semibold leading-[22px] text-[17px] mb-4">
          Please Answer these Questions :
        </Text>
      </View>
      {questions.map((question, index) => (
        <View
          key={question.id}
          style={styles.questionContainer}
          className="border-white/20"
        >
          <Text style={styles.questionText}>
            {index + 1}. {question.question}
          </Text>

          <TextInput
            className="underline"
            style={[styles.answerInput]}
            placeholder=""
            placeholderTextColor="#94A3B8"
            value={answers[question.id] || ""}
            onChangeText={(text) => handleAnswerChange(question.id, text)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {!answers[question.id] && (
            <View
              className="bg-white/20"
              style={{
                position: "absolute",
                left: 13,
                right: 13,
                bottom: "26%",
                height: 1,
              }}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 97,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    marginBottom: 15,
    lineHeight: 22,
  },
  answerInput: {
    padding: 12,
    fontSize: 16,
    color: "white",
    minHeight: 40,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
