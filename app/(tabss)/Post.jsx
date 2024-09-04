import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
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
import { storage } from "../../services/firebase/main";
import { useNavigation } from "expo-router";

const Post = () => {
  const url = process.env.EXPO_PUBLIC_API_URL;

  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imageLink, setImageLink] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [comments, setComments] = useState([]);
  const [postType, setPostType] = useState("Normal"); // Normal or Recipe
  const [recipeDetails, setRecipeDetails] = useState({
    ingredients: "",
    instructions: "",
    tips: "",
  });
  const navigation = useNavigation();
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
    console.log(url);

    if (!title || !body) {
      Alert.alert("Title and Body are required!");
      return;
    }

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
        const postData = { title, body, postType, imageLink: postImageLink };
        if (postType === "Recipe") {
          postData.recipeDetails = recipeDetails;
        }
        try {
          console.log("posting...");
          fetch(`${url}/newPost/${userId}/${postId}`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);

              //  handleMessage("success", "Profile updated successfully");
            })
            .catch((err) => {
              Alert.alert("Error creating post");
              console.log("error on updating", err);
            });
        } catch (error) {
          // setLoading(false);
          console.error("Error on posting:", error);
        }

        Alert.alert("Post created successfully");
        navigation.goBack();
      } catch (error) {
        console.error("Error saving profile", error);
        Alert.alert("Error creating post");
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
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Create Post</Text>
      </View>
      <View style={styles.postTypeContainer}>
        <Button
          mode={postType === "Normal" ? "contained" : "outlined"}
          onPress={() => setPostType("Normal")}
        >
          Normal Post
        </Button>
        <Button
          mode={postType === "Recipe" ? "contained" : "outlined"}
          onPress={() => setPostType("Recipe")}
        >
          Recipe Post
        </Button>
      </View>
      <View style={styles.header}>
        <Button
          mode="contained"
          onPress={pickImage}
          style={styles.imagePickerButton}
          color={colors.primary}
        >
          Upload an Image
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
        {postType === "Recipe" && (
          <View style={styles.recipeDetailsContainer}>
            <TextInput
              label="Ingredients"
              value={recipeDetails.ingredients}
              onChangeText={(text) =>
                setRecipeDetails({ ...recipeDetails, ingredients: text })
              }
              style={styles.input}
              multiline
              numberOfLines={3}
            />
            <TextInput
              label="Instructions"
              value={recipeDetails.instructions}
              onChangeText={(text) =>
                setRecipeDetails({ ...recipeDetails, instructions: text })
              }
              style={styles.input}
              multiline
              numberOfLines={5}
            />
            <TextInput
              label="Cooking Tips"
              value={recipeDetails.tips}
              onChangeText={(text) =>
                setRecipeDetails({ ...recipeDetails, tips: text })
              }
              style={styles.input}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

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
    marginTop: 50,

    paddingBottom: 30,
  },
  postTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    margin: 20,
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
  recipeDetailsContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    margin: 20,
  },
  successText: {
    color: "green",
    marginTop: 10,
    textAlign: "center",
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

export default Post;
