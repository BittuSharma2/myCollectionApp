import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from 'react-native';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type AddDebitModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account: { id: number; name: string } | null;
};

export default function AddDebitModal({
  visible,
  onClose,
  onSuccess,
  account,
}: AddDebitModalProps) {
  const { profile } = useAuth(); // Get admin profile
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const handleSubmit = async () => {
    if (!account || !profile) return;
    if (loading) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    setLoading(true);

    // --- THIS IS THE KEY ---
    // We save the amount as a NEGATIVE number to debit the account
    const { error } = await supabase.from('transactions').insert({
      amount: -Math.abs(parsedAmount), // Save as negative
      account_id: account.id,
      user_id: profile.id, // The Admin's ID
    });
    // --- END KEY ---

    setLoading(false);

    if (error) {
      console.error('Error adding debit:', error.message);
      Alert.alert('Error', 'Failed to add debit.');
    } else {
      setAmount('');
      onSuccess();
      onClose();
    }
  };

  const styles = StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: themeColors.card,
      borderRadius: 20,
      padding: 25,
      width: '85%',
      alignItems: 'center',
      elevation: 5,
    },
    title: {
      fontSize: 18,
      color: themeColors.textSecondary,
    },
    accountName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginVertical: 10,
      color: themeColors.text,
      textAlign: 'center',
    },
    input: {
      width: '100%',
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
      padding: 10,
      fontSize: 20,
      textAlign: 'center',
      marginVertical: 20,
      color: themeColors.text,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 10,
    },
    button: {
      borderRadius: 25,
      paddingVertical: 12,
      elevation: 2,
      flex: 1,
      marginHorizontal: 5,
      alignItems: 'center',
      backgroundColor: themeColors.buttonDefault,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.buttonDefaultText,
    },
  });

  if (!account) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Add Debit for</Text>
          <Text style={styles.accountName}>{account.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Debit Amount"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus={true}
          />
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.button}
              onPress={() => {
                setAmount('');
                onClose();
              }}>
              <Text style={styles.buttonText}>CANCEL</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={themeColors.buttonDefaultText} />
              ) : (
                <Text style={styles.buttonText}>SUBMIT DEBIT</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}