import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // <-- Correct import
import React, { useState } from 'react';
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
import { Colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function AddAgentScreen() {
  const router = useRouter(); // <-- Correct hook
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // --- VALIDATION RULES (Moved Inside) ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\d{10}$/;
  const aadharRegex = /^\d{12}$/;
  const notEmptyRegex = /.+/;
  // ---

  // State from your working code
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // This is the "Agent Name"
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true); // For password eye

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (field: string, value: string): string | null => {
    let error: string | null = null;
    switch (field) {
      case 'username':
        if (!notEmptyRegex.test(value.trim())) error = 'Agent Name is required.';
        break;
      case 'email':
        if (!emailRegex.test(value)) error = 'Must be a valid email address.';
        break;
      case 'password':
        if (value.length < 6) error = 'Password must be at least 6 characters.';
        break;
      case 'mobileNo':
        if (!mobileRegex.test(value)) error = 'Must be exactly 10 digits.';
        break;
      case 'aadharNo':
        if (value && !aadharRegex.test(value)) error = 'Must be 12 digits or empty.';
        break;
      case 'address':
        if (!notEmptyRegex.test(value.trim())) error = 'Address is required.';
        break;
    }
    return error;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Your original, working handleSubmit function
  const handleSubmit = async () => {
    // 1. Run validation
    setTouched({
      username: true, email: true, password: true, mobileNo: true, aadharNo: true, address: true,
    });
    const newErrors = {
      username: validateField('username', username),
      email: validateField('email', email),
      password: validateField('password', password),
      mobileNo: validateField('mobileNo', mobileNo),
      aadharNo: validateField('aadharNo', aadharNo),
      address: validateField('address', address),
    };
    setErrors(newErrors);

    const isValid = Object.values(newErrors).every((e) => e === null);
    if (!isValid) {
      Alert.alert('Invalid Form', 'Please correct the errors shown in red.');
      return;
    }

    // 2. Call your Supabase Function
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: email.trim(),
        password: password,
        username: username.trim(),
        mobile_no: mobileNo,
        address: address.trim(),
        aadhar_card_no: aadharNo || null,
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.error) {
      Alert.alert('Error', data.error);
    } else {
      Alert.alert('Success', 'New agent created successfully.');
      router.back(); // Use router.back()
    }
  };

  const getValidationIcon = (field: string) => {
    if (!touched[field]) return null;
    if (errors[field]) {
      return (
        <Ionicons
          name="close-circle"
          size={24}
          color={themeColors.danger}
          style={styles.icon}
        />
      );
    }
    return (
      <Ionicons
        name="checkmark-circle"
        size={24}
        color="green"
        style={styles.icon}
      />
    );
  };
  
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.formBackground },
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
      backgroundColor: themeColors.header,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    backButton: { padding: 10, marginLeft: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: themeColors.text },
    formContainer: { padding: 20 },
    inputContainer: {
      backgroundColor: themeColors.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    input: {
      flex: 1,
      padding: 15,
      fontSize: 16,
      color: themeColors.text,
    },
    icon: {
      paddingHorizontal: 10,
    },
    errorText: {
      color: themeColors.danger,
      fontSize: 12,
      marginLeft: 10,
      marginBottom: 10,
    },
    label: {
      fontSize: 14,
      color: themeColors.textSecondary,
      marginBottom: 5,
      marginLeft: 5,
      marginTop: 10,
    },
    button: { borderRadius: 10, paddingVertical: 15, elevation: 2, alignItems: 'center' },
    submitButton: { backgroundColor: themeColors.buttonPrimary, marginTop: 10 },
    submitButtonText: { fontSize: 16, fontWeight: 'bold', color: themeColors.buttonPrimaryText },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={[styles.customHeader, { paddingTop: insets.top }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Add New Agent</Text>
        </View>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.label}>Agent Name (Username)</Text>
          <View style={[styles.inputContainer, errors.username && touched.username && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="Enter agent's full name" placeholderTextColor={themeColors.textSecondary} value={username} onChangeText={setUsername} onBlur={() => handleBlur('username', username)} autoCapitalize="words"/>
            {getValidationIcon('username')}
          </View>
          {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          
          <Text style={styles.label}>Email (Used for Login)</Text>
          <View style={[styles.inputContainer, errors.email && touched.email && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="Enter agent's email" placeholderTextColor={themeColors.textSecondary} value={email} onChangeText={(text) => setEmail(text.toLowerCase())} onBlur={() => handleBlur('email', email)} autoCapitalize="none" keyboardType="email-address"/>
            {getValidationIcon('email')}
          </View>
          {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputContainer, errors.password && touched.password && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="Min. 6 characters" placeholderTextColor={themeColors.textSecondary} value={password} onChangeText={setPassword} onBlur={() => handleBlur('password', password)} secureTextEntry={secureTextEntry}/>
            <Pressable onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.icon}>
              <Ionicons name={secureTextEntry ? 'eye-off' : 'eye'} size={24} color={themeColors.textSecondary}/>
            </Pressable> 
            {getValidationIcon('password')}
          </View>
          {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <Text style={styles.label}>Mobile Number</Text>
          <View style={[styles.inputContainer, errors.mobileNo && touched.mobileNo && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="10 digits" placeholderTextColor={themeColors.textSecondary} value={mobileNo} onChangeText={setMobileNo} onBlur={() => handleBlur('mobileNo', mobileNo)} keyboardType="numeric" maxLength={10}/>
            {getValidationIcon('mobileNo')}
          </View>
          {touched.mobileNo && errors.mobileNo && <Text style={styles.errorText}>{errors.mobileNo}</Text>}

          <Text style={styles.label}>Address</Text>
          <View style={[styles.inputContainer, errors.address && touched.address && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="Enter full address" placeholderTextColor={themeColors.textSecondary} value={address} onChangeText={setAddress} onBlur={() => handleBlur('address', address)} autoCapitalize="words"/>
            {getValidationIcon('address')}
          </View>
          {touched.address && errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          
          <Text style={styles.label}>Aadhar Card Number (Optional)</Text>
          <View style={[styles.inputContainer, errors.aadharNo && touched.aadharNo && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="12 digits" placeholderTextColor={themeColors.textSecondary} value={aadharNo} onChangeText={setAadharNo} onBlur={() => handleBlur('aadharNo', aadharNo)} keyboardType="numeric" maxLength={12}/>
            {getValidationIcon('aadharNo')}
          </View>
          {touched.aadharNo && errors.aadharNo && <Text style={styles.errorText}>{errors.aadharNo}</Text>}
          
          <View style={{ height: 20 }} />

          <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={loading}>
            {loading ? (<ActivityIndicator color={themeColors.buttonPrimaryText} />) : (<Text style={styles.submitButtonText}>CREATE AGENT</Text>)}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}