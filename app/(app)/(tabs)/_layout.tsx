import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from '../../../constants/theme'; // <-- Import our new Colors
import { useAuth } from '../../../context/AuthContext';

export default function TabLayout() {
  const { profile, loading } = useAuth(); // Get profile
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Wait for profile to load before deciding which tabs to show
  if (loading || !profile) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: themeColors.background },
        ]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // --- NEW: Theme styles ---
        tabBarActiveTintColor: themeColors.tint,
        tabBarInactiveTintColor: themeColors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: themeColors.tabBar,
          borderTopColor: themeColors.borderColor,
        },
      }}>
      
      {/* --- THE FIX ---
          This is your 'customers.tsx' file.
          It is the main tab for BOTH roles.
      --- */}
      <Tabs.Screen
        name="customers" 
        options={{
          title: isAdmin ? 'Customers' : 'Home', // Dynamic title
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              // Dynamic icon
              name={
                isAdmin
                  ? focused ? 'people' : 'people-outline'
                  : focused ? 'home' : 'home-outline'
              }
              size={24}
              color={color}
            />
          ),
          // This tab is always shown, so href is not needed
        }}
      />
      
      {/* --- ADMIN: Agents Tab --- */}
      <Tabs.Screen
        name="agents" // This is app/(app)/(tabs)/agents.tsx
        options={{
          title: 'Agents',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'briefcase' : 'briefcase-outline'}
              size={24}
              color={color}
            />
          ),
          href: isAdmin ? '/(app)/(tabs)/agents' : null, // Only show for Admin
        }}
      />

      {/* --- AGENT: History Tab --- */}
      <Tabs.Screen
        name="history" // This is app/(app)/(tabs)/history.tsx
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={24}
              color={color}
            />
          ),
          href: isAdmin ? null : '/(app)/(tabs)/history', // Only show for Agent
        }}
      />

      {/* --- COMMON: Profile Tab --- */}
      <Tabs.Screen
        name="profile" // This is app/(app)/(tabs)/profile.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});