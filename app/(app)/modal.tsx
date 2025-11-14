import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { supabase } from '../../lib/supabase';

export default function ChangePasswordModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

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
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to update password.');
    } else {
      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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
    input: {
      backgroundColor: themeColors.input,
      padding: 15,
      borderRadius: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      color: themeColors.text,
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
      {/* The Stack.Screen in app/_layout.tsx now handles the header,
        so we don't need a custom one here.
      */}

      <View style={styles.form}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          placeholderTextColor={themeColors.textSecondary}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          placeholderTextColor={themeColors.textSecondary}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

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