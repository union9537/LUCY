import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import TextButton from "../components/TextButton";
import { window, wsize, hsize } from "../entities/constants";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { Link } from "expo-router";
import Input from "../components/Input";
import { Entypo, Ionicons, AntDesign } from "@expo/vector-icons";
// import * as Google from "expo-google-app-auth";
// import libFirebase from "firebase";
// import "firebase/firestore";
// import "firebase/auth";

import firebase from "../services/firebase/main";
const goggleImage = require("../assets/images/google-logo-9808.png");

// const SignupFirstScreen = ({ navigation }) => {
//   const IOS_CLIENT_ID =
//     '411631689322-7ihe009nfabehldgftlj6sa84mqidtuf.apps.googleusercontent.com';
//   const ANDROID_CLIENT_ID =
//     '411631689322-pu8160rcp7vifvflhqa1c54mkt9hb40o.apps.googleusercontent.com';
//   const iconSize = wsize(24);
//   return (
//
//   );
// };

// export default SignupFirstScreen;

const IOS_CLIENT_ID =
  "411631689322-7ihe009nfabehldgftlj6sa84mqidtuf.apps.googleusercontent.com";
const ANDROID_CLIENT_ID =
  "411631689322-pu8160rcp7vifvflhqa1c54mkt9hb40o.apps.googleusercontent.com";
const iconSize = wsize(24);

export default class LoginScreen extends Component {
  render() {
    return (
      <>
        <Logo />
        <SafeAreaView style={styles.container}>
          <View style={styles.mainContainer}>
            <Link href="SignupScreen" asChild>
              <Button
                icon={
                  <Ionicons
                    name="md-person"
                    size={iconSize}
                    color="black"
                    style={styles.iconStyle}
                  />
                }
                title="Use phone or email"
                style={styles.additionalButton}
                titleStyle={styles.titleStyle}
                // onPress={() => this.props.navigation.navigate("Signup")}
              />
            </Link>
            <Button
              icon={
                <Entypo
                  name="facebook"
                  size={iconSize}
                  color="#4267B2"
                  style={styles.iconStyle}
                />
              }
              title="Continue with Facebook"
              style={styles.additionalButton}
              titleStyle={styles.titleStyle}
              disabled
            />
            <TouchableOpacity
              style={styles.googleButton}
              onPress={this.signInWithGoogle}
            >
              <Image
                source={goggleImage}
                style={{
                  width: wsize(24),
                  height: wsize(24),
                  marginLeft: wsize(15),
                  marginRight: wsize(20),
                }}
              />
              <View style={{ flexDirection: "row" }}>
                <Text adjustsFontSizeToFit style={styles.googleButtonText}>
                  Continue with Google
                </Text>
                <AntDesign
                  name="google"
                  size={iconSize}
                  color="white"
                  style={styles.iconStyle}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View>
            <View style={styles.termsView}>
              <Text style={styles.termsText}>
                By signing up, you agree to Looks'Terms of Use and confirm that
                you have read Looks'Privacy Policy
              </Text>
            </View>
            <View style={styles.bottomContainer}>
              <Text style={styles.getHelpText}>Already have an account?</Text>
              <TextButton
                onPress={() => this.props.navigation.navigate("Login")}
              >
                Log In
              </TextButton>
            </View>
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  mainContainer: {
    marginTop: hsize(54),
    justifyContent: "center",
  },
  getHelpContainer: {
    marginTop: hsize(10),
    flexDirection: "row",
    justifyContent: "center",
  },
  getHelpText: {
    color: "#939094",
  },
  termsView: {
    marginTop: hsize(20),
    marginHorizontal: wsize(45),
  },
  termsText: {
    textAlign: "center",
  },
  bottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderTopWidth: 1,
    height: hsize(79),
    width: "100%",
    borderColor: "#DADBDA",
  },
  additionalButton: {
    justifyContent: "flex-start",
    backgroundColor: "#FCF9FC",
    borderColor: "#DADBDA",
    borderWidth: 1,
    borderRadius: 6,
  },
  iconStyle: {
    marginLeft: wsize(15),
    marginRight: wsize(20),
  },
  titleStyle: {
    color: "#313131",
    // fontFamily: 'Rubik',
    fontWeight: "500",
    fontSize: wsize(15),
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: wsize(293),
    height: hsize(56),
    backgroundColor: "#FCF9FC",
    // marginTop: hsize(13),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DADBDA",
    justifyContent: "flex-start",
    backgroundColor: "#FCF9FC",
    borderColor: "#DADBDA",
    borderWidth: 1,
    borderRadius: 6,
  },
  googleButtonText: {
    fontSize: wsize(15),
    // lineHeight: wsize(18),
    letterSpacing: 0.6,
    color: "#313131",
  },
});
``;
