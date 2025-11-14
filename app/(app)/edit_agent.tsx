import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme'; // <-- Import your new theme
import { supabase } from '../../lib/supabase';

export default function EditAgentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Get the agentId passed from the profile page
  const { agentId } = useLocalSearchParams<{ agentId: string }>();

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  // (State is unchanged)
  const [username, setUsername] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // 1. Fetch the agent's current data (unchanged)
  useEffect(() => {
    if (!agentId) return;
    
    const fetchAgentData = async () => {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, mobile_no, address, aadhar_card_no')
        .eq('id', agentId)
        .single();
        
      if (error) {
        Alert.alert('Error', 'Failed to load agent data.');
      } else {
        // Pre-fill the form
        setUsername(data.username);
        setMobileNo(data.mobile_no || '');
        setAddress(data.address || '');
        setAadharNo(data.aadhar_card_no || '');
      }
      setLoadingData(false);
    };
    
    fetchAgentData();
  }, [agentId]);

  // 2. Save the updated data (unchanged)
  const handleSubmit = async () => {
    if (!username || !mobileNo || !address) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        username: username,
        mobile_no: mobileNo,
        address: address,
        aadhar_card_no: aadharNo || null,
      })
      .eq('id', agentId); // The WHERE clause

    setLoading(false);

    if (error) {
      console.error('Error updating agent:', error.message);
      Alert.alert('Error', 'Failed to update agent.');
    } else {
      Alert.alert('Success', 'Agent details saved.');
      router.back(); // Go back to the profile
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
    note: {
      fontSize: 12,
      color: themeColors.textSecondary, // Dynamic
      textAlign: 'center',
      marginBottom: 20,
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
          <Text style={styles.headerTitle}>Edit Agent</Text>
        </View>

        {loadingData ? (
          <ActivityIndicator
            size="large"
            style={{ marginTop: 50 }}
            color={themeColors.tint} // Dynamic
          />
        ) : (
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
            <Text style={styles.note}>
              Email and password cannot be changed from this screen.
            </Text>

            <Pressable
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={themeColors.buttonPrimaryText} /> // Dynamic
              ) : (
                <Text style={styles.submitButtonText}>SAVE CHANGES</Text>
              )}
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}