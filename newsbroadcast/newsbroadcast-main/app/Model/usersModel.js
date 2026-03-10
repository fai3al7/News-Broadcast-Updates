// models/firestoreModel.js
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig"; // Adjust the import path as necessary

const db = getFirestore(app);

export const saveUserData = async (userId, data) => {
  return await setDoc(doc(db, "users", userId), data);

};
 


