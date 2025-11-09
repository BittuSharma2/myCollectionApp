import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

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
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#888" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Light grey background
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});