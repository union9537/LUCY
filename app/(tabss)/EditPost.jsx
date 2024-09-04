import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  IconButton,
} from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditPost() {
  const url = process.env.EXPO_PUBLIC_API_URL;

  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [imageLink, setImageLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPostData();
  }, [postId]);

  const fetchPostData = async () => {
    setLoading(true);
    try {
      console.log("getting post");

      fetch(`${url}/getPost/${postId}`)
        .then((response) => response.json())
        .then((postData) => {
          setPost(postData);
          setTitle(postData.postData.title);
          setBody(postData.postData.body);
          setComments(postData.comments);
          setLikes(postData.likes);
          setImageLink(postData.postData.imageLink);
          console.log("getting post DOne");

          setLoading(false);
        })
        .catch((err) => {
          console.log("error getting post", err);
        });
    } catch (error) {
      console.error("Error fetching post data:", error);
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPostData();
    setRefreshing(false);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${url}/updatePost/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert("Post updated successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error updating post", result.error);
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const response = await fetch(`${url}/deletePost/${userId}/${postId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        Alert.alert("Post deleted successfully");
        navigation.goBack();
      } else {
        Alert.alert("Error deleting post", result.error);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };
  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Post</Text>
        <IconButton icon="refresh" size={24} onPress={onRefresh} />
      </View>
      {imageLink ? (
        <Image source={{ uri: imageLink }} style={styles.postImage} />
      ) : null}
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Body"
        value={body}
        onChangeText={setBody}
        style={styles.input}
        multiline
        numberOfLines={4}
      />
      <Button mode="contained" onPress={handleUpdate} style={styles.button}>
        Update Post
      </Button>
      <Button
        mode="contained"
        onPress={handleDelete}
        style={[styles.button, { backgroundColor: "red" }]}
      >
        Delete Post
      </Button>
      <View style={styles.footer}>
        <Text style={styles.likes}>Likes: {likes}</Text>
        <Text style={styles.commentsTitle}>Comments</Text>
        {comments.map((comment, index) => (
          <Card key={index} style={styles.commentCard}>
            <Card.Content>
              <Title>Comment {index + 1}</Title>
              <Paragraph>{comment}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
    backgroundColor: "#f7f7f7",
    flexGrow: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
    paddingVertical: 10,
  },
  footer: {
    marginTop: 20,
  },
  likes: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentCard: {
    marginBottom: 10,
  },
});
