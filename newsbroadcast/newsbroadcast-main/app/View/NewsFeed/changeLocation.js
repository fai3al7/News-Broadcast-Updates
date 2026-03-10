import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useProfileViewModel } from "../../ModelView/profileViewModel";
import locationData from "../../../assets/locations.json";

const UpdateLocation = () => {
  const { userData, handleUpdateLocation, fetchUserData, loading } =
    useProfileViewModel();

  const [location, setLocation] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setLocation(userData.location || "");
    }
  }, [userData]);

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

  const handleSubmit = () => {
    handleUpdateLocation(location); // Pass the plain location string
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Location"
        style={styles.input}
        value={location}
        onChangeText={handleLocationInput}
      />

      {/* Dropdown for Locations */}
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

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={loading}
      >
        UPDATE LOCATION
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
  },
  input: {
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  dropdown: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    maxHeight: 150,
    marginVertical: 5,
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
  submitButton: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: "black",
  },
});

export default UpdateLocation;
