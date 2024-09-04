import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
} from "react-native";

import { TextInput, Button, Text } from "react-native-paper";

import { Entypo } from "@expo/vector-icons";
import { Link, router, useNavigation } from "expo-router";

import { auth, setUserIdLocalStorage } from "../services/firebase/main";

import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import { AuthContext } from "../../services/context/AuthContext";

const LoginScreen = () => {
  const navigation = useNavigation();

  const getUserId = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      router.replace("/(tabss)");
      return;
    }
  };

  useEffect(() => {
    getUserId();
  }, []);
  useFocusEffect(
    useCallback(() => {
      getUserId();
    }, [])
  );
  // const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // const authContext = useContext(AuthContext);

  const authHandler = async (email, password) => {
    if (email === "" || password === "") {
      Alert.alert("Wrong Credentials", "Empty Fields.");
    } else if (email) {
      const expression =
        /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
      if (!expression.test(String(email).toLowerCase())) {
        Alert.alert("Wrong Credentials", "Wrong Email Format.");
      } else {
        setLoading(true);
        setSuccess(false);
        try {
          console.log(email, password);
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

          const userId = userCredential.user.uid;

          const displayName = userCredential.user.displayName;
          // console.log(displayName);
          // Alert.alert("Good", displayName);
          setLoading(false);
          setSuccess(true);
          console.log("login successful");
          // console.log(auth.currentUser);
          setUserIdLocalStorage(userId);
          router.replace("/(tabss)");
        } catch (error) {
          setLoading(false);

          console.log(error);
          Alert.alert("Error on Logging up, Try again");
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
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={() => authHandler(email, password)}
        style={styles.button}
        loading={loading}
      >
        {loading ? "Logging" : "Login"}
      </Button>
      <Text style={styles.text}>
        Don't have an account?{" "}
        <Text style={styles.link}>
          <Link href={"/SignupScreen"}>Sign Up</Link>
        </Text>
      </Text>
    </View>
    // <ScrollView>
    //   <Logo />
    //   <SafeAreaView style={styles.container}>
    //     <View style={styles.mainContainer}>
    //       <Input
    //         placeholder="Phone Number, username or email"
    //         onChangeText={(text) => setEmail(text)}
    //         maxLength={45}
    //       />
    //       <Input
    //         placeholder="Password"
    //         onChangeText={(text) => setPassword(text)}
    //         secureTextEntry
    //       />
    //       <Button
    //         title="Login"
    //         onPress={() => authHandler(email, password)}
    //         style={{ backgroundColor: "#52BDEB", marginTop: wsize(5) }}
    //         titleStyle={{ color: "white" }}
    //       />
    //       <View style={styles.getHelpContainer}>
    //         <Text style={styles.getHelpText}>Forgot your login details? </Text>
    //         <TextButton>
    //           {" "}
    //           <Link href="Post">Get help signing in</Link>
    //         </TextButton>
    //       </View>*
    //     </View>
    //     <View style={styles.bottomContainer}>
    //       <Text style={styles.getHelpText}>Don't have an account?</Text>
    //       <TextButton>
    //         <Link href="/Profile">Sign up</Link>
    //       </TextButton>
    //     </View>
    //   </SafeAreaView>
    // </ScrollView>
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
});
export default LoginScreen;
//TODO Profile managmenr

//TODO Post
//TODO comunicatte
