import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import CustomDatePicker from "@/components/build-components/date-picker";
import AddFieldSheet, {
  AddFieldSheetRef,
  FieldType,
} from "@/components/director/forms/AddFieldSheet";
import FormCheckBox from "@/components/director/forms/FormCheckBox";
import { usePhaseCreation } from "@/context/PhaseCreationContext";
import { useCreateRoadmap } from "@/hooks/roadmaps";
import { useCreateNestedRoadmap } from "@/hooks/roadmaps/useCreateNestedRoadmap";
import { useRoadmap } from "@/hooks/roadmaps/useRoadmaps";
import { useUpdateRoadmap } from "@/hooks/roadmaps/useUpdateRoadmap";
import { CreateRoadmapRequest, RoadmapExtra, UpdateRoadmapRequest } from "@/lib/roadmaps/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RoadmapFormScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const addFieldSheetRef = useRef<AddFieldSheetRef>(null);
  const { state, updateRoadmap, clearPhaseData } = usePhaseCreation();
  const createRoadmapMutation = useCreateRoadmap();
  const createNestedRoadmapMutation = useCreateNestedRoadmap();
  const updateRoadmapMutation = useUpdateRoadmap();

  const isPhaseFlow = params.isPhaseFlow === 'true';
  const isNestedRoadmap = params.isNestedRoadmap === 'true';
  const isEditMode = params.isEditMode === 'true';
  const isNestedEdit = params.isNestedEdit === 'true';
  const roadmapId = params.roadmapId as string;
  const parentRoadmapId = params.parentRoadmapId as string;
  const nestedRoadmapId = params.nestedRoadmapId as string;
  const parentPhase = params.phase as string;

  // Fetch roadmap data if in edit mode
  const { data: editRoadmapData, isLoading: isLoadingEditRoadmap } = useRoadmap(
    (isEditMode && roadmapId) || (isNestedEdit && parentRoadmapId) ? (isNestedEdit ? parentRoadmapId : roadmapId) : undefined
  );

  // Get roadmap data from context if in phase flow, otherwise from params
  const roadmapData = isPhaseFlow && state.currentRoadmap ? {
    name: state.currentRoadmap.name || "",
    subheading: state.currentRoadmap.subheading || "",
    completionTime: state.currentRoadmap.completionTime || "",
    selectedDivision: state.currentRoadmap.selectedDivision || "",
    bannerImage: state.currentRoadmap.bannerImage || null,
  } : {
    name: (params.name as string) || "",
    subheading: (params.subheading as string) || "",
    completionTime: (params.completionTime as string) || "",
    selectedDivision: (params.selectedDivision as string) || "",
    bannerImage: (params.bannerImage as string) || null,
  };

  const [formData, setFormData] = useState({
    churchVerbiage: "",
    descriptionVerbiage: "",
    customFields: [] as any[],
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  const validateForm = () => {
    const valid = !!(
      formData.churchVerbiage.trim() && formData.descriptionVerbiage.trim()
    );
    setIsFormValid(valid);
    return valid;
  };

  React.useEffect(() => {
    validateForm();
  }, [formData.churchVerbiage, formData.descriptionVerbiage]);

  // Transform extras back to customFields format for edit mode
  const transformExtrasToFields = (extras: RoadmapExtra[]): any[] => {
    const fields: any[] = [];
    let fieldIndex = 0;

    extras.forEach((extra) => {
      const fieldId = `field_${Date.now()}_${fieldIndex++}`;
      
      switch (extra.type) {
        case "TEXT_AREA":
          fields.push({
            id: fieldId,
            type: "textarea",
            label: extra.name,
            placeholder: extra.placeHolder || "",
            buttonName: extra.buttonName || "",
          });
          break;
        case "TEXT_FIELD":
          fields.push({
            id: fieldId,
            type: "text",
            label: extra.name,
            placeholder: extra.placeHolder || "",
            buttonName: extra.buttonName || "",
          });
          break;
        case "CHECKBOX":
          fields.push({
            id: fieldId,
            type: "checkbox",
            label: extra.name,
            buttonName: extra.haveButton ? extra.buttonName : "",
          });
          break;
        case "DATE_PICKER":
          const dateField: any = {
            id: fieldId,
            type: "datepicker",
            label: extra.name,
            date: extra.date ? new Date(extra.date) : new Date(),
            buttonName: extra.buttonName || "",
            allowPastorSelect: false,
            showOnCard: false,
          };
          if (extra.checkboxes) {
            extra.checkboxes.forEach((cb) => {
              if (cb.name === "Allow pastor to select Date") {
                dateField.allowPastorSelect = true;
              }
              if (cb.name === "Show date on info card") {
                dateField.showOnCard = true;
              }
            });
          }
          fields.push(dateField);
          break;
        case "UPLOAD":
          fields.push({
            id: fieldId,
            type: "upload",
            buttonLabel: extra.name,
          });
          break;
        case "ASSESSMENT":
          const assessmentField: any = {
            id: fieldId,
            type: "assessment",
            selectedAssessment: extra.name,
            buttonName: extra.buttonName || "",
            scheduleMeeting: false,
          };
          if (extra.checkboxes) {
            extra.checkboxes.forEach((cb) => {
              if (cb.name === "Schedule Meeting after the Assessment") {
                assessmentField.scheduleMeeting = true;
              }
            });
          }
          fields.push(assessmentField);
          break;
        case "SECTION":
          const sectionField: any = {
            id: fieldId,
            type: "section",
            name: extra.name,
            buttonName: extra.buttonName || "",
            showDuplicateButton: false,
          };
          if (extra.checkboxes) {
            extra.checkboxes.forEach((cb) => {
              if (cb.haveButton) {
                sectionField.showDuplicateButton = true;
                sectionField.buttonName = cb.buttonName || "";
              }
            });
          }
          // Add nested fields from sections
          if (extra.sections) {
            extra.sections.forEach((sectionExtra) => {
              const nestedFieldId = `field_${Date.now()}_${fieldIndex++}`;
              if (sectionExtra.type === "TEXT_FIELD") {
                fields.push({
                  id: nestedFieldId,
                  type: "text",
                  label: sectionExtra.name,
                  placeholder: sectionExtra.placeHolder || "",
                  parentSectionId: fieldId,
                });
              } else if (sectionExtra.type === "TEXT_AREA") {
                fields.push({
                  id: nestedFieldId,
                  type: "textarea",
                  label: sectionExtra.name,
                  placeholder: sectionExtra.placeHolder || "",
                  parentSectionId: fieldId,
                });
              } else if (sectionExtra.type === "DATE_PICKER") {
                fields.push({
                  id: nestedFieldId,
                  type: "datepicker",
                  label: sectionExtra.name,
                  date: sectionExtra.date ? new Date(sectionExtra.date) : new Date(),
                  parentSectionId: fieldId,
                });
              }
            });
          }
          fields.push(sectionField);
          break;
        case "TEXT_DISPLAY":
          fields.push({
            id: fieldId,
            type: "textarea",
            label: extra.name,
            placeholder: "",
          });
          break;
      }
    });

    return fields;
  };

  // Pre-fill form data when in edit mode
  React.useEffect(() => {
    if ((isEditMode || isNestedEdit) && editRoadmapData) {
      let roadmapToEdit = editRoadmapData;
      
      if (isNestedEdit && nestedRoadmapId && editRoadmapData.roadmaps) {
        roadmapToEdit = editRoadmapData.roadmaps.find(r => r._id === nestedRoadmapId) as any;
      }

      if (roadmapToEdit) {
        setFormData({
          churchVerbiage: roadmapToEdit.roadMapDetails || roadmapToEdit.description || "",
          descriptionVerbiage: roadmapToEdit.description || roadmapToEdit.roadMapDetails || "",
          customFields: roadmapToEdit.extras ? transformExtrasToFields(roadmapToEdit.extras as RoadmapExtra[]) : [],
        });
      }
    }
  }, [isEditMode, isNestedEdit, editRoadmapData, nestedRoadmapId]);

  const handleEditField = (fieldId: string) => {
    const field = formData.customFields.find((f) => f.id === fieldId);
    if (field) {
      setEditingFieldId(fieldId);
      addFieldSheetRef.current?.open(field.type, field);
    }
  };

  const handleDeleteField = (fieldId: string) => {
    const field = formData.customFields.find((f) => f.id === fieldId);

    // Check if it's a section with nested fields
    const hasNestedFields = formData.customFields.some(
      (f) => f.parentSectionId === fieldId
    );

    const deleteMessage = hasNestedFields
      ? "This section contains fields. Deleting it will also delete all nested fields. Continue?"
      : "Are you sure you want to delete this field?";

    Alert.alert("Delete Field", deleteMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setFormData((prev) => ({
            ...prev,
            customFields: prev.customFields.filter(
              (f) => f.id !== fieldId && f.parentSectionId !== fieldId
            ),
          }));
        },
      },
    ]);
  };

  const toggleFieldOption = (fieldId: string, optionKey: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) =>
        f.id === fieldId ? { ...f, [optionKey]: !f[optionKey] } : f
      ),
    }));
  };

  const handleDateChange = (fieldId: string, date: Date) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) =>
        f.id === fieldId ? { ...f, date } : f
      ),
    }));
  };

  const handleFieldInsert = (result: any) => {
    console.log("Field insert result:", result);
    const { type, data } = result;

    // If editing, update existing field
    if (editingFieldId) {
      setFormData((prev) => ({
        ...prev,
        customFields: prev.customFields.map((f) =>
          f.id === editingFieldId ? { ...f, ...data, type } : f
        ),
      }));
      setEditingFieldId(null);
      return;
    }

    // Create a new field based on type
    let newField: any = {
      id: `field_${Date.now()}`,
      type: type,
      parentSectionId: currentSectionId, // Track parent section
    };

    if (type === "text" || type === "textarea") {
      newField = {
        ...newField,
        label: data.placeholder || `New ${type}`,
        placeholder: data.placeholder || `Enter ${type}`,
        value: "",
      };
    } else if (type === "checkbox" || type === "radio") {
      newField = {
        ...newField,
        label: data.name || "New Field",
        choices: data.choices || [],
      };
    } else if (type === "section") {
      newField = {
        ...newField,
        name: data.name || "New Section",
        showDuplicateButton: data.addDuplicateButton || false,
        buttonName: data.buttonName || "",
      };
    } else if (type === "upload") {
      newField = {
        ...newField,
        buttonLabel: data.buttonName || "Upload Video / Pictures",
      };
    } else if (type === "datepicker") {
      newField = {
        ...newField,
        label: data.label || "Date",
        date: new Date(),
        allowPastorSelect: data.allowPastorSelect || false,
        showOnCard: data.showOnCard || false,
        buttonName: data.buttonName || "",
      };
    } else if (type === "assessment") {
      newField = {
        ...newField,
        selectedAssessment: data.selectedAssessment || null,
        buttonName: data.buttonName || "",
        scheduleMeeting: data.scheduleMeeting || false,
      };
    }

    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));

    // Reset section context after adding field
    setCurrentSectionId(null);
    console.log("Field added:", newField);
  };

  const handleMenuItemPress = (fieldType: FieldType) => {
    console.log("Menu item pressed with type:", fieldType);

    setMenuVisible(false);

    setTimeout(() => {
      console.log("Opening AddFieldSheet with type:", fieldType);
      addFieldSheetRef.current?.open(fieldType);
    }, 300);
  };

  const menuItems = [
    {
      id: "text",
      label: "Text Field",
      icon: "text-outline" as keyof typeof Ionicons.glyphMap,
      fieldType: "text" as FieldType,
    },
    {
      id: "textarea",
      label: "Text Area",
      icon: "document-text-outline" as keyof typeof Ionicons.glyphMap,
      fieldType: "textarea" as FieldType,
    },
    {
      id: "upload",
      label: "Upload Button",
      icon: "cloud-upload-outline" as keyof typeof Ionicons.glyphMap,
      fieldType: "upload" as FieldType,
    },
    {
      id: "datepicker",
      label: "Date Picker",
      icon: "calendar-outline" as keyof typeof Ionicons.glyphMap,
      fieldType: "datepicker" as FieldType,
    },
    {
      id: "section",
      label: "Section",
      icon: "grid-outline" as keyof typeof Ionicons.glyphMap,
      fieldType: "section" as FieldType,
    },
    {
      id: "assessment",
      label: "Assessment",
      icon: "document-outline" as keyof typeof Ionicons.glyphMap,
      fieldType: "assessment" as FieldType,
    },
  ];

  const handleAddField = () => {
    setMenuVisible(true);
  };

  const handleCancel = () => {
    if (isEditMode || isNestedEdit) {
      router.back();
    } else if (isPhaseFlow) {
      Alert.alert(
        "Exit Phase Creation",
        "Are you sure you want to exit? Your current progress will be saved.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => router.replace('/(director)/(tabs)/revitalization-roadmaps')
          }
        ]
      );
    } else {
      router.replace('/(director)/(tabs)/revitalization-roadmaps');
    }
  };

  // Transform custom fields to API extras format
  const transformFieldsToExtras = (fields: any[]): RoadmapExtra[] => {
    return fields
      .filter((field) => !field.parentSectionId) // Only top-level fields
      .map((field) => {
        const nestedFields = fields.filter((f) => f.parentSectionId === field.id);

        switch (field.type) {
          case "textarea":
            return {
              type: "TEXT_AREA" as const,
              name: field.label || field.name || "Notes",
              ...(field.placeholder && { placeHolder: field.placeholder }),
              ...(field.buttonName && { buttonName: field.buttonName }),
            };
          case "text":
            return {
              type: "TEXT_FIELD" as const,
              name: field.label || field.name || "Text Field",
              ...(field.placeholder && { placeHolder: field.placeholder }),
              ...(field.buttonName && { buttonName: field.buttonName }),
            };
          case "checkbox":
            return {
              type: "CHECKBOX" as const,
              name: field.label || field.name || "Checkbox",
              haveButton: !!field.buttonName,
              ...(field.buttonName && { buttonName: field.buttonName }),
            };
          case "datepicker":
            const dateCheckboxes = [
              field.allowPastorSelect && {
                type: "CHECKBOX" as const,
                name: "Allow pastor to select Date",
                haveButton: false,
              },
              field.showOnCard && {
                type: "CHECKBOX" as const,
                name: "Show date on info card",
                haveButton: false,
              },
            ].filter(Boolean) as RoadmapExtra[];

            return {
              type: "DATE_PICKER" as const,
              name: field.label || "Date",
              ...(field.date && { date: new Date(field.date).toISOString().split('T')[0] }),
              ...(field.buttonName && { buttonName: field.buttonName }),
              ...(dateCheckboxes.length > 0 && { checkboxes: dateCheckboxes }),
            };
          case "upload":
            return {
              type: "UPLOAD" as const,
              name: field.buttonLabel || field.name || "Upload",
            };
          case "assessment":
            const assessmentCheckboxes = [
              field.scheduleMeeting && {
                type: "CHECKBOX" as const,
                name: "Schedule Meeting after the Assessment",
                haveButton: false,
              },
            ].filter(Boolean) as RoadmapExtra[];

            return {
              type: "ASSESSMENT" as const,
              name: field.selectedAssessment?.name || field.selectedAssessment || "Assessment",
              ...(field.buttonName && { buttonName: field.buttonName }),
              ...(assessmentCheckboxes.length > 0 && { checkboxes: assessmentCheckboxes }),
            };
          case "section":
            const sectionCheckboxes = [
              field.showDuplicateButton && {
                type: "CHECKBOX" as const,
                name: field.name || "Section",
                haveButton: true,
                buttonName: field.buttonName || "Add section steps",
              },
            ].filter(Boolean) as RoadmapExtra[];

            const sectionFields = nestedFields.map((nestedField) => {
              if (nestedField.type === "text") {
                return {
                  type: "TEXT_FIELD" as const,
                  name: nestedField.label || nestedField.name || "Text Field",
                  ...(nestedField.placeholder && { placeHolder: nestedField.placeholder }),
                  ...(nestedField.buttonName && { buttonName: nestedField.buttonName }),
                };
              } else if (nestedField.type === "datepicker") {
                return {
                  type: "DATE_PICKER" as const,
                  name: nestedField.label || "Date",
                  ...(nestedField.date && { date: new Date(nestedField.date).toISOString().split('T')[0] }),
                  ...(nestedField.buttonName && { buttonName: nestedField.buttonName }),
                };
              } else if (nestedField.type === "textarea") {
                return {
                  type: "TEXT_AREA" as const,
                  name: nestedField.label || nestedField.name || "Text Area",
                  ...(nestedField.placeholder && { placeHolder: nestedField.placeholder }),
                  ...(nestedField.buttonName && { buttonName: nestedField.buttonName }),
                };
              }
              return null;
            }).filter(Boolean) as RoadmapExtra[];

            return {
              type: "SECTION" as const,
              name: field.name || "Section",
              ...(field.buttonName && { buttonName: field.buttonName }),
              ...(sectionCheckboxes.length > 0 && { checkboxes: sectionCheckboxes }),
              ...(sectionFields.length > 0 && { sections: sectionFields }),
            };
          default:
            return null;
        }
      })
      .filter(Boolean) as RoadmapExtra[];
  };

  // Transform form data to API update format
  const transformToUpdateFormat = (): UpdateRoadmapRequest => {
    const extras = transformFieldsToExtras(formData.customFields);
    
    // Get the roadmap to update
    let roadmapToUpdate = editRoadmapData;
    if (isNestedEdit && nestedRoadmapId && editRoadmapData?.roadmaps) {
      roadmapToUpdate = editRoadmapData.roadmaps.find(r => r._id === nestedRoadmapId) as any;
    }

    if (!roadmapToUpdate) {
      throw new Error('Roadmap data not found');
    }

    // Build update request
    const updateData: UpdateRoadmapRequest = {
      name: roadmapData.name,
      duration: roadmapData.completionTime,
      ...(roadmapData.subheading && { roadMapDetails: roadmapData.subheading }),
      ...(formData.descriptionVerbiage && { description: formData.descriptionVerbiage }),
      ...(roadmapData.bannerImage && { imageUrl: roadmapData.bannerImage }),
      ...(extras.length > 0 && { extras }),
    };

    // For main roadmap, include divisions and nested roadmaps with _id
    if (!isNestedEdit && editRoadmapData) {
      if (editRoadmapData.divisions) {
        updateData.divisions = editRoadmapData.divisions;
      }
      if (editRoadmapData.phase) {
        updateData.phase = editRoadmapData.phase;
      }
      if (editRoadmapData.totalSteps) {
        updateData.totalSteps = editRoadmapData.totalSteps;
      }
      
      // Include existing nested roadmaps with their _id
      if (editRoadmapData.roadmaps && editRoadmapData.roadmaps.length > 0) {
        updateData.roadmaps = editRoadmapData.roadmaps.map((nested: any) => ({
          _id: nested._id,
          name: nested.name,
          ...(nested.roadMapDetails && { roadMapDetails: nested.roadMapDetails }),
          ...(nested.description && { description: nested.description }),
          duration: nested.duration,
          ...(nested.imageUrl && { imageUrl: nested.imageUrl }),
          ...(nested.phase && { phase: nested.phase }),
          ...(nested.totalSteps && { totalSteps: nested.totalSteps }),
          ...(nested.extras && nested.extras.length > 0 && { extras: nested.extras }),
        }));
      }
    }

    return updateData;
  };

  // Transform form data to API request format
  const transformToApiFormat = (): CreateRoadmapRequest => {
    const extras = transformFieldsToExtras(formData.customFields);

    if (isPhaseFlow) {
      // Phase flow: create phase with multiple roadmaps
      const roadmaps = state.roadmaps.map((roadmap) => {
        const roadmapExtras = roadmap.fields ? transformFieldsToExtras(roadmap.fields) : [];
        return {
          name: roadmap.name,
          ...(roadmap.subheading && { roadMapDetails: roadmap.subheading }),
          ...(formData.descriptionVerbiage && { description: formData.descriptionVerbiage }),
          duration: roadmap.completionTime,
          ...(roadmap.bannerImage && { imageUrl: roadmap.bannerImage }),
          ...(roadmap.selectedDivision && { phase: roadmap.selectedDivision.toLowerCase() }),
          ...(roadmap.fields && roadmap.fields.length > 0 && { totalSteps: roadmap.fields.length }),
          ...(roadmapExtras.length > 0 && { extras: roadmapExtras }),
        };
      });

      const phaseSubheading = state.phaseDetails?.phaseSubheading || roadmapData.subheading;
      const phaseBannerImage = state.phaseDetails?.phaseBannerImage || roadmapData.bannerImage;

      return {
        type: "phase",
        name: state.phaseDetails?.phaseName || roadmapData.name,
        ...(phaseSubheading && { roadMapDetails: phaseSubheading }),
        ...(formData.descriptionVerbiage && { description: formData.descriptionVerbiage }),
        duration: state.phaseDetails?.phaseCompletionTime || roadmapData.completionTime,
        ...(phaseBannerImage && { imageUrl: phaseBannerImage }),
        divisions: state.phaseDetails?.phaseDivisions || [roadmapData.selectedDivision.toLowerCase()],
        ...(state.phaseDetails?.phaseDivisions && state.phaseDetails.phaseDivisions.length > 0 && { phase: "Phase 1" }),
        ...(state.roadmaps.length > 0 && { totalSteps: state.roadmaps.length }),
        ...(extras.length > 0 && { extras }),
        roadmaps,
      };
    } else {
      // Single roadmap flow - create as a phase with one roadmap
      return {
        type: "phase",
        name: roadmapData.name,
        ...(roadmapData.subheading && { roadMapDetails: roadmapData.subheading }),
        ...(formData.descriptionVerbiage && { description: formData.descriptionVerbiage }),
        duration: roadmapData.completionTime,
        ...(roadmapData.bannerImage && { imageUrl: roadmapData.bannerImage }),
        divisions: [roadmapData.selectedDivision.toLowerCase()],
        ...(roadmapData.selectedDivision && { phase: roadmapData.selectedDivision }),
        ...(formData.customFields.length > 0 && { totalSteps: formData.customFields.length }),
        roadmaps: [
          {
            name: roadmapData.name,
            ...(roadmapData.subheading && { roadMapDetails: roadmapData.subheading }),
            ...(formData.descriptionVerbiage && { description: formData.descriptionVerbiage }),
            duration: roadmapData.completionTime,
            ...(roadmapData.bannerImage && { imageUrl: roadmapData.bannerImage }),
            ...(roadmapData.selectedDivision && { phase: roadmapData.selectedDivision.toLowerCase() }),
            ...(formData.customFields.length > 0 && { totalSteps: formData.customFields.length }),
            ...(extras.length > 0 && { extras }),
          },
        ],
      };
    }
  };

  const handleCreateRoadmap = () => {
    // Enhanced validation
    const errors: string[] = [];

    if (!formData.churchVerbiage.trim()) {
      errors.push("Church Roadmap Verbiage is required");
    }

    if (!formData.descriptionVerbiage.trim()) {
      errors.push("Description Verbiage is required");
    }

    // Validate custom fields
    formData.customFields.forEach((field, index) => {
      if (field.type === "assessment" && !field.selectedAssessment) {
        errors.push(
          `Assessment field #${index + 1} requires an assessment to be selected`
        );
      }
      if (field.type === "upload" && !field.buttonLabel) {
        errors.push(`Upload button #${index + 1} requires a label`);
      }
      if (field.type === "datepicker" && !field.label) {
        errors.push(`Date picker #${index + 1} requires a label`);
      }
    });

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    // Handle nested roadmap editing
    if (isNestedEdit && parentRoadmapId && nestedRoadmapId && editRoadmapData) {
      const extras = transformFieldsToExtras(formData.customFields);
      
      // Update nested roadmap within parent's roadmaps array
      const updatedRoadmaps = editRoadmapData.roadmaps?.map((nested: any) => {
        if (nested._id === nestedRoadmapId) {
          return {
            _id: nested._id,
            name: roadmapData.name,
            roadMapDetails: roadmapData.subheading,
            description: formData.descriptionVerbiage || roadmapData.subheading,
            duration: roadmapData.completionTime,
            ...(roadmapData.bannerImage && { imageUrl: roadmapData.bannerImage }),
            phase: nested.phase || parentPhase || '',
            ...(formData.customFields.length > 0 && { totalSteps: formData.customFields.length }),
            ...(extras.length > 0 && { extras }),
            status: nested.status || 'not started',
            meetings: nested.meetings || [],
          };
        }
        return nested;
      }) || [];

      const updateData: UpdateRoadmapRequest = {
        name: editRoadmapData.name,
        duration: editRoadmapData.duration,
        ...(editRoadmapData.roadMapDetails && { roadMapDetails: editRoadmapData.roadMapDetails }),
        ...(editRoadmapData.description && { description: editRoadmapData.description }),
        ...(editRoadmapData.imageUrl && { imageUrl: editRoadmapData.imageUrl }),
        ...(editRoadmapData.divisions && { divisions: editRoadmapData.divisions }),
        ...(editRoadmapData.phase && { phase: editRoadmapData.phase }),
        ...(editRoadmapData.totalSteps && { totalSteps: editRoadmapData.totalSteps }),
        ...(editRoadmapData.extras && editRoadmapData.extras.length > 0 && { extras: editRoadmapData.extras as RoadmapExtra[] }),
        roadmaps: updatedRoadmaps,
      };

      updateRoadmapMutation.mutate(
        {
          roadmapId: parentRoadmapId,
          data: updateData,
        },
        {
          onSuccess: () => {
            setSuccessMessage("Task Updated Successfully");
            setShowSuccess(true);
          },
          onError: (error) => {
            console.error("Failed to update nested roadmap:", error);
            Alert.alert(
              "Error",
              error.message || "Failed to update task. Please try again.",
              [{ text: "OK" }]
            );
          },
        }
      );
      return;
    }

    // Handle main roadmap editing
    if (isEditMode && roadmapId) {
      const updateData = transformToUpdateFormat();
      
      updateRoadmapMutation.mutate(
        {
          roadmapId: roadmapId,
          data: updateData,
        },
        {
          onSuccess: () => {
            setSuccessMessage("Roadmap Updated Successfully");
            setShowSuccess(true);
          },
          onError: (error) => {
            console.error("Failed to update roadmap:", error);
            Alert.alert(
              "Error",
              error.message || "Failed to update roadmap. Please try again.",
              [{ text: "OK" }]
            );
          },
        }
      );
      return;
    }

    // Handle nested roadmap creation
    if (isNestedRoadmap && parentRoadmapId) {
      const extras = transformFieldsToExtras(formData.customFields);
      
      const nestedRoadmapData = {
        name: roadmapData.name,
        duration: roadmapData.completionTime,
        description: formData.descriptionVerbiage || roadmapData.subheading,
        status: 'in progress' as const,
        phase: parentPhase || '',
        ...(formData.customFields.length > 0 && { totalSteps: formData.customFields.length }),
        ...(extras.length > 0 && { extras }),
      };

      createNestedRoadmapMutation.mutate(
        {
          roadmapId: parentRoadmapId,
          data: nestedRoadmapData,
        },
        {
          onSuccess: () => {
            setSuccessMessage("Roadmap Created Successfully");
            setShowSuccess(true);
          },
          onError: (error) => {
            console.error("Failed to create nested roadmap:", error);
            Alert.alert(
              "Error",
              "Failed to create roadmap. Please try again.",
              [{ text: "OK" }]
            );
          },
        }
      );
      return;
    }

    // Transform to API format for regular roadmap
    const apiData = transformToApiFormat();

    // Submit to API
    createRoadmapMutation.mutate(apiData, {
      onSuccess: () => {
        if (isPhaseFlow) {
          setSuccessMessage("Phase Created Successfully");
          clearPhaseData();
        } else {
          setSuccessMessage("Roadmap Created Successfully");
        }
        setShowSuccess(true);
      },
      onError: (error) => {
        console.error("Failed to create roadmap:", error);
        Alert.alert(
          "Error",
          "Failed to create roadmap. Please try again.",
          [{ text: "OK" }]
        );
      },
    });
  };

  // Field Type Label Component
  const FieldTypeLabel = ({ type }: { type: string }) => {
    const getTypeLabel = (type: string): string => {
      switch (type) {
        case "text":
          return "Text Field";
        case "textarea":
          return "Text Area";
        case "upload":
          return "Upload Button";
        case "datepicker":
          return "Date Picker";
        case "assessment":
          return "Assessment";
        case "section":
          return "Section";
        default:
          return type;
      }
    };

    return (
      <View style={styles.fieldTypeLabelContainer}>
        <Text style={styles.fieldTypeLabel}>{getTypeLabel(type)}</Text>
      </View>
    );
  };

  // Reusable action buttons component
  const FieldActionButtons = ({ fieldId }: { fieldId: string }) => (
    <View style={styles.fieldActions}>
      <TouchableOpacity onPress={() => handleEditField(fieldId)} hitSlop={10}>
        <Ionicons name="create-outline" size={20} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteField(fieldId)} hitSlop={10}>
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderCustomField = (field: any, index: number) => {
    switch (field.type) {
      case "text":
        return (
          <View key={field.id} style={styles.customFieldItem}>
            <FieldTypeLabel type="text" />
            <View style={styles.fieldHeader}>
              <Text style={styles.customFieldLabel}>{field.label}</Text>
              <FieldActionButtons fieldId={field.id} />
            </View>
            <TextInput
              style={styles.customFieldInput}
              placeholder={field.placeholder}
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
        );
      case "textarea":
        return (
          <View key={field.id} style={styles.customFieldItem}>
            <FieldTypeLabel type="textarea" />
            <View style={styles.fieldHeader}>
              <Text style={styles.customFieldLabel}>{field.label}</Text>
              <FieldActionButtons fieldId={field.id} />
            </View>
            <TextInput
              style={[styles.customFieldInput, styles.textArea]}
              placeholder={field.placeholder}
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case "upload":
        return (
          <View key={field.id} style={styles.uploadButtonCard}>
            <FieldTypeLabel type="upload" />
            <View style={styles.fieldHeader}>
              <Text style={styles.uploadLabel}>Upload Button</Text>
              <FieldActionButtons fieldId={field.id} />
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Ionicons name="attach-outline" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {field.buttonLabel || "Upload Video / Pictures"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case "datepicker":
        return (
          <View key={field.id} style={styles.datePickerCard}>
            <FieldTypeLabel type="datepicker" />
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <FieldActionButtons fieldId={field.id} />
            </View>
            <CustomDatePicker
              value={field.date}
              onChange={(date) => handleDateChange(field.id, date)}
              placeholder="Select Date"
            />
            <FormCheckBox
              label="Allow Pastor to Select Date"
              value={field.allowPastorSelect || false}
              onToggle={() => toggleFieldOption(field.id, "allowPastorSelect")}
              isEditMode={true}
            />
            <FormCheckBox
              label="Show Date on Info card"
              value={field.showOnCard || false}
              onToggle={() => toggleFieldOption(field.id, "showOnCard")}
              isEditMode={true}
            />
          </View>
        );
      case "assessment":
        return (
          <View key={field.id} style={styles.assessmentCard}>
            <FieldTypeLabel type="assessment" />
            <View style={styles.fieldHeader}>
              <Text style={styles.assessmentLabel}>Assessment</Text>
              <FieldActionButtons fieldId={field.id} />
            </View>
            {field.selectedAssessment ? (
              <View style={styles.selectedAssessmentBox}>
                <View style={styles.assessmentNameRow}>
                  <Text style={styles.assessmentName}>
                    Added{" "}
                    {field.selectedAssessment.name || field.selectedAssessment}
                  </Text>
                  <TouchableOpacity onPress={() => handleEditField(field.id)}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.takeSurveyButton}>
                  <Text style={styles.takeSurveyText}>
                    Take{" "}
                    {field.selectedAssessment.name || field.selectedAssessment}
                  </Text>
                </TouchableOpacity>
                <FormCheckBox
                  label="Schedule Meeting after the Assessment"
                  value={field.scheduleMeeting || false}
                  onToggle={() =>
                    toggleFieldOption(field.id, "scheduleMeeting")
                  }
                  isEditMode={true}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.chooseAssessmentButton}
                onPress={() => handleEditField(field.id)}
              >
                <Text style={styles.chooseText}>Click here to Choose</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      case "section":
        const nestedFields = formData.customFields.filter(
          (f) => f.parentSectionId === field.id
        );

        return (
          <View key={field.id} style={styles.sectionCard}>
            <FieldTypeLabel type="section" />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleEdit}>{field.name}</Text>
              <FieldActionButtons fieldId={field.id} />
            </View>

            {field.showDuplicateButton && (
              <FormCheckBox
                label="Button to add More Section"
                value={field.showDuplicateButton}
                onToggle={() =>
                  toggleFieldOption(field.id, "showDuplicateButton")
                }
                isEditMode={true}
              />
            )}

            {/* Nested Fields Container */}
            <View style={styles.nestedFieldsContainer}>
              {nestedFields.map((nestedField, idx) => (
                <View key={nestedField.id} style={styles.nestedFieldWrapper}>
                  {renderCustomField(nestedField, idx)}
                </View>
              ))}

              {/* Add Field Button Inside Section */}
              <TouchableOpacity
                style={styles.addNestedFieldButton}
                onPress={() => {
                  setCurrentSectionId(field.id);
                  setMenuVisible(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addNestedFieldText}>
                  Add Field to Section
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return (
          <View key={field.id} style={styles.customFieldItem}>
            <Text style={styles.customFieldText}>
              {field.type}: {field.label}
            </Text>
          </View>
        );
    }
  };

  return (
    <LinearGradient
      colors={["#176192", "#1D548D", "#264387"]}
      style={[styles.container, { paddingBottom: bottom }]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {(isEditMode || isNestedEdit) ? 'Edit Roadmap' : 'Create Roadmap'}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner Preview */}
          <View style={styles.bannerSection}>
            {roadmapData.bannerImage ? (
              <View style={styles.bannerImageContainer}>
                <Image
                  source={{ uri: roadmapData.bannerImage }}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{roadmapData.name}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.bannerImageContainer}>
                <Image
                  source={require("@/assets/images/church-2.png")}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{roadmapData.name}</Text>
                </View>
              </View>
            )}
            <Text style={styles.bannerSubtitle}>
              These information will be shown in the Roadmap page
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Church Roadmap Verbiage */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Church Roadmap Verbiage</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Verbiage"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.churchVerbiage}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, churchVerbiage: text }))
                }
              />
            </View>

            {/* Description Verbiage */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description Verbiage</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Enter Verbiage"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.descriptionVerbiage}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    descriptionVerbiage: text,
                  }))
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Insert Field Section */}
            <View style={styles.insertFieldSection}>
              <View style={styles.insertFieldHeader}>
                <Text style={styles.insertFieldTitle}>Insert Field</Text>
                <TouchableOpacity
                  style={styles.addFieldButton}
                  onPress={handleAddField}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addFieldText}>Add Field</Text>
                </TouchableOpacity>
              </View>

              {/* Custom Fields List - Only top-level fields */}
              {formData.customFields
                .filter((field) => !field.parentSectionId)
                .map((field, index) => renderCustomField(field, index))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!isFormValid || createRoadmapMutation.isPending || updateRoadmapMutation.isPending) && styles.createButtonDisabled,
            ]}
            onPress={handleCreateRoadmap}
            disabled={!isFormValid || createRoadmapMutation.isPending || updateRoadmapMutation.isPending}
          >
            {(createRoadmapMutation.isPending || updateRoadmapMutation.isPending) ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.createButtonText,
                  !isFormValid && styles.createButtonTextDisabled,
                ]}
              >
                {(isEditMode || isNestedEdit) ? 'Update Roadmap' : 'Create Roadmap'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Field Type Selection Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMenuVisible(false);
          setCurrentSectionId(null); // Reset section context
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setMenuVisible(false);
            setCurrentSectionId(null); // Reset section context
          }}
        >
          <View style={styles.modalContent}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => handleMenuItemPress(item.fieldType)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color="#1A4882"
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Field Bottom Sheet */}
      <AddFieldSheet
        ref={addFieldSheetRef}
        onInsert={handleFieldInsert}
        onClose={() => {
          console.log("AddFieldSheet closed");
          setEditingFieldId(null);
        }}
      />

      {/* Success Modal */}
      <SimpleSuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          if (isNestedRoadmap && parentRoadmapId) {
            router.back();
          } else {
            router.replace("/(director)/(tabs)/revitalization-roadmaps");
          }
        }}
        title={successMessage}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bannerSection: {
    marginBottom: 24,
  },
  bannerImageContainer: {
    position: "relative",
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: "top",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 8,
  },
  insertFieldSection: {
    marginTop: 8,
  },
  insertFieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  insertFieldTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  addFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  addFieldText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  customFieldItem: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  customFieldText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A6F",
  },
  createButton: {
    flex: 1,
    backgroundColor: "rgba(38, 67, 135, 1)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  createButtonDisabled: {
    backgroundColor: "rgba(38, 67, 135, 0.5)",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  createButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingRight: 16,
    paddingBottom: 180,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    minWidth: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A4882",
  },
  customFieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 8,
  },
  customFieldInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#fff",
  },
  sectionDivider: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 16,
    overflow: "visible",
    position: "relative",
  },
  sectionDividerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  sectionTitleEdit: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldActions: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButtonCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  uploadButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A6F",
  },
  datePickerCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  assessmentCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  assessmentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  selectedAssessmentBox: {
    marginTop: 8,
  },
  assessmentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  assessmentName: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    flex: 1,
  },
  takeSurveyButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  takeSurveyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A6F",
  },
  chooseAssessmentButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
  },
  chooseText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  // New styles for nested fields and field type labels
  nestedFieldsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    gap: 12,
  },
  nestedFieldWrapper: {
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(74, 144, 226, 0.5)",
  },
  addNestedFieldButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
    marginTop: 8,
    gap: 8,
  },
  addNestedFieldText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  fieldTypeLabelContainer: {
    marginBottom: 8,
  },
  fieldTypeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
