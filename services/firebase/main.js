import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
const firebaseConfig = {
  apiKey: "AIzaSyAUn0xiI9L19dMJ88VSHO7iKVFqJPPxZY0",
  authDomain: "lucys-legacy.firebaseapp.com",
  projectId: "lucys-legacy",
  storageBucket: "lucys-legacy.appspot.com",
  messagingSenderId: "544769398508",
  appId: "1:544769398508:web:b739b3f034ddd7b4e377c9",
  measurementId: "G-FPWETR11K6",
};

const fb = initializeApp(firebaseConfig);

export const clearUserIdLocalStorage = async () => {
  try {
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("currentUser");
    console.log("userId and currentUser removed from AsyncStorage");
  } catch (error) {
    console.error("Error clearing user data from AsyncStorage", error);
  }
};

export const setUserIdLocalStorage = async (userId) => {
  try {
    await AsyncStorage.setItem("userId", userId);
    console.log("userId saved:", userId);
  } catch (error) {
    console.error("Error setting userId in AsyncStorage", error);
  }
};

export const setCurrentUserLocalStorage = async (user) => {
  try {
    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
    console.log("current user saved:", user);
  } catch (error) {
    console.error("Error setting current user in AsyncStorage", error);
  }
};
export const getUserIdFromLocalStorage = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    return userId;
  } catch (error) {
    console.error("Error getting userId from AsyncStorage", error);
  }
};
const auth = getAuth(fb);
const storage = getStorage(fb);
export { auth, storage };
export default fb;
