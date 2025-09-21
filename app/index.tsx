import { Stack, router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function index() {

    const onSelect = (role: string) => {
        console.log(role)
        
        // Navigate to the appropriate tab layout based on role
        switch (role) {
            case 'pastor':
                router.push('/(pastor-tabs)')
                break
            case 'mentor':
                router.push('/(mentor-tabs)')
                break
            case 'director':
                router.push('/(director-tabs)')
                break
            default:
                console.log('Unknown role:', role)
        }
    }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
      <View style={[{ backgroundColor: "#ffffff" }]}>
        <Text style={styles.title}>Select Your Role</Text>
        <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <View>
            {/* <Button 
          title="Pastor" 
          onPress={() => onSelect('pastor')}
        style={{backgroundColor:""}}
        /> */}
            <Pressable
              style={{ padding: 10, backgroundColor: "yellow" }}
              onPress={() => onSelect("pastor")}
            >
              <Text>Pastor</Text>
            </Pressable>
          </View>
          <View>
            {/* <Button 
          title="Pastor" 
          onPress={() => onSelect('pastor')}
        style={{backgroundColor:""}}
        /> */}
            <Pressable
              style={{ padding: 10, backgroundColor: "yellow" }}
              onPress={() => onSelect("mentor")}
            >
              <Text>Mentor</Text>
            </Pressable>
          </View>
          <View>

            <Pressable
              style={{ padding: 10, backgroundColor: "yellow" }}
              onPress={() => onSelect("director")}
            >
              <Text>Director</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
    </>
  )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffffff",
    },
    text: {
      fontSize: 20,
      fontWeight: "bold",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 30,
    },
  
    backButton: {
      padding: 10,
      backgroundColor: "#f5f5f5",
    },
  });
  