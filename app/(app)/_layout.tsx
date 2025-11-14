import { Stack } from 'expo-router';
import React from 'react';

// This layout file wraps all screens inside the (app) folder.
export default function AppLayout() {
  return (
    <Stack>
      {/* This screen points to your (tabs) folder.
        It is the ONLY screen that should be defined in this file.
        All other screens (like customer_profile, add_agent, etc.)
        are defined in your root app/_layout.tsx file, which is correct.
      */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}