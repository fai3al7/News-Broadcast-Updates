import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useProfileViewModel } from "../../ModelView/profileViewModel";

const UpdateProfileForm = () => {
  const {
    userData,
    profilePicture,
    setProfilePicture,
    handleUpdateName,
    fetchUserData,
    loading,
  } = useProfileViewModel();

  const [name, setName] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setProfilePicture(userData.profilePicture);
    }
  }, [userData]);

  const handleImagePick = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setProfilePicture(selectedImage);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const handleSubmit = () => {
    handleUpdateName( name);
  };

  return (
    <View style={styles.container}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={
            profilePicture
              ? { uri: profilePicture }
              : require("../../../assets/images/icon.png")
          }
          style={styles.profileImage}
        />
        <Button
          mode="contained"
          onPress={handleImagePick}
          loading={loading}
          style={styles.button}
        >
          Change Profile Picture
        </Button>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
        >
          UPDATE PROFILE
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  button: {
    borderRadius: 20,
    backgroundColor: "black",
  },
  formContainer: {
    flex: 1,
  },
  input: {
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: "black",
  },
});

export default UpdateProfileForm;
