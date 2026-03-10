import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig"; // Adjust the import path as necessary
import { useState } from "react";

const db = getFirestore(app);

export const getUserData = async (userId) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log(docSnap.data().userId);
    return docSnap.data();
  } else {
    console.log("No such document!");
    return null;
  }
};
