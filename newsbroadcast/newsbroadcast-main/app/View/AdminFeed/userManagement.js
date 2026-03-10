import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../../../firebaseConfig"; // Your firebase config file
import Icon from "react-native-vector-icons/MaterialIcons"; // Make sure to install this package

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Fetch users from Firestore (Admin can access all users)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users")); // Adjust the collection path if needed
        const usersList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.status !== "Admin"); // Exclude users with the role "admin"

        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Toggle user status between 'disabled' and 'user'
  const toggleUserAccount = async (userUid, email, currentStatus) => {
    try {
      const action = currentStatus === "disabled" ? "Enable" : "Disable";
      Alert.alert(
        `${action} User`,
        `Are you sure you want to ${action.toLowerCase()} the user: ${email}?`,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              try {
                const userDocRef = doc(db, "users", userUid);
                const newStatus =
                  currentStatus === "disabled" ? "user" : "disabled"; // Toggle status
                await updateDoc(userDocRef, { status: newStatus });
                console.log(`User ${email} has been ${newStatus}`);

                // Update the state to reflect the changes in the UI
                setUsers((prevUsers) =>
                  prevUsers.map((user) =>
                    user.id === userUid ? { ...user, status: newStatus } : user
                  )
                );
              } catch (error) {
                console.error(`Error ${action.toLowerCase()}ing user:`, error);
                Alert.alert(
                  "Error",
                  `An error occurred while ${action.toLowerCase()}ing the user.`
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error(`Error toggling user status:`, error);
      Alert.alert("Error", `An error occurred while toggling the user status.`);
    }
  };

  const renderUser = ({ item }) => {
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfoContainer}>
          <Icon name="person" size={24} color="#333" />
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{item.email || "N/A"}</Text>
            <Text style={styles.userName}>{item.name || "N/A"}</Text>
            <Text style={styles.userName}>CNIC:{item.cnic || "N/A"}</Text>
            <Text style={styles.userName}>{item.location || "N/A"}</Text>
            <Text
              style={[
                styles.userStatus,
                item.status === "disabled"
                  ? styles.disabledStatus
                  : styles.activeStatus,
              ]}
            >
              Status: {item.status ? String(item.status) : "N/A"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            item.status === "disabled"
              ? styles.disabledButton
              : styles.activeButton,
          ]}
          onPress={() => toggleUserAccount(item.id, item.email, item.status)}
        >
          <Text style={styles.buttonText}>
            {item.status === "disabled" ? "Enable User" : "Disable User"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()} // Ensure key is a string
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f4f8", // Light background for better contrast
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  userCard: {
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 10,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 14,
    color: "#555",
  },
  userStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  activeStatus: {
    color: "#4caf50", // Green for active users
  },
  disabledStatus: {
    color: "#f44336", // Red for disabled users
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#f44336", // Red for disabling users
  },
  disabledButton: {
    backgroundColor: "#4caf50", // Green for enabling users
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserManagementScreen;
