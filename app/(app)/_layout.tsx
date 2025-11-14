import { Stack } from 'expo-router';
import React from 'react';

// This layout file wraps all screens inside the (app) folder.
// We are replacing the Drawer with a simple Stack navigator.
export default function AppLayout() {
  return (
    <Stack>
      {/* This screen points to our (tabs) folder */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false, // The (tabs) layout will handle its own header
        }}
      />
    </Stack>
  );
}