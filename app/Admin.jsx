import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function Admin() {
  const [userCount, setUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [monthlyPostsData, setMonthlyPostsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchAppData();
  }, []);

  const fetchAppData = async () => {
    setLoading(true);
    try {
      const url = process.env.EXPO_PUBLIC_API_URL;
      const adminId = "MtciQdtfhNbStrKMCtQRNOEU3el2";

      // Fetch all posts
      const postsResponse = await fetch(`${url}/getPosts`);
      const postsData = await postsResponse.json();
      setPostCount(postsData.length);
      processMonthlyPostsData(postsData);

      // Fetch all users
      const usersResponse = await fetch(`${url}/getUsers`);
      const usersData = await usersResponse.json();
      setUsers(usersData.filter((user) => user.UserID !== adminId));

      setUserCount(usersData.length - 1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyPostsData = (posts) => {
    const monthlyData = {};

    posts.forEach((post) => {
      const postDate = new Date(post.createdAt);
      if (!isNaN(postDate)) {
        // Check if the date is valid
        const month = postDate.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (monthlyData[month]) {
          monthlyData[month]++;
        } else {
          monthlyData[month] = 1;
        }
      } else {
        console.error("Invalid date:", post.postAt);
      }
    });

    const formattedData = Object.keys(monthlyData).map((month) => ({
      month,
      count: monthlyData[month],
    }));

    setMonthlyPostsData(formattedData);
    console.log(formattedData);
  };

  const handleDeleteUser = async (userId) => {
    const url = process.env.EXPO_PUBLIC_API_URL;

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this user?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await fetch(`${url}/deleteUser/${userId}`, {
                method: "DELETE",
              });
              Alert.alert("User deleted successfully");
              setUsers(users.filter((user) => user.UserID !== userId));
            } catch (error) {
              Alert.alert("Error deleting user", error.message);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>App Overview</Text>
        <Text style={styles.stat}>Number of Users: {userCount}</Text>
        <Text style={styles.stat}>Number of Posts: {postCount}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Posts Per Month</Text>
        <BarChart
          data={{
            labels: monthlyPostsData.map((data) => data.month),
            datasets: [
              {
                data: monthlyPostsData.map((data) => data.count),
              },
            ],
          }}
          width={screenWidth - 30}
          height={220}
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={styles.userListContainer}>
        <Text style={styles.userListTitle}>Users</Text>
        {users.map((user) => (
          <View key={user.UserID} style={styles.userCard}>
            <Text style={styles.userName}>{user.userData.name}</Text>
            <Button
              title="Delete"
              onPress={() => handleDeleteUser(user.UserID)}
              color="red"
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    marginTop: 40,
    padding: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stat: {
    fontSize: 18,
    marginVertical: 5,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userListContainer: {
    marginBottom: 20,
  },
  userListTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  userName: {
    fontSize: 18,
  },
});
