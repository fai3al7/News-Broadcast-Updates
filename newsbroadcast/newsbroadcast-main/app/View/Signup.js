import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useSignupViewModel } from "../ModelView/signupView";
import locationData from "../../assets/locations.json";

const SignupForm = () => {
  const {
    name,
    setName,
    email,
    setEmail,
    location,
    setLocation,
    password,
    setPassword,
    cnic,
    setCnic,
    handleSignUp,
  } = useSignupViewModel();

  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const errors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|int)$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])(?=.{8,})/;
    const cnicRegex = /^\d{13}$/;

    if (!name || !nameRegex.test(name)) {
      errors.name =
        "Full Name should not contain numbers or special characters.";
    }
    if (!email || !emailRegex.test(email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!password || !passwordRegex.test(password)) {
      errors.password =
        "Password must be at least 8 characters, include one uppercase letter, one number, and one special character.";
    }
    if (!cnic || !cnicRegex.test(cnic)) {
      errors.cnic = "CNIC must be 13 digits without dashes.";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUpPress = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await handleSignUp();
    } catch (error) {
      console.error("Signup failed:", error);
    }
    setLoading(false);
  };

  const handleLocationInput = (text) => {
    setLocation(text);
    if (text.trim() !== "") {
      const results = locationData.filter((item) =>
        item.Name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredLocations(results);
      setShowDropdown(results.length > 0);
    } else {
      setShowDropdown(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SIGNUP</Text>
      </View>
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="account-circle" size={24} style={styles.icon} />
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="location-on" size={24} style={styles.icon} />
          <TextInput
            placeholder="Enter Location"
            value={location}
            onChangeText={handleLocationInput}
            style={styles.input}
          />
          {showDropdown && (
            <FlatList
              data={filteredLocations}
              keyExtractor={(item, index) => index.toString()}
              style={styles.dropdown}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setLocation(item.Name);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownText}>{item.Name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
        <View style={styles.inputWrapper}>
          <MaterialIcons name="email" size={24} style={styles.icon} />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <View style={styles.inputWrapper}>
          <FontAwesome name="lock" size={24} style={styles.icon} />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        <View style={styles.inputWrapper}>
          <MaterialIcons name="badge" size={24} style={styles.icon} />
          <TextInput
            placeholder="CNIC (13 digits without dashes)"
            value={cnic}
            onChangeText={setCnic}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>
        {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="black"
            style={styles.loading}
          />
        ) : (
          <Button
            mode="contained"
            onPress={handleSignUpPress}
            style={styles.button}
            labelStyle={{ color: "white" }}
          >
            SIGNUP
          </Button>
        )}
      </View>
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
    marginVertical: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 28,
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
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
    color: "black",
  },
  input: {
    flex: 1,
    height: 40,
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    maxHeight: 150,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: "black",
  },
  button: {
    backgroundColor: "black",
    marginVertical: 20,
  },
  loading: {
    marginVertical: 20,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 5,
  },
});

export default SignupForm;
