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
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Define the type for the Account prop
type Account = {
  id: number;
  name: string;
};

type AddCollectionModalProps = {
  visible: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess: () => void; // To refresh the list
};

export default function AddCollectionModal({
  visible,
  onClose,
  account,
  onSuccess,
}: AddCollectionModalProps) {
  const { profile } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!account) return;
    if (loading) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);

    // Insert into the 'collections' table
    const { error } = await supabase.from('collections').insert({
      amount: parsedAmount,
      account_id: account.id,
      user_id: profile.id, // The ID of the logged-in user
    });

    setLoading(false);

    if (error) {
      console.error('Error adding collection:', error.message);
      Alert.alert('Error', 'Failed to add collection.');
    } else {
      // Alert.alert('Success', 'Collection added successfully.');
      setAmount('');
      onSuccess(); // Call the success handler to refresh data
      onClose();   // Close the modal
    }
  };

  if (!account) return null; // Don't render if no account is selected

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      {/* Semi-transparent background */}
      <View style={styles.modalBackdrop}>
        {/* The modal content */}
        <View style={styles.modalContainer}>
          <Text style={styles.accountId}>{account.id}</Text>
          <Text style={styles.accountName}>{account.name}</Text>

          <Text style={styles.inputLabel}>Installment</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
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

// Styles based on addcollection.jpeg
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  accountId: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  accountName: {
    fontSize: 20,
    color: '#555',
    marginBottom: 20,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    color: '#666',
    fontSize: 14,
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
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
    backgroundColor: '#f0f0f0', // Matching your design
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A00E0', // Purple
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A00E0', // Purple
  },
});