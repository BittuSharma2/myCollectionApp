import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Import our auth logic

// Import Font loading and Splash Screen
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Export ErrorBoundary (good practice)
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Use the anchor setting you provided.
  anchor: '(app)',
};

// Prevent the splash screen from auto-hidden before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load fonts
  const [loaded, error] = useFonts({
    // FIX: Removed the 'SpaceMono' line that was causing the error
    ...FontAwesome.font, 
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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
      <AuthProtectedLayout loaded={loaded} />
    </AuthProvider>
  );
}

function AuthProtectedLayout({ loaded }: { loaded: boolean }) {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading || !loaded) return;

    // Cast segment to 'string' to bypass strict typed-route check.
    const onLoginPage = (segments[0] as string) === 'login';

    if (!session && !onLoginPage) {
      // User is not logged in and not on the login page,
      // redirect them to login.
      // Cast route to 'any' to bypass typed-route error.
      router.replace('/login' as any);
    } else if (session && (onLoginPage || (segments.length as number) === 0)) {
      // Cast segments.length to 'number' to bypass TS error.
      // This checks if user is logged in and on 'login' OR at the root '/'.
      // If so, redirect them into the main app.
      router.replace('/(app)/(tabs)/customers' as any);
    }
  }, [session, loading, loaded, segments]);

  // Show a loading spinner while checking auth or loading fonts
  if (loading || !loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If we are authenticated or on the login page, render the app
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        {/* Add the login screen to the navigator */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="customer_profile" options={{ headerShown: false }} />
        <Stack.Screen name="agent_profile" options={{ headerShown: false }} />

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}