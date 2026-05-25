import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarActiveTintColor: '#ac5d21', tabBarInactiveTintColor: '#3B4A3F',
      tabBarStyle: { backgroundColor: '#e4e2e1', borderTopWidth: 2, height: 60 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 10 },
    }}>


      <Tabs.Screen
        name="home"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />


      <Tabs.Screen
        name="cardapio"
        options={{
          title: 'CARDÁPIO',
          tabBarIcon: ({ color, size }) => <Feather name="menu" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reserva"
        options={{
          title: 'RESERVA',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />

    </Tabs>
  );
}