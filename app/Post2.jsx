import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-uuid";
import {
  getDownloadURL,
  getStorage,
  ref as sRef,
  uploadBytes,
} from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "../services/firebase/main";

const Post = () => {
  const url = "http://192.168.29.64:3001";

  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imageLink, setImageLink] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      //   aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
      setImage(result.assets[0]);
    }
  };

  const createPost = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const userId = await AsyncStorage.getItem("userId");
      let postImageLink;
      try {
        const postId = uuid();
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const fileName = image.uri.split("/").pop();
        const storageRef = sRef(
          storage,
          `/posts/${userId}/${postId}/${fileName}`
        );

        try {
          console.log("uploading post image....");
          await uploadBytes(storageRef, blob);
          postImageLink = await getDownloadURL(storageRef);

          setImageLink(postImageLink);
          console.log("post Image uploded");
          // console.log(profileData);
        } catch (err) {
          console.log("error uploding post image ", err);
        }
        try {
          console.log("posting...");
          fetch(`${url}/newPost/${userId}/${postId}`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              body,
              imageLink: postImageLink,
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
          console.error("Error on posting:", error);
        }

        alert("Post posted");
      } catch (error) {
        console.error("Error saving profile", error);
      }

      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      console.error("Error creating post", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="contained"
          onPress={pickImage}
          style={styles.imagePickerButton}
          color={colors.primary}
        >
          Pick an Image
        </Button>
        {image && <Image source={{ uri: image.uri }} style={styles.image} />}
      </View>
      <View style={styles.form}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Body"
          value={body}
          onChangeText={setBody}
          style={styles.input}
          mode="outlined"
          multiline
        />
        <Button
          mode="contained"
          onPress={createPost}
          style={styles.button}
          color={colors.primary}
          loading={loading}
        >
          {loading ? "Posting..." : "Post"}
        </Button>
        {success && (
          <Text style={styles.successText}>Post created successfully!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  imagePickerButton: {
    marginBottom: 10,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
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
  successText: {
    color: "green",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Post;
