import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import 'react-native-reanimated';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../context/AuthContext';

import { Colors } from '../constants/theme';

export {
  ErrorBoundary
} from 'expo-router';

// We have REMOVED the 'unstable_settings' block

SplashScreen.preventAutoHideAsync();

const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    text: Colors.light.text,
    primary: Colors.light.tint,
    card: Colors.light.card,
    border: Colors.light.borderColor,
  },
};

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    text: Colors.dark.text,
    primary: Colors.dark.tint,
    card: Colors.dark.card,
    border: Colors.dark.borderColor,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider
        value={colorScheme === 'dark' ? AppDarkTheme : AppLightTheme}>
        <AuthProtectedLayout loaded={loaded} />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AuthProtectedLayout({ loaded }: { loaded: boolean }) {
  const { session, loading, profile } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading || !loaded) return;

    // --- (THE FIX) ---
    // Check if user is in the '(app)' group
    const inAuthGroup = segments[0] === '(app)';

    if (!session && inAuthGroup) {
      // User is not logged in and is trying to access app, send to login
      router.replace('/login' as any);
    } 
    else if (session && profile && !inAuthGroup) {
      // User is logged in but on the login page, send them into the app
      if (profile.role === 'admin') {
        router.replace('/(app)/(tabs)/customers' as any);
      } else {
        // This is the correct path for Agents (if you create home.tsx)
        // If you don't have home.tsx, change this to '/(app)/(tabs)/customers'
        router.replace('/(app)/(tabs)/customers' as any);
      }
    }
    // --- (END FIX) ---
  }, [session, loading, loaded, segments, profile]);

  if (loading || !loaded || (session && !profile)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // --- (THE FIX) ---
  // This Stack layout ONLY knows about (app) and login.
  // This is correct because (app) and login are its only children.
  return (
    <Stack>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}