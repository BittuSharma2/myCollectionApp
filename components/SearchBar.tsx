import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { Colors } from '../constants/theme'; // <-- Import your new theme

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search...',
}: SearchBarProps) {
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
      backgroundColor: themeColors.input, // Dynamic
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: Platform.OS === 'ios' ? 10 : 0, // Adjust padding for Android
      margin: 15,
      borderWidth: 1,
      borderColor: themeColors.borderColor, // Dynamic
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: themeColors.text, // Dynamic
      paddingVertical: 10, // Ensure consistent height
    },
  });
  // --- END NEW STYLES ---

  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color={themeColors.textSecondary} // Dynamic
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={themeColors.textSecondary} // Dynamic
      />
    </View>
  );
}