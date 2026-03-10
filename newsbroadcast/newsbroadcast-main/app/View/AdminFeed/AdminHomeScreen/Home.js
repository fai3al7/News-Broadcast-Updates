import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { Link } from "expo-router";
import { db } from "../../../../firebaseConfig"; // Adjust path as necessary
import { getAuth } from "firebase/auth";
import { Video } from "expo-av"; // Import Video component for video playback

const Myposts = () => {
  const [posts, setPosts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is an admin
  const [expandedPost, setExpandedPost] = useState(null); // Track which post's description is expanded

  useEffect(() => {
    const user = getAuth().currentUser;
    if (user) {
      // Fetch the user's roles from Firestore to check if they are an admin
      const fetchUserRole = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (userData && userData.status && userData.status.includes("admin")) {
          setIsAdmin(true); // Set the user as admin if they have the role
        }
      };

      fetchUserRole();

      // Set up a real-time listener for the user's posts
      const unsubscribe = onSnapshot(
        collection(db, "users", user.uid, "posts"),
        (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postsData);
        },
        (error) => {
          console.error("Error fetching posts: ", error);
        }
      );

      // Clean up the listener when the component is unmounted
      return () => unsubscribe();
    }
  }, []);

  const renderMedia = (mediaUrl) => {
    const isVideo = mediaUrl && mediaUrl.endsWith(".mp4");

    if (isVideo) {
      return (
        <Video
          source={{ uri: mediaUrl }}
          style={styles.media}
          resizeMode="contain"
          shouldPlay={false} // Set to true if you want the video to autoplay
          isLooping
          useNativeControls
        />
      );
    } else {
      return (
        <Image
          source={{ uri: mediaUrl }}
          style={styles.media}
          resizeMode="contain"
        />
      );
    }
  };

  const toggleDescription = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId); // Toggle expanded state for specific post
  };

  const renderItem = ({ item }) => {
    const postDate = item.createdAt ? item.createdAt.toDate() : null;
    const formattedDate = postDate
      ? postDate.toLocaleString()
      : "No date available";

    // Handle long descriptions with "Read More"
    const truncatedDescription =
      item.description && item.description.length > 100
        ? item.description.substring(0, 100) + "..."
        : item.description;

    return (
      <Link href={`/users/${item.userId}/posts/${item.id}`} asChild>
        <TouchableOpacity>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              {/* Post Media */}
              {item.mediaUrl && renderMedia(item.mediaUrl)}

              {/* User Details and Post Info */}
              <View style={styles.infoContainer}>
                <View style={styles.userDetails}>
                  {item.userProfilePic && (
                    <Image
                      source={{ uri: item.userProfilePic }}
                      style={styles.profileImage}
                    />
                  )}
                 
                 <Text style={styles.userName}>{item.category.toUpperCase()}</Text>
                </View>
               
                {/* Promotional Title */}
                <Text style={styles.cardTitle}>
                  {item.isPromotional ? "Promotional: " : ""}
                  {item.title}
                </Text>

                {/* Description */}
                <Text style={styles.cardDescription}>
                  {expandedPost === item.id ? item.description : truncatedDescription}
                </Text>
                {item.description && item.description.length > 100 && (
                  <TouchableOpacity onPress={() => toggleDescription(item.id)}>
                    <Text style={styles.readMoreText}>
                      {expandedPost === item.id ? "Show Less" : "Read More"}
                    </Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.timestamp}>{formattedDate}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  card: {
    width: "100%",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "column",
    padding: 10,
  },
  media: {
    width: "100%",
    height: 200, // Adjust this height as needed for your layout
    borderRadius: 10,
    marginBottom: 10,
  },
  infoContainer: {
    flex: 1,
  },
  userDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  readMoreText: {
    fontSize: 14,
    color: "#0066cc",
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  postList: {
    paddingHorizontal: 10,
  },
});

export default Myposts;
