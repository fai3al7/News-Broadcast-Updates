import React, { useState, useEffect } from "react";
import "react-native-gesture-handler";
import "react-native-reanimated";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import newwImage from "../assets/images/neww.png";

import * as Notifications from "expo-notifications";
import { Link, useNavigation, Stack } from "expo-router";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission not granted for notifications");
  }
};

// Retrieve the Expo Push Token
const getPushToken = async () => {
  const { data: token } = await Notifications.getExpoPushTokenAsync();
  console.log("Expo Push Token:", token); // Debugging
  return token;
};

const Index = () => {
  const [notification, setNotification] = useState(null); // Current notification
  const [notifications, setNotifications] = useState([]); // Array of all notifications
  const navigation = useNavigation();

  useEffect(() => {
    // Request notification permissions and get push token
    requestNotificationPermissions();

    // Handle incoming notifications
   

    // Handle user responses to notifications
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    // Cleanup listeners on unmount
    return () => {
     
      responseListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "",
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "#fff",
        }}
      />
      <View style={styles.topRight}>
        <View style={[styles.circle, styles.blackCircle]} />
      </View>

      <Image source={newwImage} style={styles.logo} />
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>Welcome to the App</Text>
        <Text style={styles.appDescription}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at
          consequat nulla, vel aliquam lectus.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Link href={"/View/Signin"} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Signin</Text>
          </Pressable>
        </Link>
        <Link href={"/View/Signup"} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>SignUp</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.bottomLeft}>
        <View style={[styles.circle, styles.blackCircleBottom]} />
      </View>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    width: windowWidth,
    height: windowHeight,
  },
  topRight: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
  },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    flexDirection: "row",
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 100,
    position: "absolute",
  },
  blackCircle: {
    backgroundColor: "black",
    zIndex: 1,
    right: windowWidth * -0.1,
    top: windowHeight * -0.05,
  },
  blackCircleBottom: {
    backgroundColor: "black",
    zIndex: 1,
    left: windowWidth * -0.3,
    bottom: windowHeight * -0.42,
  },
  logo: {
    width: windowWidth * 0.8,
    height: windowWidth * 0.4,
    resizeMode: "contain",
  },
  headingContainer: {
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  appDescription: {
    fontSize: 16,
    color: "#000000",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: windowHeight * 0.05,
    marginBottom: windowHeight * 0.05,
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

export default Index;
