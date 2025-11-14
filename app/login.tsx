import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert, // Kept for your future logo
  KeyboardAvoidingView, // <-- For keyboard
  Platform,
  Pressable, // <-- For keyboard
  ScrollView,
  StyleSheet,
  Text,
  TextInput, // <-- For keyboard
  useColorScheme,
  View
} from 'react-native';
import { Colors } from '../constants/theme'; // <-- Import your theme
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- UI enhancement

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    // If successful, AuthContext will handle the redirect
    setLoading(false);
  };

  // --- NEW: Dynamic styles ---
  // We create styles inside the component to access themeColors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background, // Dynamic
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.text, // Dynamic
      marginBottom: 30,
    },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.input, // Dynamic
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: themeColors.borderColor, // Dynamic
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: themeColors.text, // Dynamic
    },
    button: {
      width: '100%',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    signInButton: {
      backgroundColor: themeColors.buttonPrimary, // Dynamic
    },
    signInButtonText: {
      color: themeColors.buttonPrimaryText, // Dynamic
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  // ---

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* I have commented out the Image to prevent the build error.
            You can add your logo here later. */}
        {/*
        <Image
          source={require('../assets/images/login-icon.png')}
          style={styles.logo}
        />
        */}
        <View style={{ height: 140 }} />

        <Text style={styles.title}>Yashvi Collection</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={themeColors.textSecondary} // Dynamic
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={themeColors.textSecondary} // Dynamic
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={themeColors.textSecondary} // Dynamic
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={themeColors.textSecondary} // Dynamic
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={themeColors.textSecondary} // Dynamic
              />
            </Pressable>
          </View>

          <Pressable
            style={[styles.button, styles.signInButton]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={themeColors.buttonPrimaryText} />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}