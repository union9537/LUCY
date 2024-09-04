import { Tabs } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AntDesign } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarActiveBackgroundColor: "black",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Post"
        options={{
          title: "Post",
          tabBarIcon: ({ color, focused }) => (
            // <TabBarIcon
            //   name={focused ? "code-slash" : "code-slash-outline"}
            //   color={color}
            // />
            <TabBarIcon
              name={focused ? "pencil" : "pencil-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "chatbubble" : "chatbubble-outline"}
              color={color}
            />
            // <FontAwesome name="user-circle-o" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
            // <FontAwesome name="user-circle-o" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="EditPost"
        options={{
          title: "EditPost",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="Message"
        options={{
          title: "Message",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "chatbubble" : "chatbubble"}
              color={color}
            />
          ),
          href: null,
        }}
      />
    </Tabs>
  );
}
