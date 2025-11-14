import { Stack } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

// This is the main navigator for your authenticated app.
// It matches your new file structure perfectly.
export default function AppStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <Stack>
      {/* This is your main Tab layout */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* These are all the other screens INSIDE app/(app)/ */}
      <Stack.Screen name="agent_profile" options={{ headerShown: false }} />
      <Stack.Screen name="customer_profile" options={{ headerShown: false }} />
      <Stack.Screen name="add_customer" options={{ headerShown: false }} />
      <Stack.Screen name="add_agent" options={{ headerShown: false }} />
      <Stack.Screen name="edit_agent" options={{ headerShown: false }} />
      <Stack.Screen name="edit_customer" options={{ headerShown: false }} />
      
      {/* This is your "Change Password" modal */}
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Change Password',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: themeColors.header },
          headerTitleStyle: { color: themeColors.text },
          headerTintColor: themeColors.text, // For the back arrow on iOS
        }} 
      />
    </Stack>
  );
}