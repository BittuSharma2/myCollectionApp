import React, { useEffect, useState } from 'react';
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
import { supabase } from '../lib/supabase';

type Transaction = {
  id: number;
  amount: number;
};

type EditTransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
};

export default function EditTransactionModal({
  visible,
  onClose,
  onSuccess,
  transaction,
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // When the 'transaction' prop changes, update the modal's internal amount state
  useEffect(() => {
    if (transaction) {
      // Use Math.abs() to show a positive number, easier for user
      setAmount(Math.abs(transaction.amount).toString());
    }
  }, [transaction]);

  const handleSubmit = async () => {
    if (!transaction) return;
    if (loading) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount.');
      return;
    }

    setLoading(true);

    // Check if original was positive (credit) or negative (debit)
    // and save the new amount with the same sign.
    const newAmount =
      transaction.amount > 0
        ? Math.abs(parsedAmount) // Was credit, save as positive
        : -Math.abs(parsedAmount); // Was debit, save as negative

    const { error } = await supabase
      .from('transactions')
      .update({ amount: newAmount }) // Update the amount
      .eq('id', transaction.id); // Where the ID matches

    setLoading(false);

    if (error) {
      console.error('Error updating transaction:', error.message);
      Alert.alert('Error', 'Failed to update transaction.');
    } else {
      Alert.alert('Success', 'Transaction updated.');
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
    txnId: {
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

  if (!transaction) return null;

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
          <Text style={styles.title}>Edit Transaction</Text>
          <Text style={styles.txnId}>ID: {transaction.id}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter New Amount"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="numeric" // Only positive numbers
            value={amount}
            onChangeText={setAmount}
            autoFocus={true}
          />
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>CANCEL</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={themeColors.buttonDefaultText} />
              ) : (
                <Text style={styles.buttonText}>UPDATE</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}