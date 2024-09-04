import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, Button, Avatar, Text, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getUserIdFromLocalStorage, storage } from "../services/firebase/main";
import {
  getDownloadURL,
  getStorage,
  ref as sRef,
  uploadBytes,
} from "firebase/storage";
import { AntDesign } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
const EditProfile = () => {
  const navigation = useNavigation();

  const { colors } = useTheme();
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImageLink, setProfileImageLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const url = process.env.EXPO_PUBLIC_API_URL;
  useEffect(() => {
    loadProfile();
    console.log("p is", profileImageLink);
  }, []);
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
    }
  };
  const loadProfile = async () => {
    try {
      const profileImage = await AsyncStorage.getItem("profileImage");
      const name = await AsyncStorage.getItem("name");
      const email = await AsyncStorage.getItem("email");
      const phone = await AsyncStorage.getItem("phone");
      const address = await AsyncStorage.getItem("address");
      if (profileImage) setProfileImage(profileImage);
      if (name) setName(name);
      if (email) setEmail(email);
      if (phone) setPhone(phone);
      if (address) setAddress(address);
    } catch (error) {
      console.error("Error loading profile", error);
    }
  };

  const saveProfile = async () => {
    if (!profileImage) {
      Alert.alert("No Profile Picture", "Select Profile Picture");
    } else if (name === "" || email === "" || phone === "" || address === "") {
      Alert.alert("Wrong Credentials", "Empty Fields.");
    } else {
      setLoading(true);
      setSuccess(false);
      const userId = await AsyncStorage.getItem("userId");
      console.log(userId);
      let profileImageLink2;
      try {
        const response = await fetch(profileImage.uri);
        const blob = await response.blob();
        const fileName = profileImage.uri.split("/").pop();
        const storageRef = sRef(
          storage,
          `/profile_images/${userId}/${fileName}`
        );
        try {
          console.log("uploading image....");
          await uploadBytes(storageRef, blob);
          profileImageLink2 = await getDownloadURL(storageRef);

          setProfileImageLink(profileImageLink2);
          console.log("profile Image uploded");
          // console.log(profileData);
        } catch (err) {
          console.log("error uploding profile image ", err);
        }
        try {
          console.log(
            "updating user data...",
            name,
            email,
            phone,
            address,
            profileImageLink2,
            userId
          );
          fetch(`${url}/updateUser/${userId}`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              phone,
              address,
              profileImageLink: profileImageLink2,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);

              //  handleMessage("success", "Profile updated successfully");
            })
            .catch((err) => console.log("error on updating", err));
        } catch (error) {
          // setLoading(false);

          console.error("Error storing user profile data:", error);
        }
        await AsyncStorage.setItem("profileImage", profileImageLink);
        await AsyncStorage.setItem("name", name);
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("phone", phone);
        await AsyncStorage.setItem("address", address);

        Alert.alert("Profile saved", "Profile saved successfully", [
          {
            text: "OK",
            onPress: () => {
              router.push("/(tabss)");
            },
          },
        ]);
        setLoading(false);
        setSuccess(true);
      } catch (error) {
        setLoading(false);

        console.error("Error saving profile", error);
      }
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: false,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0]);
        setProfileImageLink(result.assets[0].uri);
      }
    } catch (err) {
      console.log("error on piking image", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topHeader}>
        <AntDesign
          name="arrowleft"
          size={24}
          color="white"
          onPress={() => navigation.navigate("Profile")}
        />
        <Text
          style={styles.headerTitle}
          onPress={() => navigation.navigate("Profile")}
        >
          Create Post
        </Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          <Avatar.Image
            size={120}
            source={
              profileImageLink
                ? { uri: profileImageLink }
                : require("../assets/images/avator.png")
            }
          />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
        />
        <TextInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          mode="outlined"
          keyboardType="phone-pad"
        />
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          mode="outlined"
          multiline
        />
        <Button
          mode="contained"
          onPress={saveProfile}
          style={styles.button}
          color={colors.primary}
          loading={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  form: {
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 20,
  },
  topHeader: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 15,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default EditProfile;
