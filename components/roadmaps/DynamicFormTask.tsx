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
import SimpleSuccessModal from '@/components/atom/SimpleSuccessModal';
import { useCreateRoadmapExtras, useRoadmapExtras, useUpdateRoadmapExtras } from '@/hooks/roadmaps/useRoadmaps';
import { Extra, NestedRoadmap } from '@/lib/roadmap/types';
import { useAuthStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    task: NestedRoadmap;
    phaseId?: string;
    itemId?: string;
}

export function DynamicFormTask({ task, phaseId: roadmapId, itemId }: Props) {
    const router = useRouter();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Validate MongoDB ObjectId format
    const isValidObjectId = (id: string | undefined) => {
        if (!id) return false;
        return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Fetch existing extras data
    const { data: existingExtras, isLoading: isLoadingExtras } = useRoadmapExtras(
        isValidObjectId(roadmapId) ? roadmapId : undefined,
        isValidObjectId(itemId) ? itemId : undefined,
        isValidObjectId(user?.id) ? user?.id : undefined
    );

    // Mutations
    const createExtras = useCreateRoadmapExtras();
    const updateExtras = useUpdateRoadmapExtras();

    // Determine if this is update mode
    const isUpdateMode = !!existingExtras;

    // Initialize form data
    useEffect(() => {
        if (existingExtras?.extras && Array.isArray(existingExtras.extras)) {
            const loadedData: Record<string, any> = {};
            existingExtras.extras.forEach((item: any) => {
                if (item.name && item.value !== undefined) {
                    loadedData[item.name] = item.value;
                }
            });
            console.log('📥 Loaded existing data:', loadedData);
            setFormData(loadedData);
        } else {
            const initialData: Record<string, any> = {};
            task.extras?.forEach(extra => {
                if (extra.date) {
                    initialData[extra.name] = extra.date;
                }
            });
            console.log('🆕 Using default data:', initialData);
            setFormData(initialData);
        }
    }, [existingExtras, task]);

    const handleChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    // Validate form - allow partial submissions
    const validateForm = (): boolean => {
        // Just check if there's at least some data filled in
        const hasData = Object.keys(formData).length > 0;

        if (!hasData) {
            Alert.alert(
                'No Data',
                'Please fill in at least one field before saving progress'
            );
            return false;
        }

        return true;
    };

    // Helper to get the correct type for each field
    const getExtraType = (fieldName: string, value: any): string => {
        const extraDef = task.extras?.find(e => e.name === fieldName);

        if (extraDef) {
            return extraDef.type;
        }

        // Fallback to inferring from value
        if (typeof value === 'boolean') return 'CHECKBOX';
        if (typeof value === 'object' && value.uri) return 'UPLOAD';
        if (fieldName.toLowerCase().includes('date')) return 'DATE_PICKER';
        if (typeof value === 'string' && value.length > 100) return 'TEXT_AREA';
        return 'TEXT_FIELD';
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        try {
            const extrasArray = Object.entries(formData).map(([name, value]) => ({
                type: getExtraType(name, value),
                name: name,
                value: value,
            }));

            console.log('📤 Submitting extras:', extrasArray);

            if (isUpdateMode) {
                await updateExtras.mutateAsync({
                    roadMapId: roadmapId!,
                    payload: {
                        extras: extrasArray,
                    },
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

            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                router.back();
            }, 2000);

        } catch (error: any) {
            console.error('❌ Submission error:', error);
            Alert.alert(
                'Submission Failed',
                error.message || 'Failed to submit. Please try again.'
            );
        }
    };

    const renderExtra = (extra: Extra, index: number) => {
        const fieldId = `${extra.name}-${index}`;

        switch (extra.type) {
            case 'TEXT_FIELD':
                return (
                    <View key={fieldId} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                            value={formData[extra.name] || ''}
                            onChangeText={v => handleChange(extra.name, v)}
                        />
                    </View>
                );

            case 'TEXT_AREA':
                return (
                    <View key={fieldId} style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>{extra.name}</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder={extra.placeHolder}
                            placeholderTextColor="#9cc2ff"
                            multiline
                            numberOfLines={4}
                            value={formData[extra.name] || ''}
                            onChangeText={v => handleChange(extra.name, v)}
                        />
                    </View>
                );

            case 'TEXT_DISPLAY':
                return (
                    <View key={fieldId} style={styles.textDisplay}>
                        <Text style={styles.textDisplayText}>{extra.name}</Text>
                    </View>
                );

            case 'CHECKBOX':
                return (
                    <View key={fieldId} style={styles.fieldContainer}>
                        <Pressable
                            onPress={() => handleChange(extra.name, !formData[extra.name])}
                            style={styles.checkboxRow}
                        >
                            <View style={[styles.checkbox, formData[extra.name] && styles.checkboxChecked]}>
                                {formData[extra.name] && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>{extra.name}</Text>
                        </Pressable>

                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginLeft: 36, marginTop: 8 }}>
                                {extra.checkboxes.map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-${cbIndex}`;
                                    return (
                                        <Pressable
                                            key={cbId}
                                            onPress={() => handleChange(cbId, !formData[cbId])}
                                            style={styles.checkboxRow}
                                        >
                                            <View style={[styles.checkbox, formData[cbId] && styles.checkboxChecked]}>
                                                {formData[cbId] && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                            <Text style={styles.checkboxLabel}>{checkbox.name}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}

                        {extra.haveButton && extra.buttonName && (
                            <Pressable style={styles.button} onPress={() => console.log('Button pressed')}>
                                <Text style={styles.buttonText}>{extra.buttonName}</Text>
                            </Pressable>
                        )}
                    </View>
                );

            case 'DATE_PICKER':
                return (
                    <View key={fieldId} style={styles.fieldContainer}>
                        <View style={styles.fieldRow}>
                            <Text style={[styles.fieldLabel, { marginBottom: 0, flex: 1 }]}>
                                {extra.name}
                            </Text>
                            <View style={styles.dateInputContainer}>
                                <TextInput
                                    style={styles.dateInput}
                                    placeholder="DD / MM / YY"
                                    placeholderTextColor="#9cc2ff"
                                    value={formData[extra.name] || extra.date || ''}
                                    keyboardType="number-pad"
                                    maxLength={14}
                                    onChangeText={v => {
                                        const raw = v.replace(/\D/g, '');
                                        let formatted = '';
                                        if (raw.length >= 1) formatted = raw.slice(0, 2);
                                        if (raw.length >= 3) formatted += ' / ' + raw.slice(2, 4);
                                        if (raw.length >= 5) formatted += ' / ' + raw.slice(4, 6);
                                        handleChange(extra.name, formatted);
                                    }}
                                />
                            </View>
                        </View>

                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View style={{ marginTop: 12 }}>
                                {extra.checkboxes.map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-checkbox-${cbIndex}`;
                                    return (
                                        <Pressable
                                            key={cbId}
                                            onPress={() => handleChange(cbId, !formData[cbId])}
                                            style={styles.checkboxRow}
                                        >
                                            <View style={[styles.checkbox, formData[cbId] && styles.checkboxChecked]}>
                                                {formData[cbId] && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                            <Text style={styles.checkboxLabel}>{checkbox.name}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}

                        {extra.buttonName && (
                            <Pressable style={styles.button} onPress={() => console.log('Button pressed')}>
                                <Text style={styles.buttonText}>{extra.buttonName}</Text>
                            </Pressable>
                        )}
                    </View>
                );

            case 'SECTION':
                return (
                    <View key={fieldId} style={styles.sectionBox}>
                        <Text style={styles.sectionBoxTitle}>{extra.name}</Text>

                        {extra.checkboxes && extra.checkboxes.length > 0 && (
                            <View>
                                {extra.checkboxes.map((checkbox, cbIndex) => {
                                    const cbId = `${extra.name}-checkbox-${cbIndex}`;
                                    return (
                                        <View key={cbId}>
                                            <Pressable
                                                onPress={() => handleChange(cbId, !formData[cbId])}
                                                style={styles.checkboxRow}
                                            >
                                                <View style={[styles.checkbox, formData[cbId] && styles.checkboxChecked]}>
                                                    {formData[cbId] && <Text style={styles.checkmark}>✓</Text>}
                                                </View>
                                                <Text style={styles.checkboxLabel}>{checkbox.name}</Text>
                                            </Pressable>

                                            {checkbox.haveButton && checkbox.buttonName && (
                                                <Pressable style={styles.button} onPress={() => console.log('Button pressed')}>
                                                    <Text style={styles.buttonText}>{checkbox.buttonName}</Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {extra.sections && extra.sections.length > 0 && (
                            <View>
                                {extra.sections.map((section, sectionIndex) =>
                                    renderExtra(section, sectionIndex)
                                )}
                            </View>
                        )}
                    </View>
                );

            case 'UPLOAD':
                return (
                    <View key={fieldId} style={styles.fieldContainer}>
                        <Pressable
                            style={[styles.uploadButton, styles.uploadButtonWhite]}
                            onPress={async () => {
                                const res = await DocumentPicker.getDocumentAsync({
                                    type: '*/*',
                                    multiple: false,
                                });
                                if (!res.canceled && res.assets[0]) {
                                    handleChange(extra.name, {
                                        uri: res.assets[0].uri,
                                        name: res.assets[0].name,
                                        type: res.assets[0].mimeType,
                                    });
                                }
                            }}
                        >
                            <Ionicons name="attach" size={22} color="#2563eb" />
                            <Text style={styles.uploadButtonText}>
                                {formData[extra.name] ? 'File Selected' : extra.name}
                            </Text>
                        </Pressable>
                    </View>
                );

            case 'BUTTON':
                return (
                    <View key={fieldId} style={styles.fieldContainer}>
                        <Pressable
                            style={styles.button}
                            onPress={() => console.log('Button pressed:', extra.name)}
                        >
                            <Text style={styles.buttonText}>{extra.name}</Text>
                        </Pressable>
                    </View>
                );

            default:
                return null;
        }
    };

    if (!task.extras || task.extras.length === 0) {
        return null;
    }

    if (isLoadingExtras) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: '#fff', marginTop: 16 }}>Loading form data...</Text>
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
                        (createExtras.isPending || updateExtras.isPending) && styles.signButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={createExtras.isPending || updateExtras.isPending}
                >
                    {(createExtras.isPending || updateExtras.isPending) ? (
                        <ActivityIndicator color="#1e40af" />
                    ) : (
                        <Text style={styles.signButtonText}>
                            {isUpdateMode ? 'Save Progress' : 'Save Progress'}
                        </Text>
                    )}
                </Pressable>
            </ScrollView>

            <SimpleSuccessModal
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={`Progress Saved!
Your work has been saved successfully.`}
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
