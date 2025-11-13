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

// Define the type for the Agent prop
type Agent = {
  id: string;
  username: string;
  mobile_no: string | null;
  address: string | null;
  aadhar_card_no: string | null;
};

type EditAgentModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh the list
  agent: Agent | null; // The agent to edit
};

export default function EditAgentModal({
  visible,
  onClose,
  onSuccess,
  agent,
}: EditAgentModalProps) {
  // State for all the fields
  const [username, setUsername] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [loading, setLoading] = useState(false);

  // This useEffect pre-fills the form when the 'agent' prop changes
  useEffect(() => {
    if (agent) {
      setUsername(agent.username);
      setMobileNo(agent.mobile_no || '');
      setAddress(agent.address || '');
      setAadharNo(agent.aadhar_card_no || '');
    }
  }, [agent]);

  const handleSubmit = async () => {
    if (!agent) return;
    if (!username || !mobileNo || !address) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // Update the 'profiles' table
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username,
        mobile_no: mobileNo,
        address: address,
        aadhar_card_no: aadharNo || null,
      })
      .eq('id', agent.id); // The WHERE clause

    setLoading(false);

    if (error) {
      console.error('Error updating agent:', error.message);
      Alert.alert('Error', 'Failed to update agent.');
    } else {
      onSuccess(); // Call the success handler to refresh data
      onClose();   // Close the modal
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
            <Text style={styles.title}>Edit Agent</Text>

            <TextInput
              style={styles.input}
              placeholder="Agent Name (Username)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
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
            <Text style={styles.note}>
              To change email or password, the agent must use the "Change Password" feature or be reset manually.
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}>
                <Text style={styles.buttonText}>CANCEL</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#4A00E0" />
                ) : (
                  <Text style={styles.submitButtonText}>SAVE</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// (Styles are very similar to AddAgentModal)
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 15,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  note: {
    fontSize: 12,
    color: '#666',
    width: '90%',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
    minWidth: 110,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A00E0',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A00E0',
  },
});