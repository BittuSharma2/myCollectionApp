import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert, // <-- Import for theme
  KeyboardAvoidingView, // <-- Import for keyboard
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme, // <-- Import for theme
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme'; // <-- Import your new theme
import { supabase } from '../../lib/supabase';

export default function AddAgentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  // (All state is unchanged)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [loading, setLoading] = useState(false);

  // (handleSubmit function is unchanged)
  const handleSubmit = async () => {
    if (!email || !password || !username || !mobileNo || !address) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: email,
        password: password,
        username: username,
        mobile_no: mobileNo,
        address: address,
        aadhar_card_no: aadharNo || null,
      },
    });

    setLoading(false);

    if (error) {
      console.error('Function error:', error.message);
      Alert.alert('Error', error.message);
    } else if (data.error) {
      console.error('Function-returned error:', data.error);
      Alert.alert('Error', data.error);
    } else {
      Alert.alert('Success', 'New agent created successfully.');
      router.back();
    }
  };

  // --- NEW: Dynamic styles ---
  // We move styles inside the component to access themeColors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.formBackground, // Dynamic
    },
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
      backgroundColor: themeColors.header, // Dynamic
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor, // Dynamic
    },
    backButton: {
      padding: 10,
      marginLeft: 5,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 10,
      color: themeColors.text, // Dynamic
    },
    formContainer: {
      padding: 20,
    },
    input: {
      backgroundColor: themeColors.background, // Dynamic
      padding: 15,
      fontSize: 16,
      marginBottom: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor, // Dynamic
      color: themeColors.text, // Dynamic
    },
    button: {
      borderRadius: 10,
      paddingVertical: 15,
      elevation: 2,
      alignItems: 'center',
    },
    submitButton: {
      backgroundColor: themeColors.buttonPrimary, // Dynamic
      marginTop: 10,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.buttonPrimaryText, // Dynamic
    },
  });
  // --- END NEW STYLES ---

  return (
    // --- NEW: KeyboardAvoidingView wrapper ---
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* --- Custom Header --- */}
        <View style={[styles.customHeader, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={themeColors.text} // Dynamic
            />
          </Pressable>
          <Text style={styles.headerTitle}>Add New Agent</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Agent Name (Username)"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
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
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={mobileNo}
            onChangeText={setMobileNo}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Aadhar Card No (Optional)"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={aadharNo}
            onChangeText={setAadharNo}
            keyboardType="numeric"
          />

          <Pressable
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={themeColors.buttonPrimaryText} /> // Dynamic
            ) : (
              <Text style={styles.submitButtonText}>CREATE AGENT</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}