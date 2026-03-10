// firebaseConfig.js

import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import "firebase/messaging";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC4hV9yEPvXN5fDx0pTPSUQjziTYhuyghI",
  authDomain: "region-times.firebaseapp.com",
  projectId: "region-times",
  storageBucket: "region-times.appspot.com",
  messagingSenderId: "721765024219",
  appId: "1:721765024219:web:84f54af6a5cc0ca29827fe",
  measurementId: "G-50DKDS46TY",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

const cleanupExpiredPosts = async () => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 30);

    // Get all categories under the `posts` collection
    const categoriesSnapshot = await getDocs(collection(db, "posts"));

    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;

      // Access the `posts` subcollection inside the current category
      const postsSubCollection = collection(db, `posts/${categoryId}/posts`);

      // Query posts older than 10 days
      const expiredQuery = query(
        postsSubCollection,
        where("createdAt", "<=", tenDaysAgo)
      );
      const expiredPostsSnapshot = await getDocs(expiredQuery);

      for (const expiredPost of expiredPostsSnapshot.docs) {
        const postData = expiredPost.data();

        // Delete associated media in Firebase Storage
        if (postData.mediaPath) {
          const mediaRef = ref(storage, postData.mediaPath);
          try {
            await deleteObject(mediaRef);
            console.log(`Deleted media: ${postData.mediaPath}`);
          } catch (storageError) {
            console.error(
              `Failed to delete media: ${postData.mediaPath}`,
              storageError
            );
          }
        }

        // Delete the Firestore document
        await deleteDoc(expiredPost.ref);
        console.log(
          `Deleted expired post: ${expiredPost.id} in category: ${categoryId}`
        );
      }
    }
  } catch (error) {
    console.error("Error cleaning up expired posts:", error);
  }
};

// Call cleanupExpiredPosts periodically (e.g., every 24 hours)

// Call cleanupExpiredPosts periodically (e.g., every 24 hours)
cleanupExpiredPosts();
console.log("Firebase app initialized:", app);
console.log("Firebase auth initialized:", auth);
console.log("Firestore initialized:", db);

export { app, auth, db };
