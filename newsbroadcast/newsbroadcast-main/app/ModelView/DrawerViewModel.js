import { useState } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router"; // Ensure you have the router for navigation

export const useDrawerViewModel = () => {
  const [userdata, setUserdata] = useState({});
  const auth = getAuth();
  const firestore = getFirestore();
  const router = useRouter(); // Initialize router for navigation

  const subscribeToUserData = () => {
    const user = auth.currentUser;
    if (!user) return () => {};

    const userDocRef = doc(firestore, "users", user.uid);

    // Real-time listener
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserdata(snapshot.data());
      }
    });

    return unsubscribe;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Correct method to sign out
      router.replace("/View/Signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return {
    userdata,
    handleLogout,
    subscribeToUserData,
  };
};
