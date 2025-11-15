import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';

export default function TabLayout() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themeColors.header,
          borderTopColor: themeColors.borderColor,
        },
        headerShown: false,
      }}>
      
      {/* 1. SHARED: Customer List */}
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={26} color={color} />,
        }}
      />
      
      {/* 2. ADMIN: Agent Management */}
      <Tabs.Screen
        name="agents"
        options={{
          title: 'Agents',
          tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={26} color={color} />,
          // @ts-ignore - This is the correct fix for the Expo Router type bug.
          href: isAdmin ? 'agents' : null,
        }}
      />
      
      {/* 3. ADMIN: Collection History */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Collections', // Renamed for clarity
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={26} color={color} />,
          // @ts-ignore
          href: isAdmin ? 'history' : null,
        }}
      />
      
      {/* --- NEW TAB FOR ADMIN --- */}
      <Tabs.Screen
        name="debit_history"
        options={{
          title: 'Debits',
          tabBarIcon: ({ color }) => (
            <Ionicons name="remove-circle" size={26} color={color} />
          ),
          // @ts-ignore
          href: isAdmin ? 'debit_history' : null,
        }}
      />
      
      {/* 4. AGENT: My Collections */}
      <Tabs.Screen
        name="my_collections"
        options={{
          title: 'History', // Agent just sees "History"
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={26} color={color} />,
          // @ts-ignore
          href: isAdmin ? null : 'my_collections',
        }}
      />
      
      {/* 5. SHARED: Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
      
    </Tabs>
  );
}