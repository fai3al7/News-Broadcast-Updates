import { getAuth } from "firebase/auth";
import { getUserData } from "../Model/getUserModel";
import { useState } from "react";

export const users = () => {
  const [userData, setUserData] = useState();
  const getData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    setUserData(await getUserData(user.uid));
  };
  getData();
  return {
    userData,
  };
};
