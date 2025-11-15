import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router'; // <-- THE FIX
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
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

type Agent = {
  id: string;
  username: string;
};

export default function AddCustomerScreen() {
  const router = useRouter(); // <-- THE FIX
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // --- VALIDATION RULES (Moved Inside) ---
  const mobileRegex = /^\d{10}$/;
  const aadharRegex = /^\d{12}$/;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const numberRegex = /^\d*\.?\d*$/;
  const notEmptyRegex = /.+/;
  // ---

  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [address, setAddress] = useState('');
  const [initialAmount, setInitialAmount] = useState('0');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchAgents = async () => {
      if (profile?.role !== 'admin') return;
      // This query will fail until we fix RLS in Step 2
      const { data, error } = await supabase.from('profiles').select('id, username').eq('role', 'user');
      if (error) { 
        Alert.alert('Error', 'Failed to fetch agent list. Please check database permissions.'); 
      }
      else { setAgents(data || []); }
    };
    fetchAgents();
  }, [profile]);
  
  const validateField = (field: string, value: string): string | null => {
    let error: string | null = null;
    switch (field) {
      case 'name':
        if (!notEmptyRegex.test(value.trim())) error = 'Name is required.';
        break;
      case 'shopName':
        if (!notEmptyRegex.test(value.trim())) error = 'Shop name is required.';
        break;
      case 'mobileNo':
        if (!mobileRegex.test(value)) error = 'Must be exactly 10 digits.';
        break;
      case 'aadharNo':
        if (!aadharRegex.test(value)) error = 'Must be exactly 12 digits.';
        break;
      case 'panNo':
        if (!panRegex.test(value.toUpperCase())) error = 'Invalid format (AAAAA1111A).';
        break;
      case 'address':
        if (!notEmptyRegex.test(value.trim())) error = 'Address is required.';
        break;
      case 'initialAmount':
        if (!numberRegex.test(value)) error = 'Must be a valid number.';
        else if (parseFloat(value) < 0) error = 'Cannot be negative.';
        break;
    }
    return error;
  };
  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };
  const handleSubmit = async () => {
    setTouched({
      name: true, shopName: true, mobileNo: true, aadharNo: true,
      panNo: true, address: true, initialAmount: true,
    });
    const newErrors = {
      name: validateField('name', name),
      shopName: validateField('shopName', shopName),
      mobileNo: validateField('mobileNo', mobileNo),
      aadharNo: validateField('aadharNo', aadharNo),
      panNo: validateField('panNo', panNo),
      address: validateField('address', address),
      initialAmount: validateField('initialAmount', initialAmount),
    };
    setErrors(newErrors);
    const isValid = Object.values(newErrors).every((e) => e === null);
    if (!isValid) {
      Alert.alert('Invalid Form', 'Please correct the errors shown in red.');
      return;
    }
    setLoading(true);
    const parsedAmount = parseFloat(initialAmount);
    const { error } = await supabase.from('customers').insert({
      name: name.trim(),
      shop_name: shopName.trim(),
      mobile_no: mobileNo,
      aadhar_card_no: aadharNo,
      pan_card_no: panNo.toUpperCase(),
      address: address.trim(),
      initial_amount: parsedAmount,
      agent_id: selectedAgent,
      created_by: profile.id,
    });
    setLoading(false);
    if (error) {
      if (error.code === '23505') {
        Alert.alert('Error', 'A customer with this name already exists.');
      } else {
        Alert.alert('Error', 'Failed to create customer. (Check RLS)');
      }
    } else {
      Alert.alert('Success', 'Customer created successfully.');
      router.back(); // <-- THE FIX
    }
  };
  const getValidationIcon = (field: string, value: string) => {
    if (!touched[field] && !value) return null;
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
    if (touched[field] || (value && validateField(field, value) === null)) {
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
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.formBackground },
    customHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 10, backgroundColor: themeColors.header, borderBottomWidth: 1, borderBottomColor: themeColors.borderColor, },
    backButton: { padding: 10, marginLeft: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: themeColors.text },
    formContainer: { padding: 20 },
    inputContainer: { backgroundColor: themeColors.background, borderRadius: 10, borderWidth: 1, borderColor: themeColors.borderColor, flexDirection: 'row', alignItems: 'center', marginBottom: 4, },
    input: { flex: 1, padding: 15, fontSize: 16, color: themeColors.text, },
    icon: { paddingHorizontal: 10, },
    errorText: { color: themeColors.danger, fontSize: 12, marginLeft: 10, marginBottom: 10, },
    label: { fontSize: 14, color: themeColors.textSecondary, marginBottom: 5, marginLeft: 5, marginTop: 10, },
    pickerContainer: { backgroundColor: themeColors.background, borderRadius: 10, borderWidth: 1, borderColor: themeColors.borderColor, marginBottom: 20, justifyContent: 'center', },
    picker: { width: '100%', height: 60, color: themeColors.text },
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
            <Ionicons
              name="arrow-back"
              size={24}
              color={themeColors.text}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Add New Customer</Text>
        </View>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.label}>Customer Name (Unique)</Text>
          <View style={[styles.inputContainer, errors.name && touched.name && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="Enter customer name" placeholderTextColor={themeColors.textSecondary} value={name} onChangeText={setName} onBlur={() => handleBlur('name', name)} autoCapitalize="words"/>
            {getValidationIcon('name', name)}
          </View>
          {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <Text style={styles.label}>Shop Name</Text>
          <View style={[styles.inputContainer, errors.shopName && touched.shopName && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="Enter shop name" placeholderTextColor={themeColors.textSecondary} value={shopName} onChangeText={setShopName} onBlur={() => handleBlur('shopName', shopName)} autoCapitalize="words"/>
            {getValidationIcon('shopName', shopName)}
          </View>
          {touched.shopName && errors.shopName && <Text style={styles.errorText}>{errors.shopName}</Text>}
          <Text style={styles.label}>Mobile Number</Text>
          <View style={[styles.inputContainer, errors.mobileNo && touched.mobileNo && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="10 digits" placeholderTextColor={themeColors.textSecondary} value={mobileNo} onChangeText={setMobileNo} onBlur={() => handleBlur('mobileNo', mobileNo)} keyboardType="numeric" maxLength={10}/>
            {getValidationIcon('mobileNo', mobileNo)}
          </View>
          {touched.mobileNo && errors.mobileNo && <Text style={styles.errorText}>{errors.mobileNo}</Text>}
          <Text style={styles.label}>Aadhar Card Number</Text>
          <View style={[styles.inputContainer, errors.aadharNo && touched.aadharNo && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="12 digits" placeholderTextColor={themeColors.textSecondary} value={aadharNo} onChangeText={setAadharNo} onBlur={() => handleBlur('aadharNo', aadharNo)} keyboardType="numeric" maxLength={12}/>
            {getValidationIcon('aadharNo', aadharNo)}
          </View>
          {touched.aadharNo && errors.aadharNo && <Text style={styles.errorText}>{errors.aadharNo}</Text>}
          <Text style={styles.label}>PAN Card Number</Text>
          <View style={[styles.inputContainer, errors.panNo && touched.panNo && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="AAAAA1111A" placeholderTextColor={themeColors.textSecondary} value={panNo} onChangeText={(text) => setPanNo(text.toUpperCase())} onBlur={() => handleBlur('panNo', panNo)} autoCapitalize="characters" maxLength={10}/>
            {getValidationIcon('panNo', panNo)}
          </View>
          {touched.panNo && errors.panNo && <Text style={styles.errorText}>{errors.panNo}</Text>}
          <Text style={styles.label}>Address</Text>
          <View style={[styles.inputContainer, errors.address && touched.address && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="Enter full address" placeholderTextColor={themeColors.textSecondary} value={address} onChangeText={setAddress} onBlur={() => handleBlur('address', address)} autoCapitalize="words"/>
            {getValidationIcon('address', address)}
          </View>
          {touched.address && errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          <Text style={styles.label}>Initial Amount</Text>
          <View style={[styles.inputContainer, errors.initialAmount && touched.initialAmount && { borderColor: themeColors.danger }]}>
            <TextInput style={styles.input} placeholder="0" placeholderTextColor={themeColors.textSecondary} value={initialAmount} onChangeText={setInitialAmount} onBlur={() => handleBlur('initialAmount', initialAmount)} keyboardType="numeric"/>
            {getValidationIcon('initialAmount', initialAmount)}
          </View>
          {touched.initialAmount && errors.initialAmount && <Text style={styles.errorText}>{errors.initialAmount}</Text>}
          <Text style={styles.label}>Assign Agent (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedAgent} onValueChange={(itemValue) => setSelectedAgent(itemValue)} style={styles.picker} itemStyle={{ color: themeColors.text }}>
              <Picker.Item label="None (Unassigned)" value={null} />
              {agents.map((agent) => (<Picker.Item key={agent.id} label={agent.username} value={agent.id}/>))}
            </Picker>
          </View>
          <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={loading}>
            {loading ? (<ActivityIndicator color={themeColors.buttonPrimaryText} />) : (<Text style={styles.submitButtonText}>SAVE CUSTOMER</Text>)}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}