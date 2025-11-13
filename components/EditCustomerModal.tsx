import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

// (Types are unchanged)
type Agent = {
  id: string;
  username: string;
};
type Customer = {
  id: number;
  name: string;
  shop_name: string;
  mobile_no: string;
  aadhar_card_no: string;
  pan_card_no: string;
  address: string;
  agent_id: string | null;
};
type EditCustomerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer: Customer | null;
};

export default function EditCustomerModal({
  visible,
  onClose,
  onSuccess,
  customer,
}: EditCustomerModalProps) {
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [address, setAddress] = useState('');
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Fetch all available agents to populate the picker
  const fetchAgents = async () => {
    setLoadingAgents(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('role', 'user');

    // --- THIS IS THE FIX ---
    if (error) {
      console.error('Error fetching agents:', error.message);
      Alert.alert('Error', 'Could not load agents.');
    } else if (data) {
      setAgents(data);
    }
    // --- END FIX ---
    setLoadingAgents(false);
  };

  useEffect(() => {
    if (visible) {
      fetchAgents();
      if (customer) {
        setName(customer.name);
        setShopName(customer.shop_name);
        setMobileNo(customer.mobile_no);
        setAadharNo(customer.aadhar_card_no);
        setPanNo(customer.pan_card_no);
        setAddress(customer.address);
        setSelectedAgent(customer.agent_id);
      }
    }
  }, [visible, customer]);

  const handleSubmit = async () => {
    if (!customer) return;
    if (!name || !shopName || !mobileNo || !aadharNo || !panNo || !address) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('customers')
      .update({
        name: name,
        shop_name: shopName,
        mobile_no: mobileNo,
        aadhar_card_no: aadharNo,
        pan_card_no: panNo,
        address: address,
        agent_id: selectedAgent,
      })
      .eq('id', customer.id);

    setLoading(false);

    if (error) {
      console.error('Error updating customer:', error.message);
      if (error.code === '23505') {
        Alert.alert('Error', 'A customer with this name already exists.');
      } else {
        Alert.alert('Error', 'Failed to update customer.');
      }
    } else {
      Alert.alert('Success', 'Customer updated successfully.');
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ alignItems: 'center', width: '100%' }}>
            <Text style={styles.title}>Edit Customer</Text>

            <TextInput style={styles.input} placeholder="Customer Name (Unique)" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Shop Name" value={shopName} onChangeText={setShopName} />
            <TextInput style={styles.input} placeholder="Mobile Number" value={mobileNo} onChangeText={setMobileNo} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Aadhar Card Number" value={aadharNo} onChangeText={setAadharNo} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="PAN Card Number" value={panNo} onChangeText={setPanNo} autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />

            <Text style={styles.label}>Assign Agent</Text>
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
                  {agents.map((agent) => (
                    <Picker.Item key={agent.id} label={agent.username} value={agent.id} />
                  ))}
                </Picker>
              )}
            </View>

            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>CANCEL</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#4A00E0" /> : <Text style={styles.submitButtonText}>SAVE</Text>}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// (Styles are unchanged)
const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: 'white', borderRadius: 20, paddingVertical: 25, paddingHorizontal: 15, width: '90%', maxHeight: '90%', alignItems: 'center', elevation: 5 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '90%', borderBottomWidth: 1, borderBottomColor: '#999', padding: 10, fontSize: 16, marginBottom: 20 },
  label: { fontSize: 14, color: '#666', width: '90%', marginBottom: 5 },
  pickerContainer: { width: '90%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 20, justifyContent: 'center' },
  picker: { width: '100%', height: 50 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', marginTop: 10 },
  button: { borderRadius: 25, paddingVertical: 12, paddingHorizontal: 30, elevation: 2, minWidth: 110, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  submitButton: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#4A00E0' },
  submitButtonText: { fontSize: 16, fontWeight: 'bold', color: '#4A00E0' },
});