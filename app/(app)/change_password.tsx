import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ChangePasswordModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Helper to handle the logout and redirect logic safely
  const handleLogoutAndRedirect = async () => {
    try {
      // 1. Clear session
      await signOut();
    } catch (e) {
      console.log("Error signing out:", e);
    } finally {
      // 2. FORCE navigation to login page regardless of errors
      // using replace() so they can't go back
      router.replace('/login'); 
    }
  };

  const timeoutPromise = (ms: number) => {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), ms)
    );
  };

  const handleChangePassword = async () => {
    Keyboard.dismiss();

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result: any = await Promise.race([
        supabase.auth.updateUser({ password: newPassword }),
        timeoutPromise(5000)
      ]);

      const { error } = result;
      setLoading(false);

      if (error) {
        setTimeout(() => {
           Alert.alert('Error', error.message);
        }, 100);
      } else {
        // SUCCESS CASE
        setTimeout(() => {
          Alert.alert(
            'Success', 
            'Password updated successfully. Please log in again.', 
            [
              { 
                text: 'Go to Login', 
                onPress: handleLogoutAndRedirect 
              },
            ]
          );
        }, 100);
      }

    } catch (err: any) {
      setLoading(false);

      // TIMEOUT / STALE SESSION CASE
      if (err.message === "TIMEOUT" || err.message.includes("Session")) {
        setTimeout(() => {
          Alert.alert(
            'Security Update', 
            'Please log in again to refresh your secure session.',
            [
              { 
                text: 'Go to Login', 
                onPress: handleLogoutAndRedirect 
              }
            ]
          );
        }, 100);
      } else {
        setTimeout(() => {
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }, 100);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    form: {
      padding: 24,
      flex: 1,
    },
    label: {
      fontSize: 16,
      color: themeColors.text,
      marginBottom: 8,
      marginTop: 15,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.input,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
    },
    input: {
      flex: 1,
      padding: 15,
      fontSize: 16,
      color: themeColors.text,
    },
    eyeIcon: {
      padding: 15,
    },
    submitButton: {
      backgroundColor: themeColors.buttonPrimary,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 30,
    },
    submitButtonText: {
      color: themeColors.buttonPrimaryText,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingBottom: insets.bottom }]}>
      
      <View style={styles.form}>
        
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor={themeColors.textSecondary}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Pressable
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}>
            <Ionicons
              name={showNewPassword ? 'eye-off' : 'eye'}
              size={24}
              color={themeColors.textSecondary}
            />
          </Pressable>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={themeColors.textSecondary}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color={themeColors.textSecondary}
            />
          </Pressable>
        </View>

        <Pressable
          style={styles.submitButton}
          onPress={handleChangePassword}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={themeColors.buttonPrimaryText} />
          ) : (
            <Text style={styles.submitButtonText}>Update Password</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}