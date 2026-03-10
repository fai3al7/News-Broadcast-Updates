import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import usePostViewModel from "../../../ModelView/postViewModel";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

const PostPage = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    mediaType,
    setMediaType,
    category,
    setCategory,
    setLocation,
    handleCreatePost,
  } = usePostViewModel();

  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const [categories, setCategories] = useState([
    { label: "Sports", value: "sports" },
    { label: "Tech", value: "tech" },
    { label: "Entertainment", value: "entertainment" },
    { label: "Crime", value: "crime" },
    { label: "Politics", value: "politics" },
  ]);

  const MAX_FILE_SIZE_MB = 50;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setLocation(userDoc.data().location);
          }
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
        Alert.alert("Error", "Couldn't fetch user location.");
      }
    };
    fetchUserLocation();
  }, []);

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need permission to access your media.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedFile = result.assets[0];
      if (selectedFile.fileSize > MAX_FILE_SIZE_BYTES) {
        Alert.alert("File too large", `The selected file exceeds ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      const fileName = selectedFile.uri.split("/").pop();
      setFile({ ...selectedFile, name: fileName });
      setMediaType(selectedFile.type);
    }
  };

  const handlePostCreation = async () => {
    const Category = isCustomInput ? customCategory : category;

    if (file && Category) {
      setLoading(true);
      try {
        await handleCreatePost(title, description, file, mediaType, Category);
        onClose();
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Error creating post, please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please complete all fields before posting.");
    }
  };

  const onClose = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setMediaType(null);
    setCategory("");
    alert("Post created successfully.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.scrollView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
     
        <Text style={styles.header}>Create a Post</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <DropDownPicker
          open={openDropdown}
          value={category}
          items={categories}
          setOpen={setOpenDropdown}
          setValue={setCategory}
          placeholder="Select a category"
          containerStyle={styles.dropdownContainer}
          style={styles.dropdown}
        />
        
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        
        <TouchableOpacity style={styles.button} onPress={pickFile}>
          <Text style={styles.buttonText}>Pick an Image or Video</Text>
        </TouchableOpacity>
        
        {file && (
          <View style={styles.mediaPreview}>
            {mediaType === "image" ? (
              <Image source={{ uri: file.uri }} style={styles.previewImage} />
            ) : mediaType === "video" ? (
              <Video
                source={{ uri: file.uri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode="contain"
                onError={(error) => console.error("Video Error:", error)}
              />
            ) : (
              <Text>Unsupported media type</Text>
            )}
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator size="large" color="#28a745" style={styles.loadingIndicator} />
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.postButton]}
              onPress={handlePostCreation}
            >
              <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
          </View>
        )}
     
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  
   header:{
     fontSize :24 ,
     fontWeight :"bold",
     marginBottom :20 ,
   },
   input:{
     borderWidth :1 ,
     borderColor :"#ddd",
     padding :10 ,
     marginVertical :10 ,
     borderRadius :5 ,
     backgroundColor :"#fff",
   },
   dropdownContainer:{
     marginVertical :10 ,
   },
   dropdown:{
     backgroundColor :"white",
     borderWidth :1 ,
     borderColor :"#ccc",
     borderRadius :5 ,
   },
   button:{
     backgroundColor :"black",
     padding :10 ,
     borderRadius :5 ,
     alignItems :"center",
     marginVertical :5 ,
   },
   buttonText:{
     color:"#fff",
     fontSize :16 ,
   },
   mediaPreview:{
     marginVertical :10 ,
     alignItems :"center",
   },
   previewImage:{
     width :Dimensions.get("window").width -40 ,
     height :200 ,
     borderRadius :8 ,
   },
   previewVideo:{
     width :Dimensions.get("window").width -40 ,
     height :200 ,
     borderRadius :8 ,
   },
   buttonContainer:{
     flexDirection :"row",
     justifyContent :"space-between",
     marginTop :20 ,
   },
   cancelButton:{
     backgroundColor:"black",
   },
   postButton:{
     backgroundColor:"black",
   },
});

export default PostPage;