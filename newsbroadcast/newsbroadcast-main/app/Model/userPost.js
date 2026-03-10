import { getAuth } from "firebase/auth";
import { app, db } from "../../firebaseConfig";
import { getStorage } from "firebase/storage";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import * as Notifications from "expo-notifications";

const storage = getStorage(app);


// Request notification permissions
const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Permission not granted for notifications");
    throw new Error("Notifications permission not granted");
  }
};

const getNgrokUrl = async () => {
  try {
    const configDocRef = doc(db, "config", "ngrok");
    const configDoc = await getDoc(configDocRef);

    if (!configDoc.exists()) throw new Error("ngrok URL not found in Firestore");

    const ngrokData = configDoc.data();
    if (!ngrokData?.url) throw new Error("ngrok URL is missing");

    return ngrokData.url;
  } catch (error) {
    console.error("Error fetching ngrok URL:", error);
    throw error;
  }
};

// Function to get or request push token
const getOrRequestPushToken = async (userDocRef) => {
  const pushToken = await Notifications.getExpoPushTokenAsync();
  await setDoc(userDocRef, { expoPushToken: pushToken.data }, { merge: true });
  return pushToken.data;
};

// Function to notify admin
const notifyAdmin = async (userData) => {
  try {
    const adminUserDocRef = doc(db, "users", "lbnu681ScmXkcp9zG0vrCg8YLUz1"); // Replace with the actual admin UID
    const adminUserDoc = await getDoc(adminUserDocRef);
    const adminData = adminUserDoc.data();

    if (adminData && adminData.expoPushToken) {
      const message = {
        to: adminData.expoPushToken,
        sound: "default",
        title: "New Post Created",
        body: `${userData.name} has created a new News`,
        data: { userId: userData.uid },
      };

      await Notifications.scheduleNotificationAsync({
        content: message,
        trigger: null, // Trigger immediately
      });

      console.log("Notification sent to admin");
    } else {
      console.log("Admin does not have a push token");
    }
  } catch (error) {
    console.error("Error notifying admin:", error);
  }
};

// Main function to create a post
export async function createPost(
  title,
  description,
  file,
  mediaType,
  category,
  location
) {
  try {
    const FLASK_API_URL = await getNgrokUrl();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User not authenticated");
    if (!file || !file.uri || !file.name) throw new Error("Invalid file object");
    if (!category || typeof category !== "string") throw new Error("Invalid category");

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    const isAdmin = userData?.status?.includes("Admin");

    // Upload media
    const storageRef = ref(storage, `posts/${user.uid}/${file.name}`);
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const snapshot = await uploadBytes(storageRef, blob);
    const mediaUrl = await getDownloadURL(snapshot.ref);

    // Prepare post data
    const postData = {
      title,
      description,
      mediaUrl,
      mediaType,
      userId: user.uid,
      userName: userData?.name,
      likes: [],
      createdAt: serverTimestamp(),
      approved: isAdmin || false,
      rejected: false,
      category,
      location,
      promotional: isAdmin || false,
    };

    // Store the post in Firestore
    const categoryPath = isAdmin
      ? `posts/${category}/posts`
      : `users/${user.uid}/posts`;
    const postRef = doc(collection(db, categoryPath));
    await setDoc(postRef, postData);
    console.log("Post created");

    if (isAdmin) {
      const adminPostRef = doc(collection(db, `users/${user.uid}/posts`));
      await setDoc(adminPostRef, postData);
      console.log("Admin post stored");
    }

    // Process video if applicable
    if (mediaType === "video"&&isAdmin!==true) {
      const flaskResponse = await axios.post(`${FLASK_API_URL}/summarize`, {
        video_url: mediaUrl,
      });

      const { id } = flaskResponse.data;
      let completed = false;

      while (!completed) {
        const statusResponse = await axios.get(`${FLASK_API_URL}/status/${id}`);
        if (statusResponse.data.status === "completed") {
          completed = true;
          const summary = statusResponse.data.summary;
          await setDoc(postRef, { summary }, { merge: true });
          console.log("Video summary added to post");
        } else {
          console.log("Processing video, checking status...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    // Notify admin if not an admin user
    if (!isAdmin) {
      await notifyAdmin(userData);
    }

    // Handle missing push token for admins
    if (isAdmin && (!userData?.expoPushToken || userData.expoPushToken === "")) {
      console.log("Admin push token missing. Requesting...");
      await getOrRequestPushToken(userDocRef);
    }
  } catch (error) {
    console.error("Error creating post:", error);
  }
}