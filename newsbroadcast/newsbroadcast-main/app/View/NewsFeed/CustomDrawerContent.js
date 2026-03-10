import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useDrawerViewModel } from "../../ModelView/DrawerViewModel"; // Import your ViewModel
import { useRouter } from "expo-router";

export default function CustomDrawerContent() {
  const { userdata, handleLogout, subscribeToUserData } = useDrawerViewModel();
  const router = useRouter();

  useEffect(() => {
    // Subscribe to user data changes
    const unsubscribe = subscribeToUserData();
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.drawerContainer}>
      {/* Dynamic User Info Section */}
      <View style={styles.userInfoContainer}>
        <View>
          <Image
            source={{ uri: userdata?.profilePicture }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.userName}>{userdata?.name}</Text>
        <Text style={styles.userEmail}>{userdata?.location}</Text>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => router.push("/View/NewsFeed/UserProfile")}
        >
          <Text>View Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Drawer Items */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/NewsFeed/HomeScreen/UserHome")}
      >
        <Text>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/NewsFeed/favorites")}
      >
        <Text>Favorites</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/NewsFeed/changePassword")}
      >
        <Text>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/NewsFeed/changeLocation")}
      >
        <Text>Change location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
        <Text>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
    color: "gray",
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
