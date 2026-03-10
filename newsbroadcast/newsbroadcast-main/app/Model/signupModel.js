// models/authModel.js
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../../firebaseConfig";
const auth = getAuth(app);

export const signUp = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};
