import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Upload profile picture to Firebase Storage
export const uploadProfilePictureToStorage = async (userId, uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${userId}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

// Update user data in Firestore
export const updateUserDataInFirestore = async (userId, data) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating Firestore data:", error);
    throw error;
  }
};
