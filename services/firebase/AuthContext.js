import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./main"; // Assuming you have a firebase.js file with your Firebase configuration

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getUserIdFromStorage = async () => {
      const userId = await AsyncStorage.getItem("userUid");
      if (userId) {
        setIsLoggedIn(true);
      }
    };

    getUserIdFromStorage();
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    await clearUserIdLocalStorage();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
