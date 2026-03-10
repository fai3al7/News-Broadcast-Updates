import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);

  // Request permission for notifications
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission for notifications is required!");
      }
    };
    requestPermission();
  }, []);

  // Listen for incoming notifications
  useEffect(() => {
    // Handler to handle notification received
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);  // Log the notification
        const newNotification = {
          id: notification.request.identifier, // Use identifier as a unique id
          title: notification.request.content.title,
          body: notification.request.content.body,
          receivedAt: new Date(),
        };

        // Add new notification to the list
        setNotifications((prevNotifications) => [
          newNotification,
          ...prevNotifications,
        ]);
      }
    );

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  // Render each notification item
  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.timestamp}>
        {item.receivedAt.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {/* FlatList to display the notifications */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  notificationItem: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    fontSize: 16,
    marginVertical: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
  },
});

export default NotificationScreen;
