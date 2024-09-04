import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { GiftedChat, Actions, Send, Bubble } from "react-native-gifted-chat";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "../../services/firebase/main";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { getDownloadURL, ref as sRef, uploadBytes } from "firebase/storage";
import { Text } from "react-native-paper";

const Message = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const [userId, setUserId] = useState(null);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState();

  const [file, setFile] = useState(null);
  const { receiverId: initialReceiverId } = useLocalSearchParams();
  const [receiverId, setReceiverId] = useState(initialReceiverId);
  // const [receiverId, setReceiverId] = useState("");

  const url = process.env.EXPO_PUBLIC_API_URL;
  // const { receiverId } = useLocalSearchParams();
  console.log("res is ", initialReceiverId);
  // setReceiverId(useLocalSearchParams().receiverId);

  console.log(url);
  // useEffect(() => {
  //   fetchUserId();
  //   fetchMessages(initialReceiverId);
  // }, [initialReceiverId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserId();
      fetchUsers();
      fetchMessages(initialReceiverId);
    }, [initialReceiverId])
  );

  const fetchUsers = async () => {
    const id = await AsyncStorage.getItem("userId");

    try {
      const response = await fetch(`${url}/getUsers`);
      const data = await response.json();
      setUsers(data);
      console.log("users", data);

      setCurrentUser(data.find((user) => user.UserID === id));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  const getUserById = (id) => {
    if (id) {
      return users.find((user) => user.UserID === id);
    }
    return null;
  };
  const fetchUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    setUserId(id);
  };
  const fetchMessages = async (receiverIdd) => {
    try {
      const senderId = await AsyncStorage.getItem("userId");

      const response = await fetch(
        `${url}/getMessages/${senderId}/${initialReceiverId}`
      );

      const data = await response.json();
      console.log(data);

      const formattedMessages = data
        .map((message) => {
          console.log("uzer ", getUserById(message.senderId));

          const messageObj = {
            _id: message._id || "Unknown",
            text:
              message.text ||
              (message.fileType
                ? message.fileType === "image"
                  ? "Image"
                  : "Document"
                : "Unknown"),
            createdAt: new Date(message.timestamp) || "Unknown",
            user: {
              _id: message.senderId || "Unknown",
              name: getUserById(message.senderId)?.userData?.name || "Unknown",
              avatar:
                getUserById(message.senderId)?.userData?.profileImageLink ||
                "https://e7.pngegg.com/pngimages/136/22/png-clipart-user-profile-computer-icons-girl-customer-avatar-angle-heroes-thumbnail.png",
            },
            image: message.fileType === "image" ? message.safeFileUrl : null,
            file: message.fileType === "document" ? message.safeFileUrl : null,
          };
          return messageObj;
        })
        .reverse();
      console.log("formattedMessages", formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error(error);
    }
  };
  const uploadFileToFirebase = async (file, userId, folder) => {
    try {
      console.log("uploading");
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const fileName = file.uri.split("/").pop();
      const storageRef = sRef(storage, `/messages/${userId}/${fileName}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("uploading done");

      return downloadURL;
    } catch (err) {
      console.error("error on uploading file to firebase", err);
    }
  };
  const onSend = useCallback(
    async (messages = [], file = null, fileType = null) => {
      const { text } = messages[0] || { text: "" };
      console.log("seningdd");
      const senderId = await AsyncStorage.getItem("userId");

      let messageData = {
        senderId: senderId,
        receiverId: initialReceiverId,
        text: text || "",
      };
      if (fileType && file) {
        const folder = fileType === "image" ? "image" : "document";
        const fileUrl = await uploadFileToFirebase(file, senderId, folder);

        messageData = {
          ...messageData,
          fileType2: fileType,
          fileUrl,
        };
      }

      try {
        await fetch(`${url}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        });
        setText("");
        setFile(null);
        fetchMessages(receiverId);
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, messages)
        );
      } catch (error) {
        console.error("error when sending message to mongo ", error);
      }
    },
    [file, receiverId]
  );
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: false,
      });

      if (!result.canceled) {
        console.log("why not working");
        onSend([], result.assets[0], "image");
      }
    } catch (err) {
      console.log("error on piking image", err);
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      console.log(res);
      if (!res.canceled) {
        console.log("sening1");
        onSend([], res.assets[0], "document");
      } else {
        console.log("User cancelled document picker");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const renderActions = (props) => {
    return (
      <Actions
        {...props}
        options={{
          ["Send Image"]: pickImage,
          ["Send File"]: handlePickDocument,
        }}
        icon={() => <Icon name="add" size={28} color="#000" />}
        onSend={(args) => console.log(args)}
      />
    );
  };
  const renderMessageImage = (props) => {
    return (
      <Image
        source={{
          uri: props.currentMessage.image
            ? props.currentMessage.image
            : "https://lightwidget.com/wp-content/uploads/localhost-file-not-found.jpg",
        }}
        style={{ width: 200, height: 200 }}
      />
    );
  };
  const renderCustomView = (props) => {
    if (props.currentMessage.file) {
      return (
        <TouchableOpacity
          onPress={() => Linking.openURL(props.currentMessage.file)}
        >
          <Text style={{ color: "blue", textDecorationLine: "underline" }}>
            Open Document
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <Icon name="send" size={28} color="#1E90FF" />
        </View>
      </Send>
    );
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#1E90FF",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
        }}
      />
    );
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: userId,
        name: currentUser?.userData?.name || "Abebe",
        avatar:
          currentUser?.userData?.profileImageLink ||
          "https://e7.pngegg.com/pngimages/136/22/png-clipart-user-profile-computer-icons-girl-customer-avatar-angle-heroes-thumbnail.png",
      }}
      renderMessageImage={renderMessageImage}
      renderCustomView={renderCustomView}
      renderActions={renderActions}
      renderSend={renderSend}
      renderBubble={renderBubble}
      placeholder="Type a message..."
    />
  );
};

const styles = StyleSheet.create({
  sendingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
});

export default Message;
