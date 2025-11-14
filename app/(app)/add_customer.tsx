import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

// (Type is unchanged)
type Agent = {
  id: string;
  username: string;
  role: string;
};

export default function AddCustomerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  // (All state is unchanged)
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [address, setAddress] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // (All data functions are unchanged)
  useEffect(() => {
    const fetchAgents = async () => {
      setLoadingAgents(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role');

      if (error) {
        console.error('Error fetching agents:', error.message);
        Alert.alert('Error', 'Could not load agents: ' + error.message);
        setAgents([]);
      } else if (data) {
        const agentList = data.filter((profile) => profile.role === 'user');
        setAgents(agentList);
      }
      setLoadingAgents(false);
    };

    fetchAgents();
  }, []);

  const handleSubmit = async () => {
    if (
      !name ||
      !shopName ||
      !mobileNo ||
      !aadharNo ||
      !panNo ||
      !address ||
      !initialAmount
    ) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('customers').insert({
      name: name,
      shop_name: shopName,
      mobile_no: mobileNo,
      aadhar_card_no: aadharNo,
      pan_card_no: panNo,
      address: address,
      initial_amount: parseFloat(initialAmount),
      agent_id: selectedAgent,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding customer:', error.message);
      if (error.code === '23505') {
        Alert.alert('Error', 'A customer with this name already exists.');
      } else {
        Alert.alert('Error', 'Failed to add customer: ' + error.message);
      }
    } else {
      Alert.alert('Success', 'Customer created successfully.');
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
    label: {
      fontSize: 14,
      color: themeColors.textSecondary, // Dynamic
      marginBottom: 5,
      marginLeft: 5,
    },
    pickerContainer: {
      backgroundColor: themeColors.background, // Dynamic
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor, // Dynamic
      marginBottom: 20,
      justifyContent: 'center',
    },
    picker: {
      width: '100%',
      height: 60,
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
          <Text style={styles.headerTitle}>Add New Customer</Text>
        </View>

        {/* --- Form --- */}
        <ScrollView contentContainerStyle={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Customer Name (Unique)"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Shop Name"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={shopName}
            onChangeText={setShopName}
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
            placeholder="Aadhar Card Number"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={aadharNo}
            onChangeText={setAadharNo}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="PAN Card Number"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={panNo}
            onChangeText={setPanNo}
            autoCapitalize="characters"
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
            placeholder="Initial Amount"
            placeholderTextColor={themeColors.textSecondary} // Dynamic
            value={initialAmount}
            onChangeText={setInitialAmount}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Assign Agent (Optional)</Text>
          <View style={styles.pickerContainer}>
            {loadingAgents ? (
              <ActivityIndicator color={themeColors.tint} /> // Dynamic
            ) : (
              <Picker
                selectedValue={selectedAgent}
                onValueChange={(itemValue) => setSelectedAgent(itemValue)}
                style={styles.picker}
                itemStyle={{ color: themeColors.text }} // For iOS
              >
                <Picker.Item label="None (Unassigned)" value={null} />

                {agents.length === 0 ? (
                  <Picker.Item
                    label="No agents found"
                    value={null}
                    enabled={false}
                  />
                ) : (
                  agents.map((agent) => (
                    <Picker.Item
                      key={agent.id}
                      label={agent.username}
                      value={agent.id}
                    />
                  ))
                )}
              </Picker>
            )}
          </View>

          <Pressable
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={themeColors.buttonPrimaryText} /> // Dynamic
            ) : (
              <Text style={styles.submitButtonText}>CREATE CUSTOMER</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}