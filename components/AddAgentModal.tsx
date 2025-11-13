import React, { useState } from 'react';
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

type AddAgentModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh the list
};

export default function AddAgentModal({
  visible,
  onClose,
  onSuccess,
}: AddAgentModalProps) {
  // State for all the new fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [address, setAddress] = useState('');
  const [aadharNo, setAadharNo] = useState(''); // This one is optional

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Check required fields
    if (!email || !password || !username || !mobileNo || !address) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    // Call our 'create-user' function with all the new data
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email,
        password,
        username,
        mobile_no: mobileNo,
        address: address,
        aadhar_card_no: aadharNo || null, // Pass null if empty
      },
    });

    setLoading(false);

    if (error) {
      console.error('Error invoking function:', error.message);
      Alert.alert('Error', 'Failed to create agent: ' + error.message);
    } else {
      Alert.alert('Success', `Agent ${username} created!`);
      // Clear the form
      setEmail('');
      setPassword('');
      setUsername('');
      setMobileNo('');
      setAddress('');
      setAadharNo('');
      
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
            <Text style={styles.title}>Add New Agent</Text>

            <TextInput
              style={styles.input}
              placeholder="Agent Name (Username)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Login Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Login Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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
                  <Text style={styles.submitButtonText}>CREATE</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Styles
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
    maxHeight: '80%', // Make modal scrollable if content is too long
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