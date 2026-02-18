// import SimpleSuccessModal from '@/components/atom/SimpleSuccessModal';
// import { useAssessment } from '@/context/AssessmentsContext';
// import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
// import { DynamicField, Task } from '@/lib/roadmap/types';
// import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
// import { Ionicons } from '@expo/vector-icons';
// import * as DocumentPicker from 'expo-document-picker';
// import { useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

// interface Props {
//     item: Task;
// }

// export function DynamicFormTask({ item }: Props) {
//     const { progress, updateItem } = useRoadmapProgress();
//     const schema = item.schema;
//     const p = progress[item.id];
//     const [formData, setFormData] = useState<Record<string, any>>(p?.formValues || {});
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const router = useRouter();
//     const { getResponse } = useAssessment();


//     // ✅ OPTIMIZATION 1: Sync formData when progress updates (multi-device)
//     useEffect(() => {
//         if (p?.formValues) {
//             setFormData(p.formValues);
//         }
//     }, [p?.formValues]);

//     const handleChange = (fieldId: string, value: any) => {
//         const updated = { ...formData, [fieldId]: value };
//         setFormData(updated);
//         updateItem(item.id, {
//             formValues: updated,
//             status: 'IN_PROGRESS'
//         });
//     };

//     // ✅ OPTIMIZATION 2: Read from progress instead of stale 'p'
//     const handleAttachment = (fieldId: string, files: any[]) => {
//         const currentAttachments = progress[item.id]?.attachments || {};
//         updateItem(item.id, {
//             attachments: { ...currentAttachments, [fieldId]: files },
//             status: 'COMPLETED',
//         });

//     };

//     // ✅ OPTIMIZATION 3: Add UPLOAD validation
//     const validateField = (field: DynamicField): boolean => {
//         const value = formData[field.id];

//         if (field.required && !value) {
//             // Check if it's an upload field - validate attachments instead
//             if (field.type === 'UPLOAD') {
//                 const attachments = progress[item.id]?.attachments?.[field.id];
//                 return !!(attachments && attachments.length > 0);
//             }
//             return false;
//         }

//         if (field.type === 'CHECKLIST' && field.required && field.items) {
//             return field.items.every(item => formData[field.id]?.[item.id]);
//         }

//         if (field.validation) {
//             if (typeof value === 'string') {
//                 if (field.validation.minLength && value.length < field.validation.minLength) return false;
//                 if (field.validation.maxLength && value.length > field.validation.maxLength) return false;
//             }
//             if (typeof value === 'number') {
//                 if (field.validation.min !== undefined && value < field.validation.min) return false;
//                 if (field.validation.max !== undefined && value > field.validation.max) return false;
//             }
//         }

//         return true;
//     };

//     const canSubmit = (): boolean => {
//         return schema.fields
//             .filter(f => f.required && shouldShowField(f))
//             .every(f => {
//                 if (f.dependsOn) {
//                     const depsMet = f.dependsOn.every(depId => formData[depId] === true);
//                     if (!depsMet) return true; // Not required if deps not met
//                 }
//                 return validateField(f);
//             });
//     };

//     const shouldShowField = (field: DynamicField): boolean => {
//         if (!field.showIf) return true;
//         return formData[field.showIf.fieldId] === field.showIf.equals;
//     };

//     const isFieldEnabled = (field: DynamicField): boolean => {
//         if (!field.dependsOn) return true;
//         return field.dependsOn.every(depId => formData[depId] === true);
//     };

//     const handleSubmit = () => {
//         if (canSubmit()) {
//             updateItem(item.id, {
//                 formValues: formData,
//                 status: 'COMPLETED'
//             });
//             setShowSuccessModal(true);
//         }
//     };


//     const handleButtonPress = (field: DynamicField) => {
//         if (field.onPress === 'NAVIGATE' && field.navigateTo) {
//             router.push(field.navigateTo);
//         } else if (field.onPress === 'SUBMIT') {
//             handleSubmit();
//         }
//         // CUSTOM can be handled by custom logic
//     };



//     // ✅ Sync formData when progress updates
//     useEffect(() => {
//         if (p?.formValues) {
//             setFormData(p.formValues);
//         }
//     }, [p?.formValues]);

//     const renderField = (field: DynamicField) => {
//         if (!shouldShowField(field)) return null;

//         const disabled = !isFieldEnabled(field);

//         switch (field.type) {
//             case 'TEXT_FIELD':
//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         <Text style={styles.fieldLabel}>
//                             {field.label}{field.required && ' *'}
//                         </Text>
//                         <TextInput
//                             style={styles.textInput}
//                             placeholder={field.placeholder}
//                             placeholderTextColor="#9cc2ff"
//                             value={formData[field.id] || ''}
//                             onChangeText={v => handleChange(field.id, v)}
//                             editable={!disabled}
//                         />
//                     </View>
//                 );

//             case 'TEXT':
//                 return (
//                     <View key={field.id} style={[styles.fieldContainer, { alignItems: 'center' }]}>
//                         <Text style={styles.text}>
//                             {field.label}
//                         </Text>
//                     </View>
//                 );


//             case 'TEXT_AREA':
//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         <Text style={styles.fieldLabel}>
//                             {field.label}{field.required && ' *'}
//                         </Text>
//                         <TextInput
//                             style={[styles.textInput, styles.textArea]}
//                             placeholder={field.placeholder}
//                             placeholderTextColor="#9cc2ff"
//                             multiline
//                             numberOfLines={4}
//                             value={formData[field.id] || ''}
//                             onChangeText={v => handleChange(field.id, v)}
//                             editable={!disabled}
//                         />
//                     </View>
//                 );
//             case 'TEXT_DISPLAY':
//                 return (
//                     <View key={field.id} style={{
//                         ...styles.textDisplay,
//                     }}>
//                         <Text style={styles.textDisplayText}>{field.label}</Text>
//                     </View>
//                 )
//             case 'CHECKBOX':
//                 return (
//                     <Pressable
//                         key={field.id}
//                         onPress={() => handleChange(field.id, !formData[field.id])}
//                         style={styles.checkboxRow}
//                         disabled={disabled}
//                     >
//                         <View style={[styles.checkbox, formData[field.id] && styles.checkboxChecked]}>
//                             {formData[field.id] && <Text style={styles.checkmark}>✓</Text>}
//                         </View>
//                         <Text style={styles.checkboxLabel}>
//                             {field.label}{field.required && ' *'}
//                         </Text>
//                     </Pressable>
//                 );

//             case 'CHECKLIST':
//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         <Text style={styles.fieldLabel}>
//                             {field.label}{field.required && ' *'}
//                         </Text>
//                         {field.items?.map(item => (
//                             <Pressable
//                                 key={item.id}
//                                 onPress={() => {
//                                     const checklistData = formData[field.id] || {};
//                                     handleChange(field.id, {
//                                         ...checklistData,
//                                         [item.id]: !checklistData[item.id],
//                                     });
//                                 }}
//                                 style={styles.checklistItem}
//                             >
//                                 <View style={[
//                                     styles.checkbox,
//                                     (formData[field.id]?.[item.id] || item.checked) && styles.checkboxChecked
//                                 ]}>
//                                     {(formData[field.id]?.[item.id] || item.checked) && (
//                                         <Text style={styles.checkmark}>✓</Text>
//                                     )}
//                                 </View>
//                                 <Text style={styles.checklistLabel}>{item.label}</Text>
//                             </Pressable>
//                         ))}
//                     </View>
//                 );

//             case 'UPLOAD':
//                 const attachments = progress[item.id]?.attachments?.[field.id] || [];
//                 const isMediaUpload = field.accept && (field.accept.includes('image/*') || field.accept.includes('video/*'));
//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         {/* Uploaded Files List - Shows ABOVE button when files exist */}
//                         {attachments.length > 0 && (
//                             <View
//                                 style={[
//                                     styles.uploadedFilesContainer,
//                                 ]}
//                             >
//                                 {!isMediaUpload && (
//                                     <Text style={styles.uploadedFilesLabel}>You Uploaded :</Text>
//                                 )}
//                                 {attachments.map((file: any, index: number) => (
//                                     isMediaUpload ? (
//                                         <Pressable onPress={() => {
//                                             router.push({
//                                                 pathname: '/roadmap/shared-media',
//                                                 params: {
//                                                     fileId: file.id,
//                                                     taskId: item.id
//                                                 }
//                                             })
//                                         }} key={file.id}
//                                             style={{
//                                                 width: '100%',          // take full width
//                                                 alignItems: 'center',   // centre children horizontally
//                                                 marginVertical: 10,
//                                             }}
//                                         >
//                                             <Text style={[styles.fileName, { textDecorationLine: 'underline' }]}>View Shared Media</Text>
//                                         </Pressable>
//                                     ) : (
//                                         <View key={file.id} style={styles.fileRow}>
//                                             <Text style={styles.fileName}>: {file.name}</Text>
//                                             <Pressable
//                                                 onPress={() => {
//                                                     const filtered = attachments.filter((f: any) => f.id !== file.id);
//                                                     handleAttachment(field.id, filtered);
//                                                 }}
//                                                 style={styles.removeIconWrapper}
//                                             >
//                                                 <Ionicons name="close-circle" size={20} color="#ef4444" />
//                                             </Pressable>
//                                         </View>
//                                     )
//                                 ))}
//                             </View>
//                         )}

//                         {/* Upload Button */}
//                         <Pressable
//                             style={[styles.uploadButton, styles.uploadButtonWhite]}
//                             onPress={async () => {
//                                 const res = await DocumentPicker.getDocumentAsync({
//                                     type: field.accept || ['*/*'],
//                                     multiple: true, // Allow multiple file selection
//                                 });
//                                 if (!res.canceled) {
//                                     const files = res.assets.map(a => ({
//                                         id: `${a.name}-${Date.now()}`,
//                                         uri: a.uri,
//                                         name: a.name,
//                                         size: a.size,
//                                     }));
//                                     // Append new files to existing attachments instead of replacing
//                                     const updatedAttachments = [...attachments, ...files];
//                                     handleAttachment(field.id, updatedAttachments);
//                                 }
//                             }}
//                         >
//                             <Ionicons name="attach" size={22} color="#2563eb" />
//                             {isMediaUpload ? (
//                                 <Text style={styles.uploadButtonText}>
//                                     {attachments.length > 0 ? 'Re-Submit' : field.label}
//                                 </Text>
//                             ) : (
//                                 <Text style={styles.uploadButtonText}>
//                                     {attachments.length > 0 ? 'Upload New Strategy' : field.label}
//                                 </Text>
//                             )}
//                         </Pressable>
//                     </View>
//                 );
//             case 'BUTTON':
//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         <Pressable
//                             style={[
//                                 styles.button,
//                                 disabled && styles.buttonDisabled,
//                             ]}
//                             onPress={() => !disabled && handleButtonPress(field)}
//                             disabled={disabled}
//                         >
//                             <Text style={[
//                                 styles.buttonText,
//                             ]}>
//                                 {field.label}
//                             </Text>
//                         </Pressable>
//                     </View>
//                 );

//             case 'SURVEY_BUTTON': {
//                 // Extract assessmentId from the navigateTo URL
//                 const assessmentId = field.navigateTo?.split('assessmentId=')[1] || 'assessment-001';

//                 // Get assessment response from context
//                 const assessmentResponse = getResponse(assessmentId);
//                 const isCompleted = assessmentResponse?.status === 'Completed';

//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         {/* Survey Card Container */}
//                         <View style={[
//                             styles.surveyCard,
//                             isCompleted && styles.surveyCardCompleted
//                         ]}>
//                             {/* Conditional Content Based on Completion Status */}
//                             {!isCompleted ? (
//                                 // Before Survey - Show Take Survey Button
//                                 <Pressable
//                                     style={[
//                                         styles.surveyButton,
//                                         disabled && styles.buttonDisabled,
//                                     ]}
//                                     onPress={() => !disabled && handleButtonPress(field)}
//                                     disabled={disabled}
//                                 >
//                                     <Text style={styles.surveyButtonText}>
//                                         {field.label || 'Take PMP Survey'}
//                                     </Text>
//                                 </Pressable>
//                             ) : (
//                                 // After Survey - Show Results Link and Repeat Button
//                                 <>
//                                     <Pressable
//                                         style={styles.viewResultsButton}
//                                         onPress={() => {
//                                             // Navigate to answer questions in view mode
//                                             router.push({
//                                                 pathname: '/assessments/answer-questions',
//                                                 params: {
//                                                     assessmentId,
//                                                     viewMode: 'true'
//                                                 }
//                                             });
//                                         }}
//                                     >
//                                         <Text style={styles.viewResultsText}>
//                                             View your Survey Results
//                                         </Text>
//                                     </Pressable>

//                                     <Pressable
//                                         style={[
//                                             styles.repeatSurveyButton,
//                                             disabled && styles.buttonDisabled,
//                                         ]}
//                                         onPress={() => {
//                                             if (!disabled) {
//                                                 // Just navigate to start the survey again
//                                                 // The survey will handle showing previous responses
//                                                 handleButtonPress(field);
//                                             }
//                                         }}
//                                         disabled={disabled}
//                                     >
//                                         <Text style={styles.repeatSurveyButtonText}>
//                                             Repeat {field.survey || 'PMP'} Survey
//                                         </Text>
//                                     </Pressable>
//                                 </>
//                             )}
//                         </View>
//                     </View>
//                 );
//             }



//             case 'DATE_PICKER': {
//                 const isEditable = field.editable !== false;
//                 return (
//                     <View key={field.id} style={styles.fieldRow}>
//                         <Text style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}>
//                             {field.label}{field.required && ' *'}
//                         </Text>
//                         <View style={[
//                             styles.dateInputContainer,
//                             !isEditable && styles.dateInputDisabled
//                         ]}>
//                             <TextInput
//                                 style={styles.dateInput}
//                                 placeholder="DD / MM / YY"
//                                 placeholderTextColor="#9cc2ff"
//                                 value={formData[field.id] || field.defaultValue || ''}
//                                 keyboardType="number-pad"
//                                 maxLength={14}
//                                 onChangeText={v => {
//                                     if (!isEditable) return;

//                                     // ✅ Remove all non-digits
//                                     const raw = v.replace(/\D/g, '');

//                                     // ✅ Format as DD / MM / YY
//                                     let formatted = '';
//                                     if (raw.length >= 1) {
//                                         formatted = raw.slice(0, 2);
//                                     }
//                                     if (raw.length >= 3) {
//                                         formatted += ' / ' + raw.slice(2, 4);
//                                     }
//                                     if (raw.length >= 5) {
//                                         formatted += ' / ' + raw.slice(4, 6);
//                                     }

//                                     handleChange(field.id, formatted);
//                                 }}
//                                 editable={isEditable}
//                             />
//                         </View>
//                     </View>
//                 );
//             }



//             case 'DROPDOWN':
//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         <Text style={styles.fieldLabel}>
//                             {field.label}{field.required && ' *'}
//                         </Text>
//                         <View style={styles.dropdownContainer}>
//                             {field.options?.map(option => (
//                                 <Pressable
//                                     key={option}
//                                     onPress={() => handleChange(field.id, option)}
//                                     style={[
//                                         styles.dropdownOption,
//                                         formData[field.id] === option && styles.dropdownOptionSelected
//                                     ]}
//                                 >
//                                     <Text style={[
//                                         styles.dropdownOptionText,
//                                         formData[field.id] === option && styles.dropdownOptionTextSelected
//                                     ]}>
//                                         {option}
//                                     </Text>
//                                 </Pressable>
//                             ))}
//                         </View>
//                     </View>
//                 );

//             case 'MULTI_SELECT':
//                 return (
//                     <View key={field.id} style={styles.fieldContainer}>
//                         <Text style={styles.fieldLabel}>
//                             {field.label}{field.required && ' *'}
//                         </Text>
//                         <View style={styles.dropdownContainer}>
//                             {field.options?.map(option => {
//                                 const selected = (formData[field.id] || []).includes(option);
//                                 return (
//                                     <Pressable
//                                         key={option}
//                                         onPress={() => {
//                                             const current = formData[field.id] || [];
//                                             const updated = selected
//                                                 ? current.filter((o: string) => o !== option)
//                                                 : [...current, option];
//                                             handleChange(field.id, updated);
//                                         }}
//                                         style={[
//                                             styles.dropdownOption,
//                                             selected && styles.dropdownOptionSelected
//                                         ]}
//                                     >
//                                         <Text style={[
//                                             styles.dropdownOptionText,
//                                             selected && styles.dropdownOptionTextSelected
//                                         ]}>
//                                             {option}
//                                         </Text>
//                                     </Pressable>
//                                 );
//                             })}
//                         </View>
//                     </View>
//                 );

//             case 'SIGNATURE':
//                 return (
//                     <View key={field.id} style={[styles.fieldContainer, disabled && styles.fieldDisabled]}>
//                         {field.documentUrl && (
//                             <Pressable style={styles.documentLink}>
//                                 <Text style={styles.documentLinkText}>View Document</Text>
//                                 <Ionicons name="open-outline" size={16} color="#60a5fa" />
//                             </Pressable>
//                         )}
//                         <Pressable
//                             style={[styles.signButton, disabled && styles.signButtonDisabled]}
//                             onPress={() => !disabled && handleChange(field.id, new Date().toISOString())}
//                             disabled={disabled}
//                         >
//                             <Text style={styles.signButtonText}>
//                                 {formData[field.id] ? '✓ Signed' : field.label}
//                             </Text>
//                         </Pressable>
//                         {disabled && field.dependsOn && (
//                             <Text style={styles.helperText}>
//                                 Please complete required fields above
//                             </Text>
//                         )}
//                     </View>
//                 );

//             case 'SECTION_BOX':
//                 return (
//                     <View key={field.id} style={styles.sectionBox}>
//                         {field.label && (
//                             <Text style={styles.sectionBoxTitle}>{field.label}</Text>
//                         )}
//                         {/* ✅ Render nested fields */}
//                         {field.fields?.map(childField => renderField(childField))}
//                     </View>
//                 );

//             case 'ASSESSMENT':
//                 return (
//                     <Pressable key={field.id} style={styles.assessmentButton}>
//                         <View style={styles.assessmentContent}>
//                             <Text style={styles.assessmentTitle}>
//                                 {field.assessmentTitle || field.label}
//                             </Text>
//                             <Text style={styles.assessmentLabel}>{field.label}</Text>
//                         </View>
//                         <Ionicons name="open-outline" size={20} color="white" />
//                     </Pressable>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <>
//             <ScrollView style={styles.container}>
//                 {schema.fields.map(renderField)}

//                 {schema.submitLabel && (
//                     <Pressable
//                         style={[styles.signButton, !canSubmit() && styles.submitButtonDisabled]}
//                         onPress={handleSubmit}
//                         disabled={!canSubmit()}
//                     >
//                         <Text style={!canSubmit() ? styles.submitButtonText : { ...styles.signButtonText, }}>
//                             {schema.submitLabel || 'Submit'}
//                         </Text>
//                     </Pressable>
//                 )}
//             </ScrollView>

//             {/* Success Modal (auto-close, no button) */}
//             <SimpleSuccessModal
//                 visible={showSuccessModal}
//                 onClose={() => setShowSuccessModal(false)}
//                 title={"Task Completed!\nYour submission has been recorded successfully."}
//             />
//         </>
//     );
// }


// const styles = StyleSheet.create({
// container: { flex: 1 },
// fieldContainer: { marginBottom: 24 },
// fieldDisabled: { opacity: 0.5 },
// fieldLabel: { color: 'white', fontSize: 16, marginBottom: 8, fontWeight: '500' },
// textInput: {
//     backgroundColor: 'rgba(64, 156, 186, 0.5)',
//     padding: 14,
//     borderRadius: 8,
//     color: 'white',
//     fontSize: 15,
// },
// text: {
//     color: 'white',
//     fontSize: 16,
//     marginBottom: 8,
//     textAlign: 'center',
// },
// textArea: { height: 100, textAlignVertical: 'top' },
// checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
// checkbox: {
//     width: 24,
//     height: 24,
//     borderWidth: 2,
//     borderColor: 'white',
//     borderRadius: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
// },
// checkboxChecked: { backgroundColor: 'white' },
// checkmark: { color: '#1e40af', fontSize: 18, fontWeight: 'bold' },
// checkboxLabel: { flex: 1, color: 'white', fontSize: 16, lineHeight: 24 },
// checklistItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     backgroundColor: 'rgba(64, 156, 186, 0.3)',
//     borderRadius: 8,
//     marginBottom: 8,
//     gap: 12,
// },
// checklistLabel: { color: 'white', fontSize: 15, flex: 1 },

// uploadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     gap: 10,
//     backgroundColor: '#ffffff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 2,
// },
// uploadButtonWhite: {
//     backgroundColor: '#ffffff',
// },
// uploadButtonText: {
//     color: '#2563eb',
//     fontSize: 17,
//     fontWeight: '600',
//     letterSpacing: 0.2,
// },

// uploadedFilesContainer: {
//     marginBottom: 20,
// },
// uploadedFilesLabel: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '400',
//     marginBottom: 12,
//     letterSpacing: 0.3,
// },
// fileRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//     paddingHorizontal: 0,
//     marginBottom: 10,
// },
//     fileName: {
//         color: '#ffffff',
//         fontSize: 16,
//         fontWeight: '400',
//         flex: 1,
//         textAlign: 'left',
//         letterSpacing: 0.3,
//     },
//     removeIconWrapper: {
//         padding: 4,
//         marginLeft: 8,
//     },
//     dateButton: {
//         backgroundColor: 'rgba(64, 156, 186, 0.5)',
//         padding: 14,
//         borderRadius: 8,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     fieldRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between', // ✅ Changed from space-evenly
//         marginBottom: 20,
//         gap: 16, // ✅ Increased gap for better spacing
//     },

//     // ✅ Fixed input container - responsive width
//     dateInputContainer: {
//         backgroundColor: 'transparent',
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.4)',
//         borderRadius: 12,
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         minWidth: 160, // ✅ Increased min width to fit "DD / MM / YY"
//         flexShrink: 0, // ✅ Prevents shrinking below minWidth
//     },

//     dateInputDisabled: {
//         borderColor: 'rgba(255, 255, 255, 0.2)',
//         opacity: 0.7,
//     },

//     dateInput: {
//         color: '#ffffff',
//         fontSize: 16,
//         fontWeight: '500',
//         textAlign: 'center',
//         padding: 0,
//         minWidth: 120, // ✅ Ensures text doesn't wrap
//     },
//     dateButtonText: { color: 'white', fontSize: 15 },
//     dropdownContainer: { gap: 8 },
//     dropdownOption: {
//         backgroundColor: 'rgba(64, 156, 186, 0.3)',
//         padding: 14,
//         borderRadius: 8,
//         borderWidth: 2,
//         borderColor: 'transparent',
//     },
//     dropdownOptionSelected: { borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.2)' },
//     dropdownOptionText: { color: 'white', fontSize: 15 },
//     dropdownOptionTextSelected: { color: '#34d399', fontWeight: '600' },
//     signButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center' },
//     signButtonDisabled: { backgroundColor: '#666', opacity: 0.6 },
//     signButtonText: { color: '#1e40af', fontSize: 16, fontWeight: '600' },
//     documentLink: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//         marginBottom: 12,
//         paddingVertical: 12,
//         borderTopWidth: 1,
//         borderBottomWidth: 1,
//         borderColor: 'rgba(255,255,255,0.3)',
//     },
//     documentLinkText: { color: '#60a5fa', fontSize: 14, textDecorationLine: 'underline' },
//     helperText: { color: '#9cc2ff', fontSize: 13, marginTop: 8, textAlign: 'center' },
//     sectionHeader: {
//         color: 'white',
//         fontSize: 20,
//         fontWeight: 'bold',
//         marginBottom: 12,
//         marginTop: 8,
//     },
//     textDisplay: {
//         paddingVertical: 12,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 24,
//     },
//     linkButton: {
//         paddingVertical: 20,
//         borderTopWidth: 1,
//         borderBottomWidth: 1,
//         borderColor: 'rgba(255,255,255,0.3)',
//         marginBottom: 24,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },
//     linkButtonText: {
//         color: 'white',
//         fontSize: 14,
//         fontWeight: '500',
//         textDecorationLine: 'underline',
//     },
//     textDisplayText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '500',

//     },
//     assessmentButton: {
//         backgroundColor: 'rgba(64, 156, 186, 0.5)',
//         padding: 16,
//         borderRadius: 8,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     assessmentContent: { flex: 1 },
//     assessmentTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 },
//     assessmentLabel: { color: '#9cc2ff', fontSize: 14 },
//     submitButton: {
//         backgroundColor: '#34d399',
//         padding: 16,
//         borderRadius: 8,
//         alignItems: 'center',
//         marginTop: 24,
//     },
//     submitButtonDisabled: { backgroundColor: '#666', opacity: 0.6 },
//     submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     modalContent: {
//         backgroundColor: 'white',
//         borderRadius: 20,
//         padding: 32,
//         alignItems: 'center',
//         maxWidth: 340,
//         width: '100%',
//     },
//     modalTitle: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#1e293b',
//         marginTop: 16,
//         marginBottom: 12,
//     },
//     modalMessage: {
//         fontSize: 16,
//         color: '#64748b',
//         textAlign: 'center',
//         marginBottom: 24,
//     },
//     modalButton: {
//         backgroundColor: '#1e40af',
//         paddingVertical: 14,
//         paddingHorizontal: 48,
//         borderRadius: 12,
//         width: '100%',
//         alignItems: 'center',
//     },
//     modalButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
//     sectionBox: {
//         backgroundColor: 'transparent',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 24,
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.2)',
//     },

//     sectionBoxTitle: {
//         color: 'white',
//         fontSize: 18,
//         fontWeight: '600',
//         marginBottom: 16,
//     },


//     button: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 14,
//         paddingHorizontal: 24,
//         borderRadius: 8,
//         gap: 10,
//         backgroundColor: '#ffffff',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.08,
//         shadowRadius: 8,
//         elevation: 2,
//     },


//     buttonOutline: {
//         backgroundColor: 'transparent',
//         borderWidth: 2,
//         borderColor: 'white',
//     },


//     buttonText: {
//         color: '#2563eb',
//         fontSize: 17,
//         fontWeight: '600',
//         letterSpacing: 0.2,
//     },

//     buttonTextOutline: {
//         color: 'white',
//     },

//     // SURVEY_BUTTON styles
//     // surveyButton: {
//     //     backgroundColor: 'white',
//     //     paddingVertical: 16,
//     //     borderRadius: 12,
//     //     alignItems: 'center',
//     //     marginBottom: 24,
//     // },

//     // surveyButtonText: {
//     //     color: '#2563eb',
//     //     fontSize: 16,
//     //     fontWeight: '600',
//     // },

//     meetingBanner: {
//         backgroundColor: 'rgba(139, 92, 246, 0.9)',
//         borderWidth: 2,
//         borderColor: '#a78bfa',
//         borderRadius: 12,
//         paddingVertical: 16,
//         paddingHorizontal: 20,
//         marginBottom: 24,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },

//     meetingBannerText: {
//         color: 'white',
//         fontSize: 16,
//         fontWeight: '600',
//     },

//     completedBanner: {
//         backgroundColor: 'rgba(52, 211, 153, 0.2)',
//         borderRadius: 12,
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         marginBottom: 24,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//     },

//     completedLabel: {
//         color: '#34d399',
//         fontSize: 16,
//         fontWeight: '600',
//     },

//     completedDate: {
//         color: 'white',
//         fontSize: 14,
//     },

//     viewResultsLink: {
//         paddingVertical: 16,
//         alignItems: 'center',
//         marginBottom: 16,
//     },



//     repeatButton: {
//         backgroundColor: 'white',
//         paddingVertical: 16,
//         borderRadius: 12,
//         alignItems: 'center',
//         marginBottom: 24,
//     },

//     repeatButtonText: {
//         color: '#2563eb',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     // Survey Button Styles
//     surveyCard: {
//         // backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         // borderRadius: getSpacing(12),
//         // borderWidth: 1,
//         // borderColor: 'rgba(255, 255, 255, 0.3)',
//         padding: getSpacing(16),
//         marginBottom: getSpacing(12),
//     },
//     surveyCardCompleted: {
//         backgroundColor: 'rgba(255, 255, 255, 0.08)',
//     },
//     surveyDescription: {
//         fontSize: getFontSize(isSmallDevice ? 13 : 14),
//         color: '#FFFFFF',
//         lineHeight: getFontSize(isSmallDevice ? 20 : 22),
//         marginBottom: getSpacing(16),
//         textAlign: 'left',
//     },
//     surveyButton: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: getSpacing(10),
//         paddingVertical: getSpacing(14),
//         paddingHorizontal: getSpacing(24),
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     surveyButtonText: {
//         fontSize: getFontSize(isSmallDevice ? 15 : 16),
//         fontWeight: '600',
//         color: '#1E3A8A',
//     },
//     viewResultsButton: {
//         marginBottom: getSpacing(12),
//         paddingVertical: getSpacing(4),
//     },
//     viewResultsText: {
//         fontSize: getFontSize(isSmallDevice ? 15 : 16),
//         fontWeight: '400',
//         color: '#FFFFFF',
//         textDecorationLine: 'underline',
//         textAlign: 'center',
//     },
//     repeatSurveyButton: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: getSpacing(10),
//         paddingVertical: getSpacing(14),
//         paddingHorizontal: getSpacing(24),
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     repeatSurveyButtonText: {
//         fontSize: getFontSize(isSmallDevice ? 15 : 16),
//         fontWeight: '600',
//         color: '#1E3A8A',
//     },
//     buttonDisabled: {
//         opacity: 0.5,
//     },

// });


// components/roadmaps/DynamicFormTask.tsx
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import {
    useCreateRoadmapExtras,
    useDeleteRoadmapDocument,
    useRoadmapDocuments,
    useRoadmapExtras,
    useUpdateRoadmapExtras,
    useUploadRoadmapDocument,
} from "@/hooks/roadmaps/useRoadmaps";

import { Extra, NestedRoadmap } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { JSX, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface Props {
    task: NestedRoadmap;
    phaseId?: string;
    itemId?: string;
}

export function DynamicFormTask({ task, phaseId: roadmapId, itemId }: Props) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [pendingFiles, setPendingFiles] = useState<Record<string, any[]>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const isValidObjectId = (id: string | undefined) => !!id;

    /** Load existing extras from API */
    const { data: existingExtras, isLoading: isLoadingExtras, isFetching: isFetchingExtras } = useRoadmapExtras(
        isValidObjectId(roadmapId) ? roadmapId : undefined,
        isValidObjectId(itemId) ? itemId : undefined,
        isValidObjectId(user?.id) ? user?.id : undefined
    );

    const createExtras = useCreateRoadmapExtras();
    const updateExtras = useUpdateRoadmapExtras();
    const uploadDocument = useUploadRoadmapDocument();
    const deleteDocument = useDeleteRoadmapDocument();

    const isUpdateMode = !!existingExtras;

    /** Initialise formData from API or default dates */
    useEffect(() => {
        // if (isFetchingExtras) return; // Removed to allow updates even if fetching in background

        console.log("----------------------------------------------")
        console.log("----------------------------------------------")
        console.log('existingExtras', existingExtras);
        console.log("----------------------------------------------")
        console.log("----------------------------------------------")

        const init: Record<string, any> = {};
        
        // 1. Load defaults from task definition
        task.extras?.forEach(extra => {
            if (extra.date) init[extra.name] = extra.date;
            // Also load sub-checkboxes if they exist in definitions (though usually they come from extras)
        });

        // 2. Override with existing extras from API
        if (existingExtras?.extras && Array.isArray(existingExtras.extras)) {
            existingExtras.extras.forEach((item: any) => {
                if (item.name && item.value !== undefined) {
                    init[item.name] = item.value;
                }
            });
        }
        
        setFormData(init);
    }, [existingExtras, task]);

    const handleChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const validateForm = () => Object.keys(formData).length > 0;

    /** Infer extra type – used when building payload */
    const getExtraType = (fieldName: string, value: any): string => {
        const extraDef = task.extras?.find(e => e.name === fieldName);
        if (extraDef) return extraDef.type;

        if (typeof value === "boolean") return "CHECKBOX";
        if (typeof value === "object" && value?.uri) return "UPLOAD";
        if (fieldName.toLowerCase().includes("date")) return "DATE_PICKER";
        if (typeof value === "string" && value.length > 100) return "TEXT_AREA";
        return "TEXT_FIELD";
    };

    /** Save progress – text extras + pending file uploads */
    const handleSubmit = async () => {
        console.log("----------------------------------------------")
        console.log("----------------------------------------------")
        console.log('formData', formData);
        console.log("----------------------------------------------")
        console.log("----------------------------------------------")
        if (!validateForm()) {
            Alert.alert("No Data", "Please fill in at least one field before saving progress");
            return;
        }
        if (!user?.id) {
            Alert.alert("Error", "User not authenticated");
            return;
        }

        try {
            // 1️⃣ Build extras payload (including upload fields as boolean flags)
            const extrasArray = Object.entries(formData).map(([name, value]) => {
                const type = getExtraType(name, value);
                return {
                    type,
                    name,
                    value: type === "UPLOAD" ? true : value,
                };
            });

            if (isUpdateMode) {
                await updateExtras.mutateAsync({
                    roadMapId: roadmapId!,
                    payload: { extras: extrasArray },
                    userId: user.id,
                    nestedRoadMapItemId: itemId,
                });
            } else {
                await createExtras.mutateAsync({
                    userId: user.id,
                    roadMapId: roadmapId!,
                    nestedRoadMapItemId: itemId,
                    extras: extrasArray,
                });
            }

            // 2️⃣ Upload each pending file batch
            for (const [extraName, files] of Object.entries(pendingFiles)) {
                for (const file of files) {
                    await uploadDocument.mutateAsync({
                        roadMapId: roadmapId!,
                        userId: user.id,
                        nestedRoadMapItemId: itemId!,
                        extraName,
                        file,
                    });
                }
            }

            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                router.back();
            }, 1800);
        } catch (err: any) {
            console.error("❌ Submission error:", err);
            Alert.alert("Submission Failed", err?.message || "Failed to submit. Please try again.");
        }
    };

    /** ───────────────────── UPLOAD FIELD ───────────────────── */

    const UploadField = ({ extraName, isEditable = true, initialFiles = [] }: { extraName: string, isEditable?: boolean, initialFiles?: any[] }) => {
        const { data: docs = [], isLoading } = useRoadmapDocuments(
            roadmapId!,
            itemId!,
            user!.id,
            extraName
        );

        // Combine initial files from extras with files from documents endpoint
        // Use a Map to deduplicate based on file URL or ID
        const allFiles = [...initialFiles, ...docs].reduce((acc, current) => {
            const key = current._id || current.id || current.fileUrl;
            if (!acc.has(key)) {
                acc.set(key, current);
            }
            return acc;
        }, new Map()).values();
        
        const uniqueDocs = Array.from(allFiles);

        // Heuristic: treat as media upload if name hints at image/video/media
        const isMediaUpload =
            extraName.toLowerCase().includes("image") ||
            extraName.toLowerCase().includes("video") ||
            extraName.toLowerCase().includes("photo") ||
            extraName.toLowerCase().includes("media");

        const confirmDelete = (doc: any) => {
            if (!isEditable) return;
            Alert.alert(
                "Delete Document",
                `Are you sure you want to delete "${decodeURIComponent(doc.fileName)}"?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                            deleteDocument.mutate({
                                roadMapId: roadmapId!,
                                userId: user!.id,
                                nestedId: itemId!,
                                fileUrl: doc.fileUrl,
                                uploadBatchId: doc.uploadBatchId,
                            });
                            // If this was the last file, we should technically clear formData
                            // but since it's on server, it might be safer to let the next refresh handle it
                            // or check docs.length
                            if (docs.length <= 1 && (!pendingFiles[extraName] || pendingFiles[extraName].length === 0)) {
                                handleChange(extraName, false);
                            }
                        },
                    },
                ]
            );
        };

        const pickFile = async () => {
            if (!isEditable) return;
            const res = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                multiple: true, // ✅ support multiple like old version
            });
            if (res.canceled) return;

            const newFiles = res.assets.map(a => ({
                id: `${a.name}-${Date.now()}`,
                uri: a.uri,
                name: a.name,
                type: a.mimeType,
                size: a.size,
            }));

            setPendingFiles(prev => ({
                ...prev,
                [extraName]: [...(prev[extraName] || []), ...newFiles],
            }));
            
            // ✅ Mark form as dirty/having data so save works
            handleChange(extraName, true);
        };

        const deletePendingLocal = (fileId: string) => {
            if (!isEditable) return;
            setPendingFiles(prev => {
                const updated = prev[extraName]?.filter(f => f.id !== fileId) || [];
                
                // If no pending files AND no server files, clear form data
                if (updated.length === 0 && docs.length === 0) {
                    handleChange(extraName, false);
                }
                
                return {
                    ...prev,
                    [extraName]: updated,
                };
            });
        };

        const hasServerFiles = docs.length > 0;
        const hasPendingFiles = (pendingFiles[extraName]?.length ?? 0) > 0;

        // Match old button label logic
        const buttonText = isMediaUpload
            ? hasServerFiles || hasPendingFiles
                ? "Re-Submit"
                : extraName
            : hasServerFiles || hasPendingFiles
                ? "Upload New Strategy"
                : extraName;

        return (
            <View style={{ marginBottom: 20 }}>
                {/* Loading */}
                {isLoading ? (
                    <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
                ) : (
                    uniqueDocs.length > 0 && (
                        <View style={[styles.uploadedFilesContainer]}>

                            {/* Only for NON-media uploads */}
                            {!isMediaUpload && (
                                <Text style={styles.uploadedFilesLabel}>You Uploaded :</Text>
                            )}

                            {/* --- MEDIA UPLOAD FIELD: Show ONE "View Shared Media" --- */}
                            {isMediaUpload ? (
                                <Pressable
                                    onPress={() =>
                                        router.push({
                                            pathname: "/roadmap/shared-media",
                                            params: {
                                                taskId: task._id,
                                                extraName: extraName,
                                                roadMapId: roadmapId!,
                                                nestedId: itemId,
                                            },
                                        })
                                    }
                                    style={{ alignItems: "center", width: "100%", paddingVertical: 6 }}
                                >
                                    <Text
                                        style={[
                                            styles.fileName,
                                            { textDecorationLine: "underline", textAlign: "center" },
                                        ]}
                                    >
                                        View Shared Media
                                    </Text>
                                </Pressable>
                            ) : (
                                /* --- NORMAL FILES: Show each file --- */
                                uniqueDocs.map((doc: any) => (
                                    <View key={doc._id || doc.id} style={styles.fileRow}>
                                        <Pressable
                                            onPress={() => Linking.openURL(doc.fileUrl)}
                                            style={{ flex: 1 }}
                                        >
                                            <Text style={styles.fileName}>
                                                : {decodeURIComponent(doc.fileName)}
                                            </Text>
                                        </Pressable>

                                        {/* If you enable delete later */}
                                        {!isMediaUpload && (
                                            <Pressable
                                                onPress={() => confirmDelete(doc)}
                                                style={styles.removeIconWrapper}
                                                disabled={!isEditable}
                                            >
                                                <Ionicons name="trash" size={20} color={isEditable ? "#ef4444" : "#999"} />
                                            </Pressable>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    )
                )}

                {/* Pending (not yet uploaded) files */}
                {hasPendingFiles &&
                    pendingFiles[extraName]?.map((f) => (
                        <View
                            key={f.id}
                            style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
                        >
                            <Text style={{ color: "white", flex: 1 }}>• {f.name} (pending)</Text>

                            <Pressable onPress={() => deletePendingLocal(f.id)} disabled={!isEditable}>
                                <Ionicons name="close-circle" size={20} color={isEditable ? "#ef4444" : "#999"} />
                            </Pressable>
                        </View>
                    ))}

                {/* Upload button */}
                <Pressable
                    style={[
                        styles.uploadButton, 
                        styles.uploadButtonWhite,
                        !isEditable && { opacity: 0.6 }
                    ]}
                    onPress={pickFile}
                    disabled={!isEditable}
                >
                    <Ionicons name="attach" size={22} color={isEditable ? "#2563eb" : "#999"} />
                    <Text style={[styles.uploadButtonText, !isEditable && { color: "#999" }]}>{buttonText}</Text>
                </Pressable>
            </View>

        );
    };

    /** ───────────────────── RENDER FIELDS ───────────────────── */

    const renderExtra = (extra: Extra, index: number): JSX.Element | null => {
        const id = `${extra.name}-${index}`;

        switch (extra.type) {
            case "UPLOAD":
                // Prepare initial files from existingExtras
                const initialDocs = existingExtras?.uploadedDocuments
                    ?.filter((batch: any) => batch.name === extra.name)
                    ?.flatMap((batch: any) => 
                        batch.files.map((f: any) => ({
                            ...f,
                            extraName: batch.name,
                            uploadBatchId: batch.uploadBatchId
                        }))
                    ) || [];

                return (
                    <View key={id} style={styles.fieldContainer}>
                        <UploadField 
                            extraName={extra.name} 
                            isEditable={(extra as any).editable !== false}
                            initialFiles={initialDocs}
                        />
                    </View>
                );

            case "TEXT_FIELD":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                            value={formData[extra.name] || ""}
                            onChangeText={v => handleChange(extra.name, v)}
                        />
                    </View>
                );

            case "TEXT_AREA":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                            multiline
                            numberOfLines={4}
                            value={formData[extra.name] || ""}
                            onChangeText={v => handleChange(extra.name, v)}
                        />
                    </View>
                );

            case "TEXT_DISPLAY":
                return (
                    <View key={id} style={styles.textDisplay}>
                        <Text style={styles.textDisplayText}>{extra.name}</Text>
                    </View>
                );

            case "CHECKBOX":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        {/* Parent checkbox */}
                        <Pressable
                            onPress={() => handleChange(extra.name, !formData[extra.name])}
                            style={styles.checkboxRow}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    formData[extra.name] && styles.checkboxChecked,
                                ]}
                            >
                                {formData[extra.name] && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{extra.name}</Text>
                        </Pressable>

                        {/* Sub-checkboxes */}
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginLeft: 36, marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const isChecked = !!formData[cbId];

                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <Pressable
                                                onPress={() =>
                                                    handleChange(cbId, !isChecked)
                                                }
                                                style={styles.checkboxRow}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        isChecked && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {isChecked && (
                                                        <Text style={styles.checkmark}>
                                                            ✓
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>
                                                    {checkbox.name}
                                                </Text>
                                            </Pressable>

                                            {checkbox.haveButton &&
                                                checkbox.buttonName && (
                                                    <Pressable
                                                        style={styles.button}
                                                        onPress={() =>
                                                            console.log(
                                                                "Button pressed",
                                                                checkbox.buttonName
                                                            )
                                                        }
                                                    >
                                                        <Text style={styles.buttonText}>
                                                            {checkbox.buttonName}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Optional button on main checkbox */}
                        {extra.haveButton && extra.buttonName && (
                            <Pressable
                                style={[styles.button, { marginTop: 8 }]}
                                onPress={() =>
                                    console.log("Button pressed", extra.buttonName)
                                }
                            >
                                <Text style={styles.buttonText}>
                                    {extra.buttonName}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                );

            case "DATE_PICKER":
                // ✅ Check if pastor is allowed to edit the date
                const isEditable = extra.checkboxes?.some(cb => cb.name === 'Allow pastor to select Date') ?? true;

                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.fieldRow}>
                            <Text
                                style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}
                            >
                                {extra.name}
                            </Text>
                            <View style={[
                                styles.dateInputContainer,
                                !isEditable && styles.dateInputDisabled
                            ]}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="DD / MM / YY"
                                    placeholderTextColor="#9cc2ff"
                                    value={formData[extra.name] !== undefined ? formData[extra.name] : (extra.date || "")}
                                    keyboardType="number-pad"
                                    maxLength={12}
                                    editable={isEditable}
                                    onChangeText={v => {
                                        if (!isEditable) return;
                                        
                                        // Remove all non-digits
                                        const raw = v.replace(/\D/g, "");
                                        
                                        // Formatting logic
                                        let formatted = "";
                                        if (raw.length > 0) {
                                            formatted = raw.slice(0, 2);
                                            if (raw.length > 2) {
                                                formatted += " / " + raw.slice(2, 4);
                                                if (raw.length > 4) {
                                                    formatted += " / " + raw.slice(4, 6);
                                                }
                                            }
                                        }
                                        
                                        // If the user is deleting and ends with a space or slash, 
                                        // we should allow them to delete the separator easily.
                                        // However, the above logic re-calculates based on raw digits.
                                        // If they delete ' / ', raw length decreases, and formatted is correct.
                                        
                                        handleChange(extra.name, formatted);
                                    }}
                                />
                            </View>
                        </View>

                        {/* Date-related checkboxes */}
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                {extra.checkboxes
                                    .filter(cb => cb.name !== 'Allow pastor to select Date' && cb.name !== 'Show date on info card')
                                    .map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const checked = !!formData[cbId];

                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <Pressable
                                                onPress={() =>
                                                    handleChange(cbId, !checked)
                                                }
                                                style={styles.checkboxRow}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        checked && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {checked && (
                                                        <Text style={styles.checkmark}>
                                                            ✓
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>
                                                    {checkbox.name}
                                                </Text>
                                            </Pressable>

                                            {checkbox.haveButton &&
                                                checkbox.buttonName && (
                                                    <Pressable
                                                        style={styles.button}
                                                        onPress={() =>
                                                            console.log(
                                                                "Button pressed",
                                                                checkbox.buttonName
                                                            )
                                                        }
                                                    >
                                                        <Text style={styles.buttonText}>
                                                            {checkbox.buttonName}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Optional button under date picker */}
                        {extra.buttonName && (
                            <Pressable
                                style={[styles.button, { marginTop: 8 }]}
                                onPress={() =>
                                    console.log("Button pressed", extra.buttonName)
                                }
                            >
                                <Text style={styles.buttonText}>
                                    {extra.buttonName}
                                </Text>
                            </Pressable>
                        )}
                    </View>
                );

            case "SECTION":
                return (
                    <View key={id} style={styles.sectionBox}>
                        <Text style={styles.sectionBoxTitle}>{extra.name}</Text>

                        {/* Section-level checkboxes */}
                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-cb-${checkbox.name}`;
                                    const checked = !!formData[cbId];

                                    return (
                                        <View key={cbId} style={{ marginBottom: 6 }}>
                                            <Pressable
                                                onPress={() =>
                                                    handleChange(cbId, !checked)
                                                }
                                                style={styles.checkboxRow}
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        checked && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {checked && (
                                                        <Text style={styles.checkmark}>
                                                            ✓
                                                        </Text>
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>
                                                    {checkbox.name}
                                                </Text>
                                            </Pressable>

                                            {checkbox.haveButton &&
                                                checkbox.buttonName && (
                                                    <Pressable
                                                        style={styles.button}
                                                        onPress={() =>
                                                            console.log(
                                                                "Button pressed",
                                                                checkbox.buttonName
                                                            )
                                                        }
                                                    >
                                                        <Text style={styles.buttonText}>
                                                            {checkbox.buttonName}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Nested sections / fields */}
                        {extra.sections && extra.sections.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                                {extra.sections.map((section, sectionIndex) =>
                                    renderExtra(section, sectionIndex)
                                )}
                            </View>
                        )}
                    </View>
                );

            case "BUTTON":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <Pressable
                            style={styles.button}
                            onPress={() => console.log("Button pressed:", extra.name)}
                        >
                            <Text style={styles.buttonText}>{extra.name}</Text>
                        </Pressable>
                    </View>
                );

            case "ASSESSMENT":
                return (
                    <View key={id} style={styles.fieldContainer}>
                        <View style={styles.assessmentButton}>
                            <View style={styles.assessmentContent}>
                                <Text style={styles.assessmentTitle}>
                                    {extra.name}
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            style={styles.button}
                            onPress={() => {
                                console.log("----------------------------------------------")
                                console.log("----------------------------------------------")
                                console.log('extra', extra);
                                console.log("----------------------------------------------")
                                console.log("----------------------------------------------")
                                if (extra.assessmentId) {
                                    router.push({
                                        pathname: "/assessments/answer-questions",
                                        params: {
                                            assessmentId: extra.assessmentId,
                                            hasPreSurvey: "true"
                                        }
                                    });
                                } else {
                                    Alert.alert("Error", "No assessment ID found for this task.");
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>
                                {extra.buttonName || "Take Assessment"}
                            </Text>
                            <Ionicons name="open-outline" size={20} color="#2563eb" />
                        </Pressable>

                        {/* Schedule Meeting Checkbox - If present in extras */}
                        {extra.checkboxes?.some(cb => cb.name === 'Schedule Meeting after the Assessment') && (
                            <View style={[styles.checkboxRow, { marginTop: 12 }]}>
                                <Ionicons name="information-circle-outline" size={20} color="#fff" />
                                <Text style={styles.checkboxLabel}>
                                    Please schedule a meeting with your mentor after completing this assessment.
                                </Text>
                            </View>
                        )}
                    </View>
                );

            default:
                return null;
        }
    };

    if (!task.extras || task.extras.length === 0) return null;

    const isSaving =
        createExtras.isPending || updateExtras.isPending || uploadDocument.isPending;

    if (isLoadingExtras || (isFetchingExtras && Object.keys(formData).length === 0)) {
        return (
            <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff", marginTop: 10, textAlign: 'center' }}>
                    Loading form data…
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                {task.extras.map((extra, index) => renderExtra(extra, index))}

                <Pressable
                    style={[
                        styles.signButton,
                        isSaving && styles.signButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#1e40af" />
                    ) : (
                        <Text style={styles.signButtonText}>
                            {isUpdateMode ? "Update Progress" : "Save Progress"}
                        </Text>
                    )}
                </Pressable>
            </ScrollView>

            <SimpleSuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Progress Saved!"
            />
        </>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    fieldContainer: { marginBottom: 24 },
    fieldDisabled: { opacity: 0.5 },
    fieldLabel: { color: 'white', fontSize: 16, marginBottom: 8, fontWeight: '500' },
    textInput: {
        backgroundColor: 'rgba(64, 156, 186, 0.5)',
        padding: 14,
        borderRadius: 8,
        color: 'white',
        fontSize: 15,
    },
    text: {
        color: 'white',
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: { backgroundColor: 'white' },
    checkmark: { color: '#1e40af', fontSize: 18, fontWeight: 'bold' },
    checkboxLabel: { flex: 1, color: 'white', fontSize: 16, lineHeight: 24 },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: 'rgba(64, 156, 186, 0.3)',
        borderRadius: 8,
        marginBottom: 8,
        gap: 12,
    },
    checklistLabel: { color: 'white', fontSize: 15, flex: 1 },

    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    uploadButtonWhite: {
        backgroundColor: '#ffffff',
    },
    uploadButtonText: {
        color: '#2563eb',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
    },

    uploadedFilesContainer: {
        marginBottom: 20,
    },
    uploadedFilesLabel: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 0,
        marginBottom: 10,
    },
    fileName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '400',
        flex: 1,
        textAlign: 'left',
        letterSpacing: 0.3,
    },
    removeIconWrapper: {
        padding: 4,
        marginLeft: 8,
    },
    dateButton: {
        backgroundColor: 'rgba(64, 156, 186, 0.5)',
        padding: 14,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16,
    },
    dateInputContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 160,
        flexShrink: 0,
    },
    dateInputDisabled: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        opacity: 0.7,
    },
    dateInput: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        padding: 0,
        minWidth: 120,
    },
    dateButtonText: { color: 'white', fontSize: 15 },
    dropdownContainer: { gap: 8 },
    dropdownOption: {
        backgroundColor: 'rgba(64, 156, 186, 0.3)',
        padding: 14,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dropdownOptionSelected: { borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.2)' },
    dropdownOptionText: { color: 'white', fontSize: 15 },
    dropdownOptionTextSelected: { color: '#34d399', fontWeight: '600' },
    signButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, alignItems: 'center' },
    signButtonDisabled: { backgroundColor: '#666', opacity: 0.6 },
    signButtonText: { color: '#1e40af', fontSize: 16, fontWeight: '600' },
    documentLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    documentLinkText: { color: '#60a5fa', fontSize: 14, textDecorationLine: 'underline' },
    helperText: { color: '#9cc2ff', fontSize: 13, marginTop: 8, textAlign: 'center' },
    sectionHeader: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },
    linkButton: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    linkButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    textDisplay: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',        //
        justifyContent: 'center',
        marginBottom: 24,
    },
    textDisplayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    assessmentButton: {
        backgroundColor: 'rgba(64, 156, 186, 0.5)',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    assessmentContent: { flex: 1 },
    assessmentTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    assessmentLabel: { color: '#9cc2ff', fontSize: 14 },
    submitButton: {
        backgroundColor: '#34d399',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: { backgroundColor: '#666', opacity: 0.6 },
    submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    sectionBox: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionBoxTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        gap: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'white',
    },
    buttonText: {
        color: '#2563eb',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    buttonTextOutline: {
        color: 'white',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
