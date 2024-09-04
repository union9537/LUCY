import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from "react-native";
import { IconButton, Button, ActivityIndicator } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);

  const [visibleComments, setVisibleComments] = useState({});
  const [followingUsers, setFollowingUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showFullRecipe, setShowFullRecipe] = useState(false);

  const url = process.env.EXPO_PUBLIC_API_URL;
  console.log(url);

  // let currentUserId = AsyncStorage.getItem("userId");
  // console.log(currentUserId);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
      fetchPosts();
    }, [])
  );

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${url}/getPosts`);
      const data = await response.json();
      setPosts(data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };
  const getUserById = (id) => {
    // console.log("hello", users, id);
    if (id) {
      return users.find((user) => user.UserID === id);
    }
  };
  const fetchUsers = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const response = await fetch(`${url}/getUsers`);
      const data = await response.json();
      setCurrentUserId(userId);
      // const userMap = {};
      // data.forEach((user) => {
      //   userMap[user.userID] = user;
      // });
      setUsers(data);
      // const userData = getUserById(userId);
      console.log(typeof likedPosts);
      setLikedPosts(
        data.find((user) => user.UserID === userId)?.likedPosts ?? []
      );
      console.log(typeof likedPosts);

      setFollowingUsers(
        data.find((user) => user.UserID === userId)?.following ?? []
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const likePost = async (postId) => {
    const isLiked = likedPosts.includes(postId);
    console.log(isLiked);

    const userId = await AsyncStorage.getItem("userId");

    try {
      const response = await fetch(`${url}/likePost/${userId}/${postId}`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (response.ok) {
        setLikedPosts((prevPosts) =>
          isLiked
            ? prevPosts.filter((id) => id !== postId)
            : [...prevPosts, postId]
        );
      }
      onRefresh();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    await fetchUsers();
    setRefreshing(false);
  };
  const handleFollowUnfollow = async (userId, isFollowing) => {
    const endpoint = isFollowing ? "DELETE" : "POST";

    fetch(`${url}/follow/${currentUserId}/${userId}`, {
      method: endpoint,
    })
      .then((response) => response.text())
      .then((response) => {
        setFollowingUsers((prev) =>
          isFollowing ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
        console.log(response);
        // onRefresh();
      })

      .catch((error) => {
        console.error("Error following/unfollowing user:", error);
      });
  };
  const toggleComments = (postId) => {
    // console.log(posts);
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const commentOnPost = async (postId) => {
    const userId = await AsyncStorage.getItem("userId");
    try {
      await fetch(`${url}/commentPost/${userId}/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: commentText }),
      });
      setCommentText("");
      setCommentingPostId(null);
      fetchPosts();
    } catch (error) {
      console.error("Error commenting on post:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, marginTop: 50 }}
    >
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postID}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const user = getUserById(item.UserID);

          const isFollowing = followingUsers
            ? followingUsers?.includes(item.UserID)
            : false;
          const isLiked = likedPosts
            ? likedPosts?.includes(item.postID)
            : false;
          // console.log(isLiked);
          // console.log(likedPosts);
          // console.log(item.postID);
          console.log("here it it     ");
          if (item.postType) {
            console.log(item.postData.recipeDetails);
          }
          // const isFollowing = false;
          // console.log(followingUsers);
          // const currentUserId = AsyncStorage.getItem("userId");
          // console.log(item.UserID, "======", currentUserId);
          return (
            <View
              style={
                item.postType === "Normal"
                  ? styles.postContainer
                  : styles.recipeContainer
              }
              key={item.postID}
            >
              {item.postType === "Recipe" && (
                <Text style={styles.recipeTitle}>Recipe Post</Text>
              )}
              <View style={styles.userInfo}>
                <Image
                  source={{
                    uri:
                      user?.userData?.profileImageLink || "default_image_link",
                  }}
                  style={styles.userProfileImage}
                />
                <Text style={styles.userName}>
                  {user?.userData?.name || "Unknown User"}
                </Text>
                {item?.UserID !== currentUserId && (
                  <Button
                    onPress={() =>
                      handleFollowUnfollow(item?.UserID, isFollowing)
                    }
                    style={
                      isFollowing ? styles.unfollowButton : styles.followButton
                    }
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </View>

              <Text style={styles.postTitle}>{item?.postData?.title}</Text>
              <Text style={styles.postBody}>{item?.postData?.body}</Text>
              <Image
                source={{
                  uri: item.postData?.imageLink || "default_image_link",
                }}
                style={
                  item.postType === "Normal"
                    ? styles.postImage
                    : styles.recipeImage
                }
              />

              {item.postType === "Recipe" && (
                <>
                  <Text style={styles.recipeHeader}>Ingredients:</Text>
                  <Text style={styles.recipeText}>
                    {showFullRecipe
                      ? item?.postData?.recipeDetails?.ingredients
                      : `${item?.postData?.recipeDetails?.ingredients?.substring(
                          0,
                          20
                        )}...`}
                  </Text>
                  <Text style={styles.recipeHeader}>Cooking Tips:</Text>
                  <Text style={styles.recipeText}>
                    {showFullRecipe
                      ? item?.postData?.recipeDetails?.tips
                      : `${item?.postData?.recipeDetails?.tips?.substring(
                          0,
                          100
                        )}...`}
                  </Text>

                  {showFullRecipe && (
                    <View>
                      <Text style={styles.recipeHeader}>Instructions:</Text>
                      <Text style={styles.recipeText}>
                        {item.postData?.recipeDetails?.instructions}
                      </Text>
                    </View>
                  )}
                  <MaterialIcons
                    onPress={() => setShowFullRecipe(!showFullRecipe)}
                    name={!showFullRecipe ? "expand-more" : "expand-less"}
                    size={24}
                    color="black"
                  />
                </>
              )}
              <View style={styles.separator} />
              <View style={styles.postActions}>
                {/* {console.log(likedPosts, "=========", item.postID)} */}
                <IconButton
                  icon={isLiked ? "heart" : "heart-outline"}
                  color={isLiked ? "black" : "green"}
                  size={24}
                  onPress={() => likePost(item.postID)}
                />

                <Text>{item.likes} likes</Text>

                <IconButton
                  icon="comment-outline"
                  size={24}
                  style={{ marginLeft: 25 }}
                  onPress={() => toggleComments(item.postID)}
                />
              </View>
              {visibleComments[item.postID] && (
                <View style={styles.commentInputContainer}>
                  <View>
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Write a comment..."
                      style={styles.commentInput}
                    />
                    <Button onPress={() => commentOnPost(item.postID)}>
                      Send
                    </Button>
                  </View>
                  <View style={styles.separator} />

                  <View style={styles.commentsSection}>
                    {item.comments.map((comment, index) => {
                      const commentedUser = getUserById(comment.userId);
                      return (
                        <View key={index} style={styles.comment}>
                          <Image
                            source={{
                              uri:
                                commentedUser?.userData?.profileImageLink ||
                                "default_image_link",
                            }}
                            style={styles.userProfileImage}
                          />
                          <Text style={styles.commentText}>
                            <Text style={styles.commentAuthor}>
                              {commentedUser?.userData?.name}
                            </Text>{" "}
                            {comment.comment}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 20,
    backgroundColor: "#f7f7f7",
    flexGrow: 1,
  },
  recipeContainer: {
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ff6347",
    marginBottom: 8,
    // marginLeft: "auto",
    borderRadius: 10,
    padding: 5,
    marginRight: "auto",
    backgroundColor: "#6200ee",
  },
  recipeImage: {
    width: "100%",
    height: 200,
    marginBottom: 8,
  },
  recipeHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  recipeText: {
    fontSize: 14,
    marginBottom: 8,
  },
  postContainer: {
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  followButton: {
    marginLeft: "auto",
    // padding: 5,
    // backgroundColor: "blue",
    color: "red",
    borderRadius: 5,
  },
  unfollowButton: {
    marginLeft: "auto",
    // padding: 5,
    // backgroundColor: "gray",
    color: "white",
    borderRadius: 5,
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  postBody: {
    fontSize: 14,
    marginBottom: 10,
  },

  postActions: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    padding: 10,
  },
  commentInputContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  commentsSection: {
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  comment: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
  },
  commentAuthor: {
    fontWeight: "bold",
  },
  commentsSection: {
    paddingVertical: 10,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
