import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Modal,
  Dimensions,
  Pressable,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";
import usePostViewModel from "../../ModelView/postViewModel";

const IndexScreen = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    mediaType,
    setMediaType,
    handleCreatePost,
  } = usePostViewModel();

  const [modalVisible, setModalVisible] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const querySnapshot = await getDocs(
            collection(db, "users", user.uid, "posts")
          );
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postsData);
        }
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, []);

  const handlePostCreation = async () => {
    if (file) {
      await handleCreatePost(title, description, file, mediaType);
      setModalVisible(false); // Close the modal after post creation
    } else {
      alert("Please select a file.");
    }
  };

  const pickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedFile = result.assets[0];
      const fileName = selectedFile.uri.split("/").pop(); // Extract file name from URI
      setFile({ ...selectedFile, name: fileName }); // Attach the name to the file object
      setMediaType(selectedFile.type);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.cardImage} />
      )}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.plusButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.plusButtonText}>+</Text>
      </Pressable>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity style={styles.button} onPress={pickFile}>
              <Text style={styles.buttonText}>Pick an Image or Video</Text>
            </TouchableOpacity>
            {file && <Text>{`Selected file: ${file.uri}`}</Text>}
            <Button
              style={styles.button}
              title="Post"
              onPress={handlePostCreation}
            />
            <Button
              style={styles.button}
              title="Cancel"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: windowWidth,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    width: windowWidth,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: 200, // Adjust height as needed
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: "100%",
  },
  button: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  plusButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "black",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  plusButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  postList: {
    width: "100%",
    paddingHorizontal: 10,
  },
});

export default IndexScreen;
