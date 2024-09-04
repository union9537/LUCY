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
import { useNavigation } from "@react-navigation/native";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase/main";

const Profile = () => {
  const url = process.env.EXPO_PUBLIC_API_URL;

  const [profile, setProfile] = useState(null);
  const [following, setFollowing] = useState(0);
  const [follower, SetFollower] = useState(0);

  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfileData();
  }, []);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      navigation.replace("index");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const fetchProfileData = async () => {
    const userId = await AsyncStorage.getItem("userId");
    // console.log(userId);

    try {
      fetch(`${url}/userInfo/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("user data reded.");
          console.log(data);
          setProfile(data.userData);
          setPosts(data.posts);
          if (data.follower) {
            SetFollower(data.follower);
          }
          if (data.following) {
            setFollowing(data.following);
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
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Entypo
          name="log-out"
          size={24}
          color="black"
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
        </View>
      </View>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    // color: "#fff",
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
