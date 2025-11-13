import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

// Define the Agent type for the picker
type Agent = {
  id: string;
  username: string;
  role: string;
};

export default function AddCustomerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // For the custom header

  // (All the state from the modal is the same)
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

  // (The fetchAgents function is the same)
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
        const agentList = data.filter(profile => profile.role === 'user');
        setAgents(agentList);
      }
      setLoadingAgents(false);
    };
    
    fetchAgents();
  }, []); // Runs once when the page loads

  // (The handleSubmit function is almost the same)
  const handleSubmit = async () => {
    if (!name || !shopName || !mobileNo || !aadharNo || !panNo || !address || !initialAmount) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('customers').insert({
      name: name, shop_name: shopName, mobile_no: mobileNo,
      aadhar_card_no: aadharNo, pan_card_no: panNo, address: address,
      initial_amount: parseFloat(initialAmount), agent_id: selectedAgent,
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
      // --- CHANGE ---
      // Instead of onSuccess() and onClose(), we just go back.
      router.back(); 
      // --- END CHANGE ---
    }
  };

  return (
    // This replaces the <Modal> wrapper
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* --- NEW: Custom Header --- */}
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Customer</Text>
      </View>

      {/* This replaces the <Modal> container */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <TextInput style={styles.input} placeholder="Customer Name (Unique)" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Shop Name" value={shopName} onChangeText={setShopName} />
        <TextInput style={styles.input} placeholder="Mobile Number" value={mobileNo} onChangeText={setMobileNo} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Aadhar Card Number" value={aadharNo} onChangeText={setAadharNo} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="PAN Card Number" value={panNo} onChangeText={setPanNo} autoCapitalize="characters" />
        <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="Initial Amount" value={initialAmount} onChangeText={setInitialAmount} keyboardType="numeric" />

        <Text style={styles.label}>Assign Agent (Optional)</Text>
        <View style={styles.pickerContainer}>
          {loadingAgents ? (
            <ActivityIndicator />
          ) : (
            <Picker
              selectedValue={selectedAgent}
              onValueChange={(itemValue) => setSelectedAgent(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="None (Unassigned)" value={null} />
              
              {agents.length === 0 ? (
                <Picker.Item label="No agents found" value={null} enabled={false} />
              ) : (
                agents.map((agent) => (
                  <Picker.Item key={agent.id} label={agent.username} value={agent.id} />
                ))
              )}
            </Picker>
          )}
        </View>

        {/* --- NEW: Changed button style --- */}
        <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>CREATE CUSTOMER</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- NEW: Styles for a full page ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Page background
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
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginLeft: 5,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 60, // iOS needs height
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