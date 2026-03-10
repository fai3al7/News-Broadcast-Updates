import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import moment from "moment";
import { Video } from "expo-av";

const Myposts = () => {
  const [posts, setPosts] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [videoLoading, setVideoLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedMedia, setEditedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const user = getAuth().currentUser;

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv"];
    const urlWithoutParams = url.split("?")[0];
    return videoExtensions.some((ext) => urlWithoutParams.endsWith(ext));
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(
        collection(db, "users", user.uid, "posts"),
        (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          postsData.forEach(async (post) => {
            const userRef = doc(db, "users", post.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              setUserDetails((prev) => ({
                ...prev,
                [post.userId]: userDoc.data(),
              }));
            }
          });
          const sortedPosts = postsData.sort(
            (a, b) => b.createdAt - a.createdAt
          );
          setPosts(sortedPosts);
        },
        (error) => {
          console.error("Error fetching posts: ", error);
        }
      );
      return () => unsubscribe();
    }
  }, []);

  const deletePost = async (postId) => {
    const postRef = doc(db, "users", user.uid, "posts", postId);
    const postDoc = await getDoc(postRef);
    if (postDoc.exists() && postDoc.data().approved) {
      alert("This post is approved and cannot be deleted.");
      return;
    }
    await deleteDoc(postRef);
    alert("Post deleted successfully.");
  };

  const openEditModal = (post) => {
    // Check if post is approved or rejected
    if (post.approved || post.rejected) {
      alert("Approved or rejected posts cannot be edited.");
      return;
    }
    setEditingPost(post);
    setEditedTitle(post.title);
    setEditedDescription(post.description);
    setEditedMedia(post.mediaUrl);
    setMediaType(post.mediaUrl && isVideo(post.mediaUrl) ? "video" : "image");
    setModalVisible(true);
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const mediaUri = result.assets[0].uri;
      const mediaType = result.assets[0].type; // image or video
      setMediaType(mediaType);

      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `posts/${editingPost.id}/${Date.now()}`);
      const response = await fetch(mediaUri);
      const blob = await response.blob();
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setEditedMedia(downloadURL);
    }
  };

  const updatePost = async () => {
    if (!editingPost) return;

    // Check if post is approved or rejected
    if (editingPost.approved || editingPost.rejected) {
      alert("Approved or rejected posts cannot be updated.");
      return;
    }

    const postRef = doc(db, "users", user.uid, "posts", editingPost.id);
    await updateDoc(postRef, {
      title: editedTitle,
      description: editedDescription,
      mediaUrl: editedMedia,
    });

    alert("Post updated successfully.");
    setModalVisible(false);
    setEditingPost(null);
  };

  const renderItem = ({ item }) => {
    const postDate = item.createdAt ? item.createdAt.toDate() : null;
    const formattedDate = postDate
      ? moment(postDate).fromNow()
      : "No date available";
    const userInfo = userDetails[item.userId] || {};

    return (
      <View style={styles.card}>
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: item.approved
                ? "green"
                : item.rejected
                ? "red"
                : "orange",
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.approved
              ? "Approved"
              : item.rejected
              ? "Rejected"
              : "Not Approved"}
          </Text>
        </View>
        <View style={styles.headerContainer}>
          {userInfo.photoURL && (
            <Image
              source={{ uri: userInfo.photoURL }}
              style={styles.profileImage}
            />
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName}>
              {userInfo.name || "Unknown User"}
            </Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          {item.mediaUrl &&
            (isVideo(item.mediaUrl) ? (
              <View>
                <Video
                  source={{ uri: item.mediaUrl }}
                  style={styles.cardMedia}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay={false}
                />
              </View>
            ) : (
              <Image source={{ uri: item.mediaUrl }} style={styles.cardMedia} />
            ))}
          <View style={styles.infoContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          {/* Only show edit button if not approved or rejected */}
          {!item.approved && !item.rejected && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
          {/* Delete button logic remains unchanged */}
          {!item.approved && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deletePost(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            <TextInput
              style={styles.modalInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Title"
            />
            <TextInput
              style={styles.modalInput}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Description"
              multiline
            />

            {editedMedia && mediaType === "image" && (
              <Image source={{ uri: editedMedia }} style={styles.cardMedia} />
            )}

            {editedMedia && mediaType === "video" && (
              <Video
                source={{ uri: editedMedia }}
                style={styles.cardMedia}
                useNativeControls
                resizeMode="contain"
                shouldPlay={false}
              />
            )}

            <TouchableOpacity style={styles.saveButton} onPress={pickMedia}>
              <Text style={styles.saveText}>Change Media</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={updatePost}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  card: {
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  statusBanner: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  statusText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  headerContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  headerTextContainer: { flex: 1 },
  userName: { fontWeight: "bold", fontSize: 16, color: "#333" },
  timestamp: { fontSize: 12, color: "#777" },
  cardContent: { padding: 10 },
  cardMedia: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  infoContainer: { marginBottom: 10 },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
    color: "#000",
  },
  cardDescription: { fontSize: 14, color: "#555" },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  editButton: {
    backgroundColor: "black",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  editText: { color: "#fff", fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "black",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  deleteText: { color: "#fff", fontWeight: "bold" },
  postList: { paddingHorizontal: 10, paddingVertical: 10 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0 ,0 ,0 ,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelText: { color: "#fff", fontWeight: "bold" },
});

export default Myposts;
