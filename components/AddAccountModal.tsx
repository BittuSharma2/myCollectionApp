import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type AddAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh the list
};

export default function AddAccountModal({
  visible,
  onClose,
  onSuccess,
}: AddAccountModalProps) {
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter an account name.');
      return;
    }

    setLoading(true);

    // Insert into the 'accounts' table
    const { error } = await supabase.from('accounts').insert({
      name: name,
      account_number: accountNumber || null,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding account:', error.message);
      Alert.alert('Error', 'Failed to add account.');
    } else {
      setName('');
      setAccountNumber('');
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
          <Text style={styles.title}>Add New Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Account Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Account Number (Optional)"
            value={accountNumber}
            onChangeText={setAccountNumber}
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
                <Text style={styles.submitButtonText}>SUBMIT</Text>
              )}
            </Pressable>
          </View>
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
    padding: 25,
    width: '85%',
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