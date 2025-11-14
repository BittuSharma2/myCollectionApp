import React from 'react';
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme'; // <-- Import your new theme

type CustomHeaderProps = {
  title: string;
};

export default function CustomHeader({ title }: CustomHeaderProps) {
  const insets = useSafeAreaInsets(); // Gets safe area (notch) height

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  // --- NEW: Dynamic styles ---
  // We move styles inside the component to access themeColors
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', // Center the title
      paddingHorizontal: 15,
      paddingBottom: 15, // A bit more padding
      paddingTop: insets.top + 10, // Use safe area padding
      backgroundColor: themeColors.header, // Dynamic
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor, // Dynamic
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.text, // Dynamic
    },
  });
  // --- END NEW STYLES ---

  return (
    <View style={styles.container}>
      {/* The menu button has been removed, as the drawer was removed.
      */}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}