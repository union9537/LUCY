import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Link } from "expo-router";

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const url = process.env.EXPO_PUBLIC_API_URL;
  // const [followingUsers, setFollowingUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  useEffect(() => {
    fetchUserId();
    fetchUsers();
  }, []);
  const fetchUserId = async () => {
    const userId = await AsyncStorage.getItem("userId");
    setCurrentUserId(userId);
  };
  const fetchUsers = async () => {
    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem("userId");

      const response = await fetch(`${url}/getUsers`);
      const data = await response.json();
      setUsers(data.filter((user) => user.UserID !== userId));
      // setFollowingUsers(
      //   data.find((user) => user.UserID === userId)?.following ?? []
      // );
      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.error("Error fetching users:", error);
    }
  };

  const handleFollow = async (userId) => {
    fetch(`${url}/follow/${currentUserId}/${userId}`, {
      method: "POST",
    })
      .then((response) => response.text())
      .then(() => {
        onRefresh();
      })

      .catch((error) => {
        console.error("Error following/unfollowing user:", error);
      });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };
  // const handleMessage = (userId) => {
  //   // console.log("messaging ", userId);
  //   navigation.navigate("Message", { userId: userId });
  // };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <FlatList
        data={users}
        keyExtractor={(item) => item.UserID}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const isFollowing = item?.followers?.includes(currentUserId);
          const isFollower = item?.following?.includes(currentUserId);

          return (
            <View style={styles.userContainer}>
              <Image
                source={{ uri: item?.userData?.profileImageLink }}
                style={styles.profileImage}
              />
              <Text style={styles.userName}>{item?.userData?.name}</Text>
              {isFollowing && isFollower ? (
                <TouchableOpacity style={styles.messageButton}>
                  <Text style={styles.buttonText}>
                    <Link
                      href={{
                        pathname: `Message?receiverId=${item.UserID}`,
                      }}
                    >
                      Message
                    </Link>
                  </Text>
                </TouchableOpacity>
              ) : isFollower ? (
                <TouchableOpacity
                  style={styles.followBackButton}
                  onPress={() => handleFollow(item.UserID)}
                >
                  <Text style={styles.buttonText}>Follow Back</Text>
                </TouchableOpacity>
              ) : isFollowing ? (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => {
                    Alert.alert(
                      "The other person should follow you back to message."
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Following</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={() => handleFollow(item.UserID)}
                >
                  <Text style={styles.buttonText}>Follow</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 50,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
  followButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  followBackButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  messageButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chat;
