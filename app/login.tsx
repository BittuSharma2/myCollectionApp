import { Ionicons } from '@expo/vector-icons'; // Using icons for the button
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

// Basic styles to match your design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3A4A64', // Dark blue/grey area
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#78D1E8', // Light blue area
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A00E0', // Purple
  },
  body: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 26,
    color: 'white',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  signInText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: '#34A853', // Green color
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    alignSelf: 'flex-end',
  },
});

export default function LoginScreen() {
  // We'll use email for "Login ID" as Supabase auth prefers it
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    // Use Supabase to sign in
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    // If successful, the AuthContext's onAuthStateChange
    // will automatically pick it up, and our app will redirect.
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header from your design */}
      <View style={styles.header}>
        {/* You can add the logo images here if you have them in /assets */}
        <Text style={styles.headerTitle}>YASHVI COLLECTION</Text>
      </View>

      {/* Body with login form */}
      <View style={styles.body}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <TextInput
          style={styles.input}
          placeholder="Login ID (Email)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.signInText}>Sign in</Text>
        <Pressable
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Ionicons name="arrow-forward" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}