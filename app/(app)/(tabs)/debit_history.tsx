import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import EditTransactionModal from '../../../components/EditTransactionModal';
import { Colors } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

type DebitTransaction = {
  id: number;
  amount: number;
  customers: { name: string; } | null;
  profiles: { username: string; } | null;
};

export default function DebitHistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [debits, setDebits] = useState<DebitTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DebitTransaction | null>(null);

  const fetchDebitHistory = async () => {
    setLoading(true);
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, customers ( name ), profiles ( username )')
      .lt('amount', 0)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .returns<DebitTransaction[]>();
    if (error) { alert('Failed to fetch debit history'); }
    else { setDebits(data || []); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchDebitHistory(); }, [date]));
  const totalDebit = useMemo(() => {
    return debits.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  }, [debits]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') { setShowDatePicker(false); return; }
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleEditPress = (item: DebitTransaction) => {
    setSelectedTransaction(item);
    setIsEditModalVisible(true);
  };

  const confirmDeleteTransaction = (item: DebitTransaction) => {
    Alert.alert(
      `Delete This Debit?`,
      `Are you sure you want to delete this debit of ${Math.abs(item.amount).toFixed(1)} for ${item.customers?.name || 'Unknown'}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedItemId(null) },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(item.id) },
      ]
    );
  };

  const deleteTransaction = async (transactionId: number) => {
    setLoading(true);
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
    if (error) { Alert.alert('Error', 'Failed to delete transaction.'); }
    else { Alert.alert('Success', 'Transaction deleted.'); fetchDebitHistory(); }
    setLoading(false);
    setSelectedItemId(null);
  };

  const onEditSuccess = () => {
    setIsEditModalVisible(false);
    setSelectedTransaction(null);
    fetchDebitHistory();
    setSelectedItemId(null);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    datePickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: themeColors.input,
      padding: 15,
      margin: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
    },
    dateText: { fontSize: 16, fontWeight: '600', color: themeColors.text },
    totalContainer: {
      backgroundColor: themeColors.danger,
      padding: 20,
      marginHorizontal: 15,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 3,
    },
    totalText: { fontSize: 16, color: themeColors.buttonPrimaryText, opacity: 0.8 },
    totalAmount: { fontSize: 28, fontWeight: 'bold', color: themeColors.buttonPrimaryText, marginTop: 5 },
    itemContainer: {
      backgroundColor: themeColors.card,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 15,
      marginVertical: 6,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    itemLeft: {
      flex: 1,
      marginRight: 10,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
    },
    itemSubtitle: {
      fontSize: 14,
      color: themeColors.textSecondary,
      fontStyle: 'italic',
      marginTop: 2,
    },
    itemRight: {
      width: 100,
      alignItems: 'flex-end',
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.danger,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    iconButton: {
      paddingHorizontal: 8,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
  });

  const renderItem = ({ item }: { item: DebitTransaction }) => {
    const isSelected = selectedItemId === item.id;

    return (
      <Pressable
        style={[
          styles.itemContainer,
          isSelected && { backgroundColor: themeColors.input },
        ]}
        onPress={() => {
          if (!isAdmin) return;
          setSelectedItemId(isSelected ? null : item.id);
        }}
        disabled={!isAdmin}
      >
        <View style={styles.itemLeft}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.customers?.name || 'Unknown Customer'}
          </Text>
          <Text style={styles.itemSubtitle}>
            (by {item.profiles?.username || 'Admin'})
          </Text>
        </View>

        <View style={styles.itemRight}>
          {isSelected ? (
            <View style={styles.buttonRow}>
              <Pressable style={styles.iconButton} onPress={() => handleEditPress(item)}>
                <Ionicons name="pencil" size={24} color={themeColors.tint} />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => confirmDeleteTransaction(item)}>
                <Ionicons name="trash" size={24} color={themeColors.danger} />
              </Pressable>
            </View>
          ) : (
            <Text style={styles.itemAmount}>
              -₹{Math.abs(item.amount).toFixed(1)}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title="Daily Debit History" />

      <Pressable style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
        <Ionicons name="calendar-outline" size={20} color={themeColors.textSecondary} />
        <Text style={styles.dateText}>
          {date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        <Ionicons name="chevron-down-outline" size={20} color={themeColors.textSecondary} />
      </Pressable>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Debits</Text>
        <Text style={styles.totalAmount}>₹ {totalDebit.toFixed(1)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large" // <-- FIX 1: Removed colon
          style={{ marginTop: 50 }}
          color={themeColors.tint}
        />
      ) : (
        <FlatList
          data={debits}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No debits for this day.</Text>
          }
          onScroll={() => setSelectedItemId(null)}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date" // <-- FIX 2: Removed colon
          display="default"
          onChange={onChangeDate}
          themeVariant={colorScheme}
        />
      )}

      <EditTransactionModal
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedTransaction(null);
          setSelectedItemId(null);
        }}
        onSuccess={onEditSuccess}
        transaction={selectedTransaction}
      />
    </SafeAreaView>
  );
}