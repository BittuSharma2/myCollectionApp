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

type Agent = {
  id: string;
  username: string;
  role: string;
};

type AddCustomerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

// --- THIS IS OUR FAKE DATA ---
const FAKE_AGENTS: Agent[] = [
  { id: '1', username: 'Fake Agent 1', role: 'user' },
  { id: '2', username: 'Fake Agent 2', role: 'user' },
  { id: '3', username: 'Fake Agent 3', role: 'user' },
];
// ---

export default function AddCustomerModal({
  visible,
  onClose,
  onSuccess,
}: AddCustomerModalProps) {
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
  const [loadingAgents, setLoadingAgents] = useState(true); // Start as true

  // --- THIS IS THE TEST ---
  // When the modal opens, we will set the fake list
  useEffect(() => {
    if (visible) {
      console.log('Modal is visible. Setting FAKE data.');
      // Start loading
      setLoadingAgents(true);
      
      // Use a small timeout to simulate fetching
      setTimeout(() => {
        setAgents(FAKE_AGENTS);
        setLoadingAgents(false); // Stop loading
        console.log('Fake data has been set.');
      }, 500); // 500ms delay
      
    } else {
      // Clear the list when modal closes
      setAgents([]);
    }
  }, [visible]);
  // --- END TEST ---

  // (handleSubmit function is unchanged, though it won't be used for this test)
  const handleSubmit = async () => {
    if (!name || !shopName || !mobileNo || !aadharNo || !panNo || !address || !initialAmount) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    // ... (rest of function is unchanged)
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
            <Text style={styles.title}>Add New Customer</Text>

            {/* (Inputs are unchanged) */}
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

            {/* (Buttons are unchanged) */}
            <View style={styles.buttonRow}>
              <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>CANCEL</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#4A00E0" /> : <Text style={styles.submitButtonText}>CREATE</Text>}
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