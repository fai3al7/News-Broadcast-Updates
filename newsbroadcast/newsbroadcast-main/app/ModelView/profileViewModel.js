import { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  uploadProfilePictureToStorage,
  updateUserDataInFirestore,
} from "../Model/profileModel";
import { Alert } from "react-native";

export const useProfileViewModel = () => {
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserData({
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        location: user.location || "",
        profilePicture: user.photoURL || "",
      });
      setProfilePicture(user.photoURL || "");
    }
  };

  const handleUpdateName = async (name) => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (typeof name !== "string" || name.trim() === "") {
        throw new Error("Invalid name value. Please enter a valid name.");
      }

      let uploadedUrl = profilePicture;

      // Upload profile picture if a new one is selected
      if (profilePicture && profilePicture.startsWith("file://")) {
        uploadedUrl = await uploadProfilePictureToStorage(
          user.uid,
          profilePicture
        );
      }

      // Update Firebase Authentication
      await updateProfile(user, { displayName: name, photoURL: uploadedUrl });

      // Update Firestore
      await updateUserDataInFirestore(user.uid, {
        name,
        profilePicture: uploadedUrl,
      });

      setLoading(false);
      Alert.alert("Name updated successfully!");
    } catch (error) {
      console.error("Error updating name: ", error);
      setLoading(false);
      Alert.alert("Failed to update name:", error.message);
    }
  };

  const handleUpdateLocation = async (location) => {
    setLoading(true);
    try {
      if (typeof location !== "string" || location.trim() === "") {
        throw new Error(
          "Invalid location value. Please enter a valid location."
        );
      }

      const auth = getAuth();
      const user = auth.currentUser;

      // Update Firestore with the new location as a string
      await updateUserDataInFirestore(user.uid, { location });

      setLoading(false);
      Alert.alert("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location: ", error);
      setLoading(false);
      Alert.alert("Failed to update location:", error.message);
    }
  };

  return {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateName,
    handleUpdateLocation,
    fetchUserData,
    loading,
  };
};
