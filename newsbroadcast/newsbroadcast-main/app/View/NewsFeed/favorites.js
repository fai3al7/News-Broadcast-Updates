import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import moment from "moment";
import { Link } from "expo-router";
import { Video } from "expo-av";

const FavoritesScreen = () => {
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const firestore = getFirestore();
  const user = auth.currentUser;
  const fetchFavorites = () => {
   

    if (!user) {
      console.error("No user is signed in");
      return;
    }

    const favoritesRef = collection(firestore, `users/${user.uid}/favorites`);
    const q = query(favoritesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setFavoritePosts(posts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching favorite posts:", error.message);
      setLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchFavorites();
    return () => unsubscribe();
  }, []);

  const renderPostItem = ({ item }) => (
    <Link href={`/users/${user.uid}/favorites/${item.id}`} asChild>
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : favoritePosts.length > 0 ? (
        <FlatList
          data={favoritePosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No favorite posts found!</Text>
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
    categoryTabs: {
      marginBottom: 10,
      paddingVertical: 5,
      height: 50, // Static height for the tabs container
    },
    tab: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: "#f5f5f5",
      marginRight: 10,
    },
    selectedTab: {
      backgroundColor: "#007BFF",
    },
    tabText: {
      fontSize: 14,
      color: "#333",
    },
    selectedTabText: {
      color: "#fff",
      fontWeight: "bold",
    },
    subHeader: {
      fontSize: 18,
      fontWeight: "bold",
      marginVertical: 10,
    },
    list: {
      flexGrow: 1, // Ensures consistent space for content
      height: Dimensions.get("window").height * 0.75, // Set a fixed height for the list
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

export default FavoritesScreen;
