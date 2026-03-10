import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Button } from "react-native-paper";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons"; // Importing icons
import { useSignInViewModel } from "../ModelView/signinView";
import PasswordResetScreen from "../View/NewsFeed/changePassword";

const Separator = ({ text }) => (
  <View style={styles.separatorContainer}>
    <View style={styles.separatorLine} />
    <Text style={styles.separatorText}>{text}</Text>
    <View style={styles.separatorLine} />
  </View>
);

const LoginForm = () => {
  const { email, setEmail, password, setPassword, handleSignIn } =
    useSignInViewModel();
  const [loading, setLoading] = useState(false); // State for loading
  const [error, setError] = useState(""); // State for error message
  const [googleButtonStyle, setGoogleButtonStyle] = useState({
    backgroundColor: "white",
    borderColor: "black",
    textColor: "black",
  });
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility

  const handleGoogleButtonPressIn = () => {
    setGoogleButtonStyle({
      backgroundColor: "black",
      borderColor: "white",
      textColor: "white",
    });
  };

  const handleGoogleButtonPressOut = () => {
    setGoogleButtonStyle({
      backgroundColor: "white",
      borderColor: "black",
      textColor: "black",
    });
  };

  const handleSignInPress = async () => {
    setLoading(true); // Set loading to true when starting sign-in
    setError(""); // Reset error state

    try {
      await handleSignIn();
    } catch (error) {
      // Set error message if sign-in fails
      setError("Incorrect email or password. Please try again.");
      console.error("Sign-in failed", error);
     
    }

    setLoading(false); // Set loading to false after sign-in completes
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Login</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="email"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputWrapper}>
          <FontAwesome
            name="lock"
            size={24}
            color="black"
            style={styles.icon}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
        </View>

        {error ? Alert.alert(error) : null}

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#000000"
            style={styles.loading}
          />
        ) : (
          <Button
            mode="contained"
            onPress={handleSignInPress}
            style={styles.button}
            labelStyle={{ color: "white" }}
          >
            Login
          </Button>
        )}

        <Separator text="OR" />

        <Button
          mode="outlined"
          onPress={() => console.log("Google Sign In pressed")}
          onPressIn={handleGoogleButtonPressIn}
          onPressOut={handleGoogleButtonPressOut}
          style={[
            styles.button,
            {
              backgroundColor: googleButtonStyle.backgroundColor,
              borderColor: googleButtonStyle.borderColor,
            },
          ]}
          labelStyle={{ color: googleButtonStyle.textColor }}
        >
          Sign in with Google
        </Button>

        {/* Forgot password link */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Password Reset Screen */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <PasswordResetScreen closeModal={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    alignItems: "center",
    padding: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderColor: "#000000",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  icon: {
    paddingRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  button: {
    marginVertical: 10,
    borderRadius: 20,
    padding: 5,
    backgroundColor: "#242424",
  },
  loading: {
    marginVertical: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
  },
  separatorText: {
    marginHorizontal: 10,
    color: "black",
    fontWeight: "bold",
  },
  forgotPasswordText: {
    marginTop: 10,
    color: "blue",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default LoginForm;
