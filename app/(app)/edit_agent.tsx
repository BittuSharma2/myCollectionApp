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
import { Colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function EditAgentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { agentId } = useLocalSearchParams<{ agentId: string }>();

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // --- VALIDATION RULES (Moved Inside) ---
  const mobileRegex = /^\d{10}$/;
  const aadharRegex = /^\d{12}$/;
  const notEmptyRegex = /.+/;
  // ---

  // State for fields
  const [username, setUsername] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  
  // --- UPDATED: Password State ---
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  // --- NEW: State for the second eye icon ---
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  
  // State for loading
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // State for validation
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // 1. Fetch the agent's current data
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
        setUsername(data.username);
        setMobileNo(data.mobile_no || '');
        setAddress(data.address || '');
        setAadharNo(data.aadhar_card_no || '');
      }
      setLoadingData(false);
    };
    
    fetchAgentData();
  }, [agentId]);

  // --- UPDATED: Validation Function ---
  const validateField = (
    field: string,
    value: string
  ): string | null => {
    let error: string | null = null;
    switch (field) {
      case 'username':
        if (!notEmptyRegex.test(value.trim())) error = 'Name is required.';
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
      case 'password':
        if (value && value.length < 6) error = 'Must be at least 6 characters.';
        break;
      case 'confirmPassword':
        if (password && value !== password) error = 'Passwords do not match.';
        break;
    }
    return error;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // 2. Save the updated data
  const handleSubmit = async () => {
    setTouched({
      username: true, mobileNo: true, address: true, aadharNo: true,
      password: true, confirmPassword: true,
    });

    const newErrors = {
      username: validateField('username', username),
      mobileNo: validateField('mobileNo', mobileNo),
      address: validateField('address', address),
      aadharNo: validateField('aadharNo', aadharNo),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };
    setErrors(newErrors);
    
    const isValid = Object.values(newErrors).every((e) => e === null);
    if (!isValid) {
      Alert.alert('Invalid Form', 'Please correct the errors shown in red.');
      return;
    }
    
    setLoading(true);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        mobile_no: mobileNo,
        address: address.trim(),
        aadhar_card_no: aadharNo || null,
      })
      .eq('id', agentId);

    if (profileError) {
      setLoading(false);
      Alert.alert('Error', 'Failed to update agent profile.');
      return;
    }

    if (password) {
      const { data, error: passwordError } = await supabase.functions.invoke(
        'update-agent-password',
        {
          body: { userId: agentId, newPassword: password },
        }
      );

      if (passwordError || data.error) {
        setLoading(false);
        Alert.alert('Error', `Profile was saved, but password failed to update: ${passwordError?.message || data.error}`);
        return;
      }
    }

    setLoading(false);
    Alert.alert('Success', 'Agent details saved successfully.');
    router.back();
  };

  const getValidationIcon = (field: string) => {
    if (!touched[field]) {
      const value = (field === 'username') ? username :
                    (field === 'mobileNo') ? mobileNo :
                    (field === 'aadharNo') ? aadharNo :
                    (field === 'address') ? address : '';
      if (validateField(field, value) === null) {
        return <Ionicons name="checkmark-circle" size={24} color="green" style={styles.icon} />;
      }
      return null;
    }
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
    if (touched[field]) {
      return (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color="green"
          style={styles.icon}
        />
      );
    }
    return null;
  };

  // --- Dynamic styles ---
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.formBackground,
    },
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
      backgroundColor: themeColors.header,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    backButton: {
      padding: 10,
      marginLeft: 5,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 10,
      color: themeColors.text,
    },
    formContainer: {
      padding: 20,
    },
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
    note: {
      fontSize: 12,
      color: themeColors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    button: {
      borderRadius: 10,
      paddingVertical: 15,
      elevation: 2,
      alignItems: 'center',
    },
    submitButton: {
      backgroundColor: themeColors.buttonPrimary,
      marginTop: 10,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.buttonPrimaryText,
    },
  });

  return (
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
              color={themeColors.text}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Agent</Text>
        </View>

        {loadingData ? (
          <ActivityIndicator
            size="large"
            style={{ marginTop: 50 }}
            color={themeColors.tint}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.label}>Agent Name (Username)</Text>
            <View style={[styles.inputContainer, errors.username && touched.username && { borderColor: themeColors.danger }]}>
              <TextInput
                style={styles.input}
                placeholder="Agent Name (Username)"
                placeholderTextColor={themeColors.textSecondary}
                value={username}
                onChangeText={setUsername}
                onBlur={() => handleBlur('username', username)}
                autoCapitalize="words"
              />
              {getValidationIcon('username')}
            </View>
            {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputContainer, errors.mobileNo && touched.mobileNo && { borderColor: themeColors.danger }]}>
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor={themeColors.textSecondary}
                value={mobileNo}
                onChangeText={setMobileNo}
                onBlur={() => handleBlur('mobileNo', mobileNo)}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {getValidationIcon('mobileNo')}
            </View>
            {touched.mobileNo && errors.mobileNo && <Text style={styles.errorText}>{errors.mobileNo}</Text>}

            <Text style={styles.label}>Address</Text>
            <View style={[styles.inputContainer, errors.address && touched.address && { borderColor: themeColors.danger }]}>
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor={themeColors.textSecondary}
                value={address}
                onChangeText={setAddress}
                onBlur={() => handleBlur('address', address)}
              />
              {getValidationIcon('address')}
            </View>
            {touched.address && errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

            <Text style={styles.label}>Aadhar Card No (Optional)</Text>
            <View style={[styles.inputContainer, errors.aadharNo && touched.aadharNo && { borderColor: themeColors.danger }]}>
              <TextInput
                style={styles.input}
                placeholder="Aadhar Card No (Optional)"
                placeholderTextColor={themeColors.textSecondary}
                value={aadharNo}
                onChangeText={setAadharNo}
                onBlur={() => handleBlur('aadharNo', aadharNo)}
                keyboardType="numeric"
                maxLength={12}
              />
              {getValidationIcon('aadharNo')}
            </View>
            {touched.aadharNo && errors.aadharNo && <Text style={styles.errorText}>{errors.aadharNo}</Text>}
            
            <Text style={styles.note}>
              Email cannot be changed. Set a new password below (optional).
            </Text>

            <Text style={styles.label}>New Password (Optional)</Text>
            <View style={[styles.inputContainer, errors.password && touched.password && { borderColor: themeColors.danger }]}>
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                placeholderTextColor={themeColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                onBlur={() => handleBlur('password', password)}
                secureTextEntry={secureTextEntry}
              />
              <Pressable onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.icon}>
                <Ionicons
                  name={secureTextEntry ? 'eye-off' : 'eye'}
                  size={24}
                  color={themeColors.textSecondary}
                />
              </Pressable> 
              {getValidationIcon('password')}
            </View>
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && touched.confirmPassword && { borderColor: themeColors.danger }]}>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={themeColors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                secureTextEntry={secureConfirmTextEntry} // <-- USE NEW STATE
              />
              {/* --- NEW PRESSABLE --- */}
              <Pressable onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)} style={styles.icon}>
                <Ionicons
                  name={secureConfirmTextEntry ? 'eye-off' : 'eye'}
                  size={24}
                  color={themeColors.textSecondary}
                />
              </Pressable>
              {getValidationIcon('confirmPassword')}
            </View>
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            {/* --- END OF UPDATES --- */}

            <Pressable
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={themeColors.buttonPrimaryText} />
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