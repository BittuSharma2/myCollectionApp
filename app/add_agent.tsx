import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function AddAgentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State for all the fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [loading, setLoading] = useState(false);

  // This is the function we call from the 'create-user' Edge Function
  const handleSubmit = async () => {
    if (!email || !password || !username || !mobileNo || !address) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);

    // Call our Edge Function
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
      router.back(); // Go back to the agent list
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* --- Custom Header --- */}
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Agent</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Agent Name (Username)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobileNo}
          onChangeText={setMobileNo}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Aadhar Card No (Optional)"
          value={aadharNo}
          onChangeText={setAadharNo}
          keyboardType="numeric"
        />

        <Pressable
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>CREATE AGENT</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- NEW Styles for a full page ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 10,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    elevation: 2,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4A00E0',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});