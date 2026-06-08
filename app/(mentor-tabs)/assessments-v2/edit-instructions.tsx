  import { AssessmentMainCard } from "@/components/build-components";
import AssessmentEditedSuccessModal from "@/components/build-components/AssessmentEditedSuccessModal";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { useAssessment, useUpdateAssessmentInstructions } from "@/hooks/assessments";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AppGradientBackground from "@/components/layout/AppGradientBackground";

interface Instruction {
  id: string;
  text: string;
}

export default function EditInstructionsPage() {
  const { bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;

  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  
  const { data: assessment, isLoading: loading, error: queryError } = useAssessment(assessmentId);
  const updateInstructionsMutation = useUpdateAssessmentInstructions();

  
  useEffect(() => {
    if (assessment?.instructions) {
      setInstructions(
        assessment.instructions.map((text, index) => ({
          id: `${index}-${Date.now()}`,
          text: text,
        }))
      );
    }
  }, [assessment]);

  const error = queryError ? "Failed to load assessment. Please try again." : null;

  
  const inferType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("cma") || nameLower.includes("church")) {
      return "CMA";
    }
    return "PMP";
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { id: Date.now().toString(), text: "" },
    ]);
  };

  const updateInstruction = (id: string, text: string) => {
    setInstructions(
      instructions.map((inst) => (inst.id === id ? { ...inst, text } : inst))
    );
  };

  const removeInstruction = (id: string) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((inst) => inst.id !== id));
    } else {
      Alert.alert("Error", "At least one instruction is required.");
    }
  };

  const handleSaveChanges = () => {
    
    const validInstructions = instructions
      .map((inst) => inst.text.trim())
      .filter((text) => text.length > 0);

    if (validInstructions.length === 0) {
      Alert.alert("Error", "Please add at least one instruction.");
      return;
    }

    updateInstructionsMutation.mutate(
      {
        assessmentId,
        instructions: validInstructions,
      },
      {
        onSuccess: () => {
          setShowSuccessModal(true);
        },
        onError: (err) => {
          console.error("Failed to update instructions:", err);
          Alert.alert(
            "Error",
            "Failed to update instructions. Please try again."
          );
        },
      }
    );
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleEditSections = () => {
    
    
    
    
    
    console.log("Edit sections");
  };

  if (loading) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", marginTop: 12 }}>
              Loading assessment...
            </Text>
          </View>
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  if (error || !assessment) {
    return (
      <AppGradientBackground style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ color: "#FF6B6B", fontSize: 16, textAlign: "center" }}>
              {error || "Assessment not found"}
            </Text>
          </View>
        </SafeAreaView>
      </AppGradientBackground>
    );
  }

  const assessmentType = inferType(assessment.name);

  return (
    <>
      <AppGradientBackground style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <TopBar
            userName="John Doe"
            showUserName
            notifications={3}
            role="mentor"
          />

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottom + 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            {}
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} hitSlop={10}>
                <Ionicons name="arrow-back" size={24} color="#E2E8F0" />
              </Pressable>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{assessment.name}</Text>
                <Text style={styles.headerSubtitle}>Assessment</Text>
              </View>
            </View>

            {}
            <View style={styles.cardContainer}>
              <AssessmentMainCard
                type={assessmentType}
                dueDate={undefined}
                dueDateClass="text-yellow-500"
              />
              <Pressable style={styles.editIconButton}>
                <LinearGradient
                  colors={["#1E366F", "#3A68D5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.editIconButtonGradient}
                >
                  <Ionicons name="pencil" size={20} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>

            {}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText} numberOfLines={2}>
                {assessment.description ||
                  "This Assessment is about Lorem ipsum dolor sit amet, consectet"}
              </Text>
            </View>

            {}
            <View style={styles.instructionsSection}>
              <View style={styles.instructionsHeader}>
                <Text style={styles.instructionsTitle}>
                  Assessment Instructions
                </Text>
                <Pressable
                  onPress={() => setShowInstructions(!showInstructions)}
                  hitSlop={8}
                >
                  <View
                    style={[
                      styles.checkbox,
                    ]}
                  >
                    {showInstructions && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </Pressable>
              </View>

              {showInstructions && (
                <View style={styles.instructionsList}>
                  {instructions.map((inst, index) => (
                    <View key={inst.id} style={styles.instructionItem}>
                      <View style={styles.instructionBullet} />
                      <TextInput
                        style={styles.instructionInput}
                        placeholder={`Instruction ${index + 1}`}
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={inst.text}
                        onChangeText={(text) => updateInstruction(inst.id, text)}
                        multiline
                      />
                      {instructions.length > 1 && (
                        <Pressable
                          onPress={() => removeInstruction(inst.id)}
                          hitSlop={8}
                          style={styles.removeButton}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#FF6B6B"
                          />
                        </Pressable>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addInstructionButton}
                    onPress={addInstruction}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.addInstructionText}>Instruction</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveChanges}
                disabled={updateInstructionsMutation.isPending}
              >
                {updateInstructionsMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
              
            </View>
            <TouchableOpacity
              style={styles.editSectionsButton}
              onPress={handleEditSections}
            >
              <Text style={styles.editSectionsButtonText}>
                Edit Sections {">>"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>

        {}
        <AssessmentEditedSuccessModal
          visible={showSuccessModal}
          onClose={handleSuccessModalClose}
        />
      </AppGradientBackground>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#CFE7F5",
    fontSize: 12,
    marginTop: 2,
  },
  cardContainer: {
    position: "relative",
    marginHorizontal: 16,
    marginTop: 16,
  },
  editIconButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  editIconButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  descriptionText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
  instructionsSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  instructionsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FFFFFF",
  },
  instructionsList: {
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  instructionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginTop: 6,
    flexShrink: 0,
  },
  instructionInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    padding: 12,
  },
  removeButton: {
    padding: 4,
    flexShrink: 0,
  },
  addInstructionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    padding: 12,
  },
  addInstructionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 32,
    marginTop: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#155C93",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#1B2B60",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  editSectionsButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#7C3AED",
    alignSelf: "flex-end",
    margin: 16,
    
  },
  editSectionsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

