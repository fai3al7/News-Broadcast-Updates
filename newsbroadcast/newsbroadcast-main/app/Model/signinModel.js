import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
const auth = getAuth(app);

export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const SignOut = async (auth) => {
  return await signOut(auth);
};
