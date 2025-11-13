import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export default function TabLayout() {
  const { profile, loading } = useAuth();
  const colorScheme = useColorScheme();
  const activeColor = useThemeColor({ light: undefined, dark: undefined }, 'tint');

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
      }}>
      
      {/* This is now the 'customers.tsx' file.
        Title is "Customers" for Admins, "Home" for Agents
      */}
      <Tabs.Screen
        name="customers"  // <-- CHANGED
        options={{
          title: isAdmin ? 'Customers' : 'Home', // <-- CHANGED
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name={isAdmin ? "briefcase-outline" : "home-outline"} size={28} color={color} />
          ),
        }}
      />

      {/* This is the 'history.tsx' file.
        It is hidden for Admins.
      */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={28} color={color} />,
          href: isAdmin ? null : '/(app)/(tabs)/history',
        }}
      />

      {/* This is now the 'agents.tsx' file.
        Title is "Agents". Hidden for non-Admins.
      */}
      <Tabs.Screen
        name="agents" // <-- CHANGED
        options={{
          title: 'Agents', // <-- CHANGED
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={28} color={color} />,
          href: isAdmin ? '/(app)/(tabs)/agents' : null,
        }}
      />
    </Tabs>
  );
}