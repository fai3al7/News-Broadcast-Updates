import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { getDocs, collection,query,where } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { Video } from "expo-av";
import moment from "moment";
import { usePostsViewModel } from "../../../ModelView/pendingViewModel";

// Constants for video file extensions
const VIDEO_EXTENSIONS = [".mp4", ".mov", ".avi", ".mkv"];

// User Info Component
const UserInfo = React.memo(({ userInfo, time, category }) => (
  <View style={styles.userInfo}>
    <Image
      source={{
        uri: userInfo?.profilePicture || "https://example.com/default-avatar.png",
      }}
      style={styles.profileImage}
    />
    <View style={styles.userText}>
      <Text style={styles.username}>{userInfo?.name || "Unknown User"}</Text>
      <Text style={styles.postTime}>{time}</Text>
      <Text style={styles.bannerText}>{category}</Text>
    </View>
  </View>
));

const IndexScreen = () => {
  const [posts, setPosts] = useState([]);
  const {approve,reject}= usePostsViewModel();
  const [userDetails, setUserDetails] = useState({});
  const [videoLoading, setVideoLoading] = useState(false);

  // Fetch Posts and User Details
  const fetchPosts = useCallback(async () => {
    try {
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const allPosts = [];
      const userDetailsMap = {};

      // Loop through users and fetch their posts
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        userDetailsMap[userId] = userData;

        const postsRef = collection(db, `users/${userId}/posts`);
        const q = query(
          postsRef,
          where("approved", "==", false),
          where("rejected", "==", false)
        );
        const postsSnapshot = await getDocs(q);

        postsSnapshot.forEach((postDoc) => {
          allPosts.push({ id: postDoc.id, userId, ...postDoc.data() });
        });
      }

      setPosts(allPosts);
      setUserDetails(userDetailsMap);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Function to check if the URL is a video
  const isVideo = useCallback((url) => {
    if (!url) return false;
    const urlWithoutParams = url.split("?")[0];
    return VIDEO_EXTENSIONS.some((ext) => urlWithoutParams.endsWith(ext));
  }, []);

 
  // Render Post Item
  const renderItem = useCallback(
    ({ item }) => {
      const userInfo = userDetails[item.userId] || {};
      const createdAt = item.createdAt?.toDate
        ? moment(item.createdAt.toDate()).format("YYYY-MM-DD HH:mm:ss")
        : "Unknown time";
      return (
        <Link href={`/posts/${item.id}`} asChild>
          <View style={styles.card}>
            <UserInfo
              userInfo={userInfo}
              time={createdAt}
              category={item.category?.toUpperCase() || "Uncategorized"}
            />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>
              {item.summary || item.description}
            </Text>

            {item.mediaUrl &&
              (isVideo(item.mediaUrl) ? (
                <View>
                  <Video
                    source={{ uri: item.mediaUrl }}
                    style={styles.cardMedia}
                    useNativeControls
                    resizeMode="contain"
                    shouldPlay={false}
                    onLoadStart={() => setVideoLoading(true)}
                    onLoad={() => setVideoLoading(false)}
                    onError={(error) => {
                      setVideoLoading(false);
                      console.error("Error loading video:", error);
                    }}
                  />
                  {videoLoading && (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}
                </View>
              ) : (
                <Image source={{ uri: item.mediaUrl }} style={styles.cardMedia} />
              ))}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => reject(item.id,item,setPosts)}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => approve(item.id,item,setPosts)}
              >
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Link>
      );
    },
    [userDetails, videoLoading, isVideo]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginVertical: 5,
    borderRadius: 5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    flexDirection: "column",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  postTime: {
    fontSize: 12,
    color: "#777",
  },
  bannerText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
  },
  cardMedia: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  approveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rejectButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  postList: {
    paddingBottom: 10,
  },
});

export default IndexScreen;