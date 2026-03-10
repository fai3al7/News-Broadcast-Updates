import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  
} from "react-native";
import { Link } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

import moment from "moment";
import { Video } from "expo-av";


const ApprovedPostsScreen = () => {
    const user = getAuth().currentUser;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchPosts = async () => {
      const postsRef = collection(db, "admins", user.uid, "approvedPosts");
      const q = query(postsRef, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(fetchedPosts);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchPosts();
  }, []);

  const renderItem = ({ item }) => {
    
  return (
      <Link href={`/admins/${user.uid}/approvedPosts/${item.id}`} asChild>
        <TouchableOpacity>
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              {item.mediaType === "video" ? (
                <Video
                  source={{ uri: item.mediaUrl }}
                  rate={1.0}
                  volume={1.0}
                  useNativeControls
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay={false}
                  isLooping
                  style={styles.media}
                />
              ) : (
                <Image
                  source={{
                    uri: item.mediaUrl || "https://via.placeholder.com/150",
                  }}
                  style={styles.media}
                />
              )}
            </View>
            <View style={styles.content}>
              <Text style={styles.category}>{item.category.toUpperCase()}</Text>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.author}>
                By {item.userName} • {moment(item.createdAt?.toDate()).fromNow()}
              </Text>
             
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  list: {
    paddingBottom: 15,
  },
  card: {
    flexDirection: "row",
    marginVertical: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#e0e0e0",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  category: {
    fontSize: 12,
    color: "#777",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  author: {
    fontSize: 12,
    color: "#aaa",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default ApprovedPostsScreen;
