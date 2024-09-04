import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";
import Entypo from "@expo/vector-icons/Entypo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase/main";
import { async } from "@firebase/util";
import { FontAwesome } from "@expo/vector-icons";
import { useCallback } from "react";

const Profile = () => {
  const url = process.env.EXPO_PUBLIC_API_URL;

  const [profile, setProfile] = useState(null);
  const [following, setFollowing] = useState(0);
  const [follower, SetFollower] = useState(0);

  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProfileData();
    getUserId();
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
      getUserId();
    }, [])
  );
  const getUserId = async () => {
    const adminId = "MtciQdtfhNbStrKMCtQRNOEU3el2";
    const userId = await AsyncStorage.getItem("userId");
    if (userId === adminId) {
      setIsAdmin(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      navigation.replace("index");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const handleRefresh = async () => {
    fetchProfileData();
  };
  const fetchProfileData = async () => {
    const userId = await AsyncStorage.getItem("userId");
    console.log(userId);

    try {
      fetch(`${url}/userInfo/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("user data reded.");
          //   console.log(data);
          setProfile(data.userData);
          setPosts(data.posts);
          if (data.follower) {
            SetFollower(data.follower);
          }
          if (data.following) {
            setFollowing(data.following.length);
          }
        })
        .catch((err) => {
          console.log("error getting user data", err);
        });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  if (!profile) {
    return (
      <View style={(styles.topHeader, { margin: 40 })}>
        <View>
          <Text style={styles.headerTitle}>Loading User Data...</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.logoutButton}>
            <FontAwesome name="refresh" size={24} color="white" />
            <Text style={styles.logoutText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Entypo
            name="log-out"
            size={24}
            color="white"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Image
          source={{ uri: profile.profileImageLink }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.stats}>Followers {follower}</Text>
            <Text style={styles.stats}>Following {following}</Text>
            <Text style={styles.stats}>
              Posts {posts ? posts.length : null}
            </Text>
          </View>
          <Button mode="contained" style={styles.editProfileButton}>
            <Link href="EditProfile">Edit Profile</Link>
          </Button>
          {isAdmin && (
            <Button mode="contained" style={styles.editProfileButton}>
              <Link href="Admin">Admin Page</Link>
            </Button>
          )}
        </View>
      </View>
      <Text style={styles.title}>Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.postId}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditPost", { postId: item.postId })
            }
          >
            <Image source={{ uri: item.imageLink }} style={styles.postImage} />
          </TouchableOpacity>
        )}
        style={styles.postsGrid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: "auto",
    marginRight: "auto",
  },
  bio: {
    fontSize: 16,
    color: "#666",
    marginVertical: 5,
  },
  email: {
    fontSize: 14,
    color: "#888",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  stats: {
    fontSize: 14,
    fontWeight: "bold",
  },
  editProfileButton: {
    marginTop: 10,
  },
  logoutButton: {
    padding: 10,
    width: 80,
    alignSelf: "flex-end",
    marginRight: 10,

    // backgroundColor: "#ff6347",
    borderRadius: 5,
    // position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  postsGrid: {
    marginTop: 10,
  },
  postImage: {
    width: 100,
    height: 100,
    margin: 2,
  },
});

export default Profile;
