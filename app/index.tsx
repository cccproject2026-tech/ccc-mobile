// // import { Stack, router } from "expo-router"
// // import React from "react"
// // import { Pressable, StyleSheet, Text, View } from "react-native"
// // import { SafeAreaView } from "react-native-safe-area-context"

// // export default function index() {

// //     const onSelect = (role: string) => {
// //         console.log(role)

// //         // Navigate to the appropriate tab layout based on role
// //         switch (role) {
// //             case 'pastor':
// //                 router.push('/(pastor-tabs)')
// //                 break
// //             case 'mentor':
// //                 router.push('/(mentor-tabs)')
// //                 break
// //             case 'director':
// //                 router.push('/(director-tabs)')
// //                 break
// //                  case 'login':
// //                 router.push('/(login)')
// //                 break
// //             default:
// //                 console.log('Unknown role:', role)
// //         }
// //     }

// //   return (
// //     <>
// //       <Stack.Screen options={{ headerShown: false }} />
// //       <SafeAreaView style={styles.container}>
// //       <View style={[{ backgroundColor: "#ffffff" }]}>
// //         <Text style={styles.title}>Select Your Role</Text>
// //         <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
// //           <View>
// //             {/* <Button 
// //           title="Pastor" 
// //           onPress={() => onSelect('pastor')}
// //         style={{backgroundColor:""}}
// //         /> */}
// //             <Pressable
// //               style={{ padding: 10, backgroundColor: "yellow" }}
// //               onPress={() => onSelect("pastor")}
// //             >
// //               <Text>Pastor</Text>
// //             </Pressable>
// //           </View>
// //           <View>
// //             {/* <Button 
// //           title="Pastor" 
// //           onPress={() => onSelect('pastor')}
// //         style={{backgroundColor:""}}
// //         /> */}
// //             <Pressable
// //               style={{ padding: 10, backgroundColor: "yellow" }}
// //               onPress={() => onSelect("mentor")}
// //             >
// //               <Text>Mentor</Text>
// //             </Pressable>
// //           </View>
// //           <View>

// //             <Pressable
// //               style={{ padding: 10, backgroundColor: "yellow" }}
// //               onPress={() => onSelect("director")}
// //             >
// //               <Text>Director</Text>
// //             </Pressable>

// //             <Pressable
// //               style={{ padding: 10, backgroundColor: "yellow" }}
// //               onPress={() => router.push("/(auth)/login")}
// //             >
// //               <Text>Admin</Text>
// //             </Pressable>
// //           </View>

// //            <View>

// //             <Pressable
// //               style={{ padding: 10, backgroundColor: "yellow" }}
// //               onPress={() => onSelect("login")}
// //             >
// //               <Text>Login</Text>
// //             </Pressable>
// //           </View>
// //         </View>
// //       </View>
// //     </SafeAreaView>
// //     </>
// //   )
// // }


// // const styles = StyleSheet.create({
// //     container: {
// //       flex: 1,
// //       justifyContent: "center",
// //       alignItems: "center",
// //       backgroundColor: "#ffffff",
// //     },
// //     text: {
// //       fontSize: 20,
// //       fontWeight: "bold",
// //     },
// //     title: {
// //       fontSize: 24,
// //       fontWeight: "bold",
// //       marginBottom: 30,
// //     },

// //     backButton: {
// //       padding: 10,
// //       backgroundColor: "#f5f5f5",
// //     },
// //   });



// // // app/index.tsx
// import { useAuth } from "@/context/AuthContext";
// import { STORAGE_KEYS } from "@/lib/user/types";
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Stack, router } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function RoleSelectionScreen() {
//   const [isClearing, setIsClearing] = useState(false);
//   const { resetAuth, isAuthenticated, user, isLoading } = useAuth(); // ADD isAuthenticated, user, isLoading

//   // Check if user is already logged in on mount
//   useEffect(() => {
//     if (!isLoading && isAuthenticated && user) {
//       console.log("User already logged in:", user);
//       // Redirect to their dashboard based on role
//       if (user.role === "pastor") {
//         router.replace("/(pastor-tabs)/(tabs)");
//       }
//       // Add other roles when needed
//     }
//   }, [isAuthenticated, user, isLoading]);

//   const onSelect = (role: string) => {
//     console.log("Selected role:", role);

//     // Navigate based on role
//     switch (role) {
//       case "pastor":
//         // Check if already authenticated
//         if (isAuthenticated && user?.role === "pastor") {
//           router.push("/(pastor-tabs)/(tabs)");
//         } else {
//           // Pastor requires authentication - go to login
//           router.push("/(login)");
//         }
//         break;
//       case "mentor":
//         // Mentor direct access (no auth for testing)
//         router.push("/(mentor-tabs)");
//         break;
//       case "director":
//         // Director direct access (no auth for testing)
//         router.push("/(director-tabs)/(tabs)");
//         break;
//       default:
//         console.log("Unknown role:", role);
//     }
//   };

//   const handleClearStorage = async () => {
//     Alert.alert(
//       "Clear All Data?",
//       "This will reset all authentication data, interest submissions, and settings. Perfect for testing from scratch!",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Clear All",
//           style: "destructive",
//           onPress: async () => {
//             setIsClearing(true);
//             try {
//               // Clear all storage keys
//               await AsyncStorage.multiRemove([
//                 STORAGE_KEYS.AUTH_USER,
//                 STORAGE_KEYS.AUTH_TOKEN,
//                 STORAGE_KEYS.INTEREST_STATUS,
//                 STORAGE_KEYS.INTEREST_DATA,
//                 STORAGE_KEYS.PASSWORD_SET,
//               ]);

//               console.log("✅ All storage cleared successfully");

//               // Reset the auth context state
//               resetAuth();

//               Alert.alert(
//                 "Success!",
//                 "All data has been cleared. You can now test from scratch.",
//                 [{ text: "OK" }]
//               );
//             } catch (error) {
//               console.error("Failed to clear storage:", error);
//               Alert.alert("Error", "Failed to clear storage. Please try again.");
//             } finally {
//               setIsClearing(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // Show loading while checking auth state
//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <>
//       <Stack.Screen options={{ headerShown: false }} />
//       <SafeAreaView style={styles.container}>
//         {/* Clear Storage Button (Top Right) */}
//         <Pressable
//           style={styles.clearButton}
//           onPress={handleClearStorage}
//           disabled={isClearing}
//         >
//           {isClearing ? (
//             <ActivityIndicator color="#fff" size="small" />
//           ) : (
//             <>
//               <Ionicons name="trash-outline" size={20} color="#fff" />
//               <Text style={styles.clearButtonText}>Clear Data</Text>
//             </>
//           )}
//         </Pressable>

//         <View style={styles.content}>
//           <Text style={styles.title}>Select Your Role</Text>
//           <Text style={styles.subtitle}>
//             Choose your role to access the Center for Community Change
//           </Text>

//           {/* Show current user status if logged in */}
//           {isAuthenticated && user && (
//             <View style={styles.statusBanner}>
//               <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
//               <Text style={styles.statusText}>
//                 Logged in as <Text style={styles.boldText}>{user.firstName} {user.lastName}</Text>
//               </Text>
//             </View>
//           )}

//           <View style={styles.buttonContainer}>
//             {/* Pastor - Requires Authentication */}
//             <Pressable
//               style={[styles.roleButton, styles.activeButton]}
//               onPress={() => onSelect("pastor")}
//             >
//               <Text style={styles.roleButtonText}>Pastor</Text>
//               <Text style={styles.roleDescription}>
//                 {isAuthenticated && user?.role === "pastor"
//                   ? "Go to Dashboard"
//                   : "Login or submit interest to join"}
//               </Text>
//             </Pressable>

//             {/* Mentor - Direct Access (Testing) */}
//             <Pressable
//               style={[styles.roleButton, styles.activeButton, styles.testingButton]}
//               onPress={() => onSelect("mentor")}
//             >
//               <Text style={styles.roleButtonText}>Mentor</Text>
//               <Text style={styles.roleDescription}>Direct access (Testing)</Text>
//             </Pressable>

//             {/* Director - Direct Access (Testing) */}
//             <Pressable
//               style={[styles.roleButton, styles.activeButton, styles.testingButton]}
//               onPress={() => onSelect("director")}
//             >
//               <Text style={styles.roleButtonText}>Director</Text>
//               <Text style={styles.roleDescription}>Direct access (Testing)</Text>
//             </Pressable>
//           </View>

//           {/* Info Box */}
//           <View style={styles.infoBox}>
//             <Text style={styles.infoText}>
//               🔐 <Text style={styles.boldText}>Pastor</Text>: Full authentication flow
//             </Text>
//             <Text style={styles.infoText}>
//               🧪 <Text style={styles.boldText}>Mentor/Director</Text>: Testing mode (no auth)
//             </Text>
//             <Text style={styles.infoText}>
//               🗑️ <Text style={styles.boldText}>Clear Data</Text>: Reset everything for testing
//             </Text>
//           </View>
//         </View>
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#176192",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     color: "#fff",
//     fontSize: 16,
//   },
//   clearButton: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 59, 48, 0.9)",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 20,
//     gap: 8,
//     zIndex: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   clearButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   content: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 12,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "rgba(255,255,255,0.8)",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   statusBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(76, 175, 80, 0.2)",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 10,
//     marginBottom: 20,
//     gap: 8,
//   },
//   statusText: {
//     color: "#fff",
//     fontSize: 14,
//   },
//   buttonContainer: {
//     width: "100%",
//     maxWidth: 400,
//     gap: 16,
//   },
//   roleButton: {
//     padding: 20,
//     borderRadius: 12,
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   activeButton: {
//     backgroundColor: "#fff",
//     borderColor: "#fff",
//   },
//   testingButton: {
//     backgroundColor: "rgba(255,255,255,0.95)",
//     borderColor: "#FFD700",
//     borderStyle: "dashed",
//   },
//   roleButtonText: {
//     fontSize: 20,
//     fontWeight: "600",
//     color: "#1A5490",
//     marginBottom: 4,
//   },
//   roleDescription: {
//     fontSize: 14,
//     color: "#666",
//   },
//   infoBox: {
//     marginTop: 40,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     padding: 16,
//     borderRadius: 12,
//     width: "100%",
//     maxWidth: 400,
//   },
//   infoText: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: 13,
//     marginBottom: 6,
//   },
//   boldText: {
//     fontWeight: "600",
//   },
// });


import { useOnboardingStore } from '@/stores';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type RoleType = 'pastor' | 'mentor' | 'director';

export default function RoleSelectionScreen() {
    const router = useRouter();
    const [isClearing, setIsClearing] = useState(false);

    // Store hooks
    const { user, isAuthenticated, logout } = useAuthStore();
    const { reset: resetOnboarding } = useOnboardingStore();

    // Handle clear storage
    const handleClearStorage = useCallback(async () => {
        Alert.alert(
            'Clear All Data',
            'This will log you out and clear all stored data. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        setIsClearing(true);
                        try {
                            console.log('🗑️ Clearing all data...');

                            // 1. Logout (clears auth store + secure storage)
                            await logout();
                            console.log('✅ Auth store cleared');

                            // 2. Reset onboarding store
                            resetOnboarding();
                            console.log('✅ Onboarding store cleared');

                            // 3. Clear all AsyncStorage
                            await AsyncStorage.clear();
                            console.log('✅ AsyncStorage cleared');

                            console.log('✅ All data cleared successfully');

                            Alert.alert('Success', 'All data cleared. Refreshing...');

                            // 4. Refresh the screen
                            // router.replace('/(authenticated)/role-selection');
                        } catch (error) {
                            console.error('❌ Error clearing storage:', error);
                            Alert.alert('Error', 'Failed to clear data');
                        } finally {
                            setIsClearing(false);
                        }
                    },
                },
            ]
        );
    }, [logout, resetOnboarding, router]);

    // Handle role selection
    const onSelect = useCallback(
        (role: RoleType) => {
            console.log('🎯 Role selected:', role);
            console.log('🔐 Authenticated:', isAuthenticated);
            console.log('👤 User:', user?.email);

            if (role === 'pastor') {
                // Pastor requires authentication
                if (isAuthenticated && user?.role === 'pastor') {
                    // Authenticated pastor goes to dashboard
                    console.log('✅ Navigating to pastor dashboard');
                    router.push('/(pastor)/(tabs)');
                } else {
                    // Not authenticated, go to login/welcome
                    console.log('📝 Navigating to unauthenticated flow');
                    router.push('/(unauthenticated)');
                }
            } else if (role === 'mentor') {
                // Mentor - Direct access for testing
                console.log('🧪 Navigating to mentor (testing)');
                router.push('/(mentor-tabs)');
            } else if (role === 'director') {
                // Director - Direct access for testing
                console.log('🧪 Navigating to director (testing)');
                router.push('/(director)/(tabs)');
            }
        },
        [isAuthenticated, user, router]
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Clear Storage Button (Top Right) */}
            <Pressable
                style={styles.clearButton}
                onPress={handleClearStorage}
                disabled={isClearing}
            >
                {isClearing ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <>
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                        <Text style={styles.clearButtonText}>Clear Data</Text>
                    </>
                )}
            </Pressable>

            <View style={styles.content}>
                <Text style={styles.title}>Select Your Role</Text>
                <Text style={styles.subtitle}>
                    Choose your role to access the Center for Community Change
                </Text>

                {/* Show current user status if logged in */}
                {isAuthenticated && user && (
                    <View style={styles.statusBanner}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.statusText}>
                            Logged in as{' '}
                            <Text style={styles.boldText}>
                                {user.firstName} {user.lastName}
                            </Text>
                            {' '}({user.role})
                        </Text>
                    </View>
                )}

                <View style={styles.buttonContainer}>
                    {/* Pastor - Requires Authentication */}
                    <Pressable
                        style={[styles.roleButton, styles.activeButton]}
                        onPress={() => onSelect('pastor')}
                    >
                        <Text style={styles.roleButtonText}>Pastor</Text>
                        <Text style={styles.roleDescription}>
                            {isAuthenticated && user?.role === 'pastor'
                                ? '✅ Go to Dashboard'
                                : '📝 Login or submit interest to join'}
                        </Text>
                    </Pressable>

                    {/* Mentor - Direct Access (Testing) */}
                    <Pressable
                        style={[
                            styles.roleButton,
                            styles.activeButton,
                            styles.testingButton,
                        ]}
                        onPress={() => onSelect('mentor')}
                    >
                        <Text style={styles.roleButtonText}>Mentor</Text>
                        <Text style={styles.roleDescription}>
                            🧪 Direct access (Testing)
                        </Text>
                    </Pressable>

                    {/* Director - Direct Access (Testing) */}
                    <Pressable
                        style={[
                            styles.roleButton,
                            styles.activeButton,
                            styles.testingButton,
                        ]}
                        onPress={() => onSelect('director')}
                    >
                        <Text style={styles.roleButtonText}>Director</Text>
                        <Text style={styles.roleDescription}>
                            🧪 Direct access (Testing)
                        </Text>
                    </Pressable>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        🔐 <Text style={styles.boldText}>Pastor</Text>: Full authentication
                        flow with onboarding
                    </Text>
                    <Text style={styles.infoText}>
                        🧪 <Text style={styles.boldText}>Mentor/Director</Text>: Testing
                        mode (no auth required)
                    </Text>
                    <Text style={styles.infoText}>
                        🗑️ <Text style={styles.boldText}>Clear Data</Text>: Reset
                        everything and start fresh
                    </Text>
                </View>

                {/* Debug Info (Dev Only) */}
                {__DEV__ && (
                    <View style={styles.debugBox}>
                        <Text style={styles.debugTitle}>Debug Info:</Text>
                        <Text style={styles.debugText}>
                            Authenticated: {isAuthenticated ? 'Yes' : 'No'}
                        </Text>
                        <Text style={styles.debugText}>
                            User Role: {user?.role || 'None'}
                        </Text>
                        <Text style={styles.debugText}>
                            User ID: {user?.id || 'None'}
                        </Text>
                        <Text style={styles.debugText}>
                            User Email: {user?.email || 'None'}
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#176192',
    },
    clearButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 20,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 20,
        gap: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 400,
        gap: 16,
    },
    roleButton: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
    },
    activeButton: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    testingButton: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#FFD700',
        borderStyle: 'dashed',
    },
    roleButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A5490',
        marginBottom: 4,
    },
    roleDescription: {
        fontSize: 14,
        color: '#666',
    },
    infoBox: {
        marginTop: 40,
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
    },
    infoText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        marginBottom: 6,
    },
    boldText: {
        fontWeight: '600',
    },
    debugBox: {
        marginTop: 24,
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    debugTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
});
