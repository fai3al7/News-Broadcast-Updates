import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
} from "react-native";
import { Link } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  Timestamp,
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { Video } from "expo-av";
import { Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexScreen = () => {
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState({});
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showLocationInput, setShowLocationInput] = useState(false);

  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "posts");
        const querySnapshot = await getDocs(categoriesRef);
        const fetchedCategories = querySnapshot.docs.map((doc) =>
          doc.id.toUpperCase()
        );
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      let filteredPosts = [];

      if (selectedCategory === "All" && selectedLocation === "All") {
        // Fetch all posts from all categories (no filters)
        const allPosts = [];
        const unsubscribeFunctions = categories.map((category) => {
          const postsRef = collection(
            db,
            "posts",
            category.toLowerCase(),
            "posts"
          );
          const q = query(postsRef, orderBy("createdAt", "desc"));

          return onSnapshot(
            q,
            (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const postData = doc.data();
                const createdAt = postData.createdAt
                  ? postData.createdAt.toMillis()
                  : Date.now(); // Fallback to current time
                allPosts.push({
                  id: doc.id,
                  category,
                  ...postData,
                  createdAt,
                });
              });
              allPosts.sort((a, b) => b.createdAt - a.createdAt); // Sort by valid timestamp
              setPosts([...allPosts]);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching posts:", error);
            }
          );
        });
        return () =>
          unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      } else if (selectedCategory === "All" && selectedLocation !== "All") {
        // Fetch all posts from all categories but filter by selected location
        const allPosts = [];
        const unsubscribeFunctions = categories.map((category) => {
          const postsRef = collection(
            db,
            "posts",
            category.toLowerCase(),
            "posts"
          );
          const q = query(postsRef, orderBy("createdAt", "desc"));

          return onSnapshot(
            q,
            (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const postData = doc.data();
                const createdAt = postData.createdAt
                  ? postData.createdAt.toMillis()
                  : Date.now(); // Fallback to current time
                const post = {
                  id: doc.id,
                  category,
                  ...postData,
                  createdAt,
                };
                // Apply location filter here
                if (
                  selectedLocation === "All" ||
                  post.location === selectedLocation
                ) {
                  allPosts.push(post);
                }
              });
              allPosts.sort((a, b) => b.createdAt - a.createdAt); // Sort by valid timestamp
              setPosts([...allPosts]);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching posts:", error);
            }
          );
        });
        return () =>
          unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
      } else {
        // Fetch posts based on selected category and location
        const postsRef = collection(
          db,
          "posts",
          selectedCategory.toLowerCase(),
          "posts"
        );
        const q = query(postsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const categoryPosts = querySnapshot.docs
              .map((doc) => {
                const postData = doc.data();
                const createdAt = postData.createdAt
                  ? postData.createdAt.toMillis()
                  : Date.now(); // Fallback to current time
                return {
                  id: doc.id,
                  category: selectedCategory,
                  ...postData,
                  createdAt,
                };
              })
              .filter(
                (post) =>
                  selectedLocation === "All" ||
                  post.location === selectedLocation
              );
            setPosts(categoryPosts);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching posts:", error);
          }
        );
        return () => unsubscribe();
      }
    };

    if (categories.length > 0) {
      fetchPosts();
    }
  }, [selectedCategory, selectedLocation, categories]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const userFavoritesRef = collection(db, "users", user.uid, "favorites");
        const querySnapshot = await getDocs(userFavoritesRef);
        const userFavorites = querySnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = true; // Mark as favorited
          return acc;
        }, {});
        setFavorites(userFavorites);
      }
    };

    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const handleShare = async (item) => {
    try {
      const message = `
        Check out this post:
        Title: ${item.title}
        Description: ${item.description || "No description available"}
        Media: ${item.mediaUrl || "No media available"}
        Post URL: ${item.url || "No URL available"}
      `;

      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error("Error sharing post: ", error);
      Alert.alert("Error", "Failed to share post.");
    }
  };

  const handleFavorite = async (item) => {
    if (!user) {
      Alert.alert("Not logged in", "Please log in to favorite posts.");
      return;
    }

    try {
      const userFavoritesRef = collection(db, "users", user.uid, "favorites");
      const postRef = doc(userFavoritesRef, item.id);

      if (favorites[item.id]) {
        // If it's already favorited, remove it
        await deleteDoc(postRef);
        setFavorites((prev) => ({ ...prev, [item.id]: false }));
        Alert.alert("Success", "Post removed from favorites!");
      } else {
        // If it's not favorited, add it
        await setDoc(postRef, {
          ...item,
          favoritedAt: new Date(),
        });
        setFavorites((prev) => ({ ...prev, [item.id]: true }));
        Alert.alert("Success", "Post added to favorites!");
      }
    } catch (error) {
      console.error("Error updating favorite state: ", error);
      Alert.alert("Error", "Failed to update favorite state.");
    }
  };

  const renderPost = ({ item }) => {
    let createdAt = moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss");
    
    return (
      <Link href={`/posts/${item.category}/posts/${item.id}`} asChild>
        <TouchableOpacity>
          <View style={styles.card}>
            {item.promotional && (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>Promotional</Text>
              </View>
            )}
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
              By {item.userName} • {createdAt}
            
        
              </Text>
              <Text style={styles.author}>{item.location}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleFavorite(item)}>
                  <Ionicons
                    name={favorites[item.id] ? "bookmark" : "bookmark-outline"}
                    size={24}
                    color={favorites[item.id] ? "red" : "black"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleShare(item)}>
                  <Ionicons
                    name="share-social-outline"
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
      >
        <TouchableOpacity
          style={[styles.tab, selectedCategory === "All" && styles.selectedTab]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text
            style={[
              styles.tabText,
              selectedCategory === "All" && styles.selectedTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.tab,
              selectedCategory === category && styles.selectedTab,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === category && styles.selectedTabText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.subHeader}>Trending Topic</Text>

      {/* Location Input toggle */}
      <View style={styles.locationContainer}>
        <TouchableOpacity
          onPress={() => setShowLocationInput(!showLocationInput)}
          style={styles.locationIcon}
        >
          <Ionicons
            name={showLocationInput ? "chevron-up" : "chevron-down"}
            size={24}
            color="black"
          />
        </TouchableOpacity>

        {showLocationInput && (
          <TextInput
            style={styles.locationInput}
            value={selectedLocation}
            onChangeText={setSelectedLocation}
            placeholder="Enter Location"
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
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
  banner: {
    backgroundColor: "gold",
    padding: 5,
    position: "absolute",
    marginLeft: 250,
    top: 0,
    left: 0,
    zIndex: 1,
    borderRadius: 5,
  },
  bannerText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 12,
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
    backgroundColor: "black",
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
    height: Dimensions.get("window").height * 4, // Set a fixed height for the list
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
    backgroundColor: "#f9f9f9",
    marginTop: 10,
    padding: 10,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 5,
    width: "80%",
  },
});

export default IndexScreen;
