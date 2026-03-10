import { useState } from "react";
import { signIn } from "../Model/signinModel"; // Assuming you have a similar authModel for sign-in
import { getUserData } from "../Model/getUserModel"; // Assuming you have a function to retrieve user data
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import * as Notifications from "expo-notifications"; // Import Expo notifications
import { useRouter } from "expo-router";
import { db } from "../../firebaseConfig"; // Adjust to your Firebase config path
import { Alert } from "react-native";

export const useSignInViewModel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const auth = getAuth(); // Initialize Firebase Auth

  const handleSignIn = async () => {
    try {
      const userCredential = await signIn(email, password); // Sign in the user
      const userData = await getUserData(userCredential.user.uid); // Get user data

      // Check if the user's status is 'disabled'
      if (userData.status === "disabled") {
        Alert.alert("Account Disabled", "Your account has been disabled. Please contact support.");
        await auth.signOut(); // Log out the user
        return; // Exit the function early
      }

      // Request notification permissions
      await requestNotificationPermissions();

      // Get Expo Push Token
      const pushToken = await Notifications.getExpoPushTokenAsync();

      // Store the push token in Firestore under the user document
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          expoPushToken: pushToken.data, // Save the token
        },
        { merge: true }
      );

      if (userData.status === "Admin") {
        router.push("/View/AdminFeed/AdminHomeScreen/Home");
      } else {
        router.push("/View/NewsFeed/HomeScreen/UserHome");
      }

      console.log("User data:", userData);
      console.log("User signed in successfully!");
    } catch (error) {
      console.error("Error signing in:", error);
      Alert.alert("Incorrect email or password. Please try again.");
    }
  };

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission not granted for notifications");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSignIn,
  };
};
