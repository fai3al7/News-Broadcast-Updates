import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import moment from "moment"; // To format timestamps
import { Video } from "expo-av"; // Import the Video component

const PostDetailScreen = () => {
  const { category, id } = useLocalSearchParams(); // Get the id from the route params
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null); // State to store user details

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", category ,"posts", id);
      const postSnapshot = await getDoc(postRef);
      if (postSnapshot.exists()) {
        setPost(postSnapshot.data());
        // Fetch user details if post exists
        const userRef = doc(db, "users", postSnapshot.data().userId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          setUser(userSnapshot.data()); // Store user details
        }
      } else {
        console.log("No such post!");
      }
    };

    if (category && id) {
      fetchPost();
    }
  }, [id]);

  // Function to check if the media URL is a video
  const isVideo = (url) => {
    if (!url) return false; // Return false if url is undefined or null
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv"];

    // Check if the URL has any of the video extensions before any query parameters
    const urlWithoutParams = url.split("?")[0]; // Remove query parameters
    return videoExtensions.some((ext) => urlWithoutParams.endsWith(ext));
  };

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isMediaVideo = isVideo(post.mediaUrl); // Determine if the media is a video

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.categoryText}>{post.category.toUpperCase()}</Text>
      <Text style={styles.title}>{post.title}</Text>
      {/* Render video or image based on the media type */}
      {post.mediaUrl &&
        (isMediaVideo ? (
          <Video
            source={{ uri: post.mediaUrl }}
            style={styles.postMedia}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        ) : (
          <Image source={{ uri: post.mediaUrl }} style={styles.postMedia} />
        ))}
      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.user}>
          Posted by: {user?.name || "Unknown User"}
        </Text>
        <Text style={styles.date}>
          {moment(post.createdAt?.toDate()).format("MMMM Do YYYY, h:mm:ss a")}
        </Text>
        <Text style={styles.location}>
          {post.location || "Unknown Location"}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 18,
    color: "#888",
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginVertical: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 12,
  },
  postMedia: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#ccc", // Fallback background color
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    color: "#555",
  },
  user: {
    fontSize: 14,
    color: "#777",
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
});

export default PostDetailScreen;
