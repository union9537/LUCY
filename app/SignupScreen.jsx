import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { window, wsize, hsize } from "../entities/constants";
// import { AuthContext } from "../services/context/AuthContext";

import { TextInput, Button, Text } from "react-native-paper";

import { Link, useNavigation } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, setUserIdLocalStorage } from "../services/firebase/main";
const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigation = useNavigation();
  // const authContext = useContext(AuthContext);

  const authHandler = async (email, password) => {
    console.log(password, confPassword);
    if (email === "" || password === "" || confPassword === "") {
      Alert.alert("Wrong Credentials", "Empty Fields.");
    } else if (password !== confPassword) {
      Alert.alert("Wrong Credentials", "Passwords do not match.");
    } else if (email) {
      const expression =
        /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
      if (!expression.test(String(email).toLowerCase())) {
        Alert.alert("Wrong Credentials", "Wrong Email Format.");
      } else {
        setLoading(true);
        setSuccess(false);
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          setLoading(false);
          setSuccess(true);
          console.log("done");
          setUserIdLocalStorage(userCredential.user.uid);

          Alert.alert(
            "Youa have signed up successfully",
            "Now create your profile",
            [
              {
                text: "OK",
                onPress: () => {
                  navigation.navigate("EditProfile", { new: true });
                },
              },
            ]
          );

          // console.log("user Created ", userCredential.user.uid, email);
        } catch (err) {
          setLoading(false);
          console.log(err);
          Alert.alert("err on signing up", err);
        }
      }
    }
  };
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/lucylogo.png")}
        style={styles.logo}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        maxLength={45}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Confirm Password"
        value={confPassword}
        onChangeText={(text) => setConfPassword(text)}
        style={styles.input}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={() => authHandler(email, password)}
        style={styles.button}
        loading={loading}
      >
        {loading ? "Sign Up..." : "Sign Up"}
      </Button>
      <Text style={styles.text}>
        Already have an account?
        <Text style={styles.link}>
          <Link href={"/"}>Login</Link>
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
    // justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    paddingVertical: 10,
  },
  text: {
    marginTop: 20,
  },
  link: {
    color: "#6200ee",
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default SignupScreen;
