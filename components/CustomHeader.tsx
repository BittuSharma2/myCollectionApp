import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomHeader({ title }: { title: string }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // Gets safe area (notch) height

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <Pressable onPress={openDrawer} style={styles.iconButton}>
        <Ionicons name="menu" size={30} color="#333" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: 'white', // Or your theme's header color
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
});