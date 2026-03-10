import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { Tabs } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import Modal from './createNews';

export default function TabLayout() {

  const [isModalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  return (
   
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="UserHome"
        options={{
          headerShown: false,
          tabBarIcon: ({ }) => <AntDesign size={28} name="home" color={"black"} />,
        }}
      />
        
      <Tabs.Screen
        name="createNews"
        options={{
          headerShown: false,
          tabBarIcon: ({ }) => <AntDesign size={28} name="pluscircle" color={"black"} />,
        }}
       
      />
      <Tabs.Screen
        name="myNews"
        options={{
          headerShown: false,
          tabBarIcon: ({ }) => <AntDesign size={28} name="user" color={"black"} />,
        }}
       
      />
    </Tabs>

    
    
  );
}
