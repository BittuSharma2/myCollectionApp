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
  View,
  useColorScheme,
} from 'react-native';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Account = {
  id: number;
  name: string;
};

type AddCollectionModalProps = {
  visible: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess: () => void;
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

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const handleSubmit = async () => {
    if (!account) return;
    if (loading) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('transactions').insert({
      amount: parsedAmount,
      account_id: account.id,
      user_id: profile.id,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding collection:', error.message);
      Alert.alert('Error', 'Failed to add collection.');
    } else {
      setAmount('');
      onSuccess();
      onClose();
    }
  };

  // --- NEW: Dynamic styles ---
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
    accountId: {
      fontSize: 22,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    accountName: {
      fontSize: 20,
      color: themeColors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputLabel: {
      alignSelf: 'flex-start',
      marginLeft: '10%',
      color: themeColors.textSecondary,
      fontSize: 14,
    },
    input: {
      width: '80%',
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
      padding: 10,
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 30,
      color: themeColors.text,
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
      backgroundColor: themeColors.buttonDefault,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.buttonDefaultText,
    },
    // --- (THE FIX) ---
    // Removed duplicate submitButton and submitButtonText styles
    // We will just use 'button' and 'buttonText' for both
  });
  // --- END NEW STYLES ---

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
          <Text style={styles.accountId}>{account.id}</Text>
          <Text style={styles.accountName}>{account.name}</Text>

          <Text style={styles.inputLabel}>Installment</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus={true}
          />

          <View style={styles.buttonRow}>
            {/* --- (THE FIX) --- */}
            <Pressable
              style={styles.button} // Removed styles.cancelButton
              onPress={onClose}>
              <Text style={styles.buttonText}>CANCEL</Text>
            </Pressable>
            <Pressable
              style={styles.button} // Removed styles.submitButton
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={themeColors.buttonDefaultText} />
              ) : (
                <Text style={styles.buttonText}>SUBMIT</Text> // Use styles.buttonText
              )}
            </Pressable>
            {/* --- END FIX --- */}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}