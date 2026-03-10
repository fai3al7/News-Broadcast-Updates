import React from "react";
import { getAuth } from "firebase/auth";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { useDrawerViewModel } from "../../ModelView/DrawerViewModel"; // Import your ViewModel
import { useRouter } from "expo-router";
import { Image } from "react-native";
// Dummy user data for dynamic header (replace with real user data as needed)
import { useEffect } from "react";
export default function CustomDrawerContent() {
  const { userdata, handleLogout, subscribeToUserData } = useDrawerViewModel();
  const userData = userdata;
  // Use the ViewModel
  useEffect(() => {
    // Subscribe to user data changes
    const unsubscribe = subscribeToUserData();
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  const router = useRouter();

  return (
    <View style={styles.drawerContainer}>
      {/* Dynamic User Info Section */}
      <View style={styles.userInfoContainer}>
        <View>
          <Image
            source={{ uri: userData?.profilePicture }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.userName}>{userData?.name}</Text>
        <Text style={styles.userEmail}>{userData?.location}</Text>
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => router.push("/View/AdminFeed/UserProfile")}
        >
          <Text>View Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Drawer Items */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/AdminFeed/AdminHomeScreen/Home")}
      >
        <Text>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/AdminFeed/userManagement")}
      >
        <Text>User Management</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/AdminFeed/ApprovedNews")}
      >
        <Text>Approved Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/AdminFeed/rejectedNews")}
      >
        <Text>Rejected Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/View/AdminFeed/changePassword")}
      >
        <Text>Change Password</Text>
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
  avatarContainer: {
    backgroundColor: "#34D399", // Example color
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
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
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
});
