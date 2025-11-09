import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext'; // Go up 3 levels

// --- FIXES ---
import { useColorScheme } from '@/hooks/use-color-scheme'; // This hook is correct
import { useThemeColor } from '@/hooks/use-theme-color'; // Import your project's theme hook
// --- END FIXES ---

export default function TabLayout() {
  const { profile, loading } = useAuth(); // Get user's profile
  const colorScheme = useColorScheme();

  // --- FIX ---
  // Get the active tint color using your project's hook
  const activeColor = useThemeColor({ light: undefined, dark: undefined }, 'tint');
  // --- END FIX ---

  // Show a loading spinner while the profile is being fetched
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Decide which tabs to show
  const isAdmin = profile?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
      }}>
      
      {/* This is the User's Tab 1 (Home)
        It's also the Admin's Tab 2 (Accounts)
      */}
      <Tabs.Screen
        name="home" // This points to app/(app)/(tabs)/home.tsx
        options={{
          title: isAdmin ? 'Accounts' : 'Home', // Dynamic title
          headerShown: false, // We will add a custom header inside the screen
          tabBarIcon: ({ color }) => (
            <Ionicons name={isAdmin ? "briefcase-outline" : "home-outline"} size={28} color={color} />
          ),
        }}
      />

      {/* This is the User's Tab 2 (History)
        We hide it for Admins by setting href={null}
      */}
      <Tabs.Screen
        name="history" // This will point to history.tsx (we'll create it)
        options={{
          title: 'History',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={28} color={color} />,
          // This line HIDES the tab if the user is an admin
          href: isAdmin ? null : '/(app)/(tabs)/history',
        }}
      />

      {/* This is the Admin's Tab 1 (Users)
        We hide it for Users by setting href={null}
      */}
      <Tabs.Screen
        name="users" // This will point to users.tsx (we'll create it)
        options={{
          title: 'Users',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={28} color={color} />,
          // This line HIDES the tab if the user is NOT an admin
          href: isAdmin ? '/(app)/(tabs)/users' : null,
        }}
      />
    </Tabs>
  );
}