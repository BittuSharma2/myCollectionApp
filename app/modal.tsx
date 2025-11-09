import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function ChangePasswordModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    // Supabase function to update the logged-in user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      console.error('Error updating password:', error.message);
      Alert.alert('Error', 'Failed to update password.');
    } else {
      Alert.alert(
        'Success',
        'Your password has been updated.',
        [{ text: 'OK', onPress: () => router.back() }] // Go back after success
      );
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* --- Custom Header for the Modal --- */}
      <Stack.Screen options={{ presentation: 'modal', title: 'Change Password', headerTitleAlign: 'center' }} />
      <View style={styles.header}>
        <Text style={styles.title}>Change Password</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={30} color="#333" />
        </Pressable>
      </View>

      {/* --- Form --- */}
      <View style={styles.form}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable
          style={styles.submitButton}
          onPress={handleChangePassword}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Update Password</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#4A00E0', // Purple
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});