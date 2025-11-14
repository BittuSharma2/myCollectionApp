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

// --- (NEW) Import our custom Colors ---
import { Colors } from '../constants/theme';

// Export ErrorBoundary (good practice)
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // This tells Expo Router that all screens inside (app) are part of
  // a separate navigation stack. This is critical.
  initialRouteName: '(app)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// --- (NEW) Create our custom themes ---
// We merge React Navigation's defaults with our custom colors
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
// --- (END NEW) ---

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // --- (NEW) Get the system color scheme ---
  const colorScheme = useColorScheme();
  // --- (END NEW) ---

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

  // Wrap the entire app in the AuthProvider
  return (
    <AuthProvider>
      {/* --- (NEW) Use our custom themes --- */}
      <ThemeProvider
        value={colorScheme === 'dark' ? AppDarkTheme : AppLightTheme}>
        <AuthProtectedLayout loaded={loaded} />
        {/* StatusBar 'auto' will now correctly use light/dark */}
        <StatusBar style="auto" />
      </ThemeProvider>
      { /* --- (END NEW) --- */}
    </AuthProvider>
  );
}

function AuthProtectedLayout({ loaded }: { loaded: boolean }) {
  // --- (THE FIX) ---
  // 1. Get the 'profile' from useAuth()
  const { session, loading, profile } = useAuth();
  // --- (END FIX) ---
  
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait until auth is checked, fonts are loaded, AND profile is loaded
    if (loading || !loaded) return;

    const onLoginPage = (segments[0] as string) === 'login';

    if (!session && !onLoginPage) {
      // User is not logged in and not on the login page, redirect to login
      router.replace('/login' as any);
    } 
    // --- (THE FIX) ---
    // 2. Check for session AND profile
    else if (session && profile && (onLoginPage || (segments.length as number) === 0)) {
      // 3. Redirect based on role
      if (profile.role === 'admin') {
        router.replace('/(app)/(tabs)/customers' as any);
      } else {
        router.replace('/(app)/(tabs)/customers' as any);
      }
    }
    // --- (END FIX) ---
  }, [session, loading, loaded, segments, profile]); // <-- 4. Add 'profile' to dependency array

  if (loading || !loaded || (session && !profile)) {
    // Show a loading spinner
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // --- (THE FIX) ---
  // This Stack layout matches your file structure, which will
  // fix your navigation errors.
  return (
    <Stack>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      
      {/* These screens are at the root, so they are defined here */}
      <Stack.Screen name="customer_profile" options={{ headerShown: false }} />
      <Stack.Screen name="agent_profile" options={{ headerShown: false }} />
      <Stack.Screen name="add_customer" options={{ headerShown: false }} />
      <Stack.Screen name="add_agent" options={{ headerShown: false }} /> 
      <Stack.Screen name="edit_agent" options={{ headerShown: false }} />
      <Stack.Screen name="edit_customer" options={{ headerShown: false }} />
      
      {/* Modal is also here, and we apply the theme to its header */}
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: 'modal', 
          title: 'Change Password' 
        }} 
      />
    </Stack>
  );
}