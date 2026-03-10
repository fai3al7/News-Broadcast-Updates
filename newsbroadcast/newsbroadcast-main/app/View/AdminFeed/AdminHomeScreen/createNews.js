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
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import usePostViewModel from "../../../ModelView/postViewModel";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import locationData from "../../../../assets/locations.json";

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
    location,
    setLocation,
    handleCreatePost,
  } = usePostViewModel();

  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [categories, setCategories] = useState([
    { label: "Sports", value: "sports" },
    { label: "Tech", value: "tech" },
    { label: "Entertainment", value: "entertainment" },
    { label: "Crime", value: "crime" },
    { label: "Politics", value: "politics" },
  ]);

  const MAX_FILE_SIZE_MB = 100; // Maximum file size in MB
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert to bytes

  const pickFile = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need permission to access your media.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedFile = result.assets[0];
      const fileName = selectedFile.uri.split("/").pop();

      // Check file size
      if (selectedFile.fileSize > MAX_FILE_SIZE_BYTES) {
        Alert.alert("File too large", `The selected file exceeds ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      setFile({ ...selectedFile, name: fileName });
      setMediaType(selectedFile.type);
    }
  };

  const handleLocationInput = (text) => {
    setLocation(text);
    if (text.trim() !== "") {
      const results = locationData.filter((item) =>
        item.Name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocations(results);
      setShowDropdown(results.length > 0);
    } else {
      setShowDropdown(false);
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Create a News</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Location"
          value={location}
          onChangeText={handleLocationInput}
        />
        {showDropdown && (
          <View style={styles.dropdownContainer}>
            <FlatList
              data={filteredLocations}
              keyExtractor={(item, index) => index.toString()}
              style={styles.dropdownList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setLocation(item.Name);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item.Name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

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
          containerStyle={{ width: "100%", marginVertical: 10 }}
          style={styles.dropdown}
          dropDownStyle={styles.dropdownList}
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
          <ActivityIndicator
            size="large"
            color="#28a745"
            style={styles.loadingIndicator}
          />
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
      </View>
    </KeyboardAvoidingView>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
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
     marginVertical :5,
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
   dropdownList:{
     maxHeight:150 ,
   },
   dropdownItem:{
     padding :10 ,
     borderBottomColor:"#ddd",
     borderBottomWidth :1 ,
   },
   dropdownText:{
     fontSize :16 ,
     color :"black",
   },
   button:{
     backgroundColor:"black",
     padding :10 ,
     borderRadius :5 ,
     alignItems :"center",
     marginVertical :5 ,
   },
   buttonText:{
     color:"#fff",
     textAlign :"center",
   },
   mediaPreview:{
     marginVertical :10 ,
     alignItems :"center",
   },
   previewImage:{
     width :windowWidth -40 ,
     height :150 ,
     borderRadius :8 ,
   },
   previewVideo:{
     width :windowWidth -40 ,
     height :150 ,
     borderRadius :8 ,
   },
   loadingIndicator:{
     marginVertical :20 ,
   },
   buttonContainer:{
     flexDirection :"row",
     justifyContent :"space-between",
     width :"100%",
   },
});

export default PostPage;
