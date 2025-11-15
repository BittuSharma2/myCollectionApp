import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import { Colors } from '../../../constants/theme';
import { supabase } from '../../../lib/supabase';

// Type for our debit transactions
type DebitTransaction = {
  id: number;
  amount: number;
  customers: {
    name: string;
  } | null;
  profiles: {
    username: string;
  } | null;
};

// This is the ADMIN's Debit History screen
export default function DebitHistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [debits, setDebits] = useState<DebitTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchDebitHistory = async () => {
    setLoading(true);
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // This query finds all transactions where the amount is NEGATIVE
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, customers ( name ), profiles ( username )')
      .lt('amount', 0) // The most important filter: less than 0
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .returns<DebitTransaction[]>();

    if (error) {
      console.error('Error fetching debit history:', error.message);
      alert('Failed to fetch debit history');
    } else {
      setDebits(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchDebitHistory();
    }, [date])
  );

  // Calculate the total (as a positive number)
  const totalDebit = useMemo(() => {
    return debits.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  }, [debits]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
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
    dateText: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text,
    },
    totalContainer: {
      backgroundColor: themeColors.danger, // Red for debits
      padding: 20,
      marginHorizontal: 15,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 3,
    },
    totalText: {
      fontSize: 16,
      color: themeColors.buttonPrimaryText,
      opacity: 0.8,
    },
    totalAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.buttonPrimaryText,
      marginTop: 5,
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      marginHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
      backgroundColor: themeColors.card,
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      color: themeColors.text,
    },
    itemAdmin: {
      fontSize: 14,
      color: themeColors.textSecondary,
      fontStyle: 'italic',
      marginTop: 2,
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.danger, // Red for debit amount
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
  });

  const renderItem = ({ item }: { item: DebitTransaction }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>
          {item.customers?.name || 'Unknown Customer'}
        </Text>
        <Text style={styles.itemAdmin}>
          (by {item.profiles?.username || 'Admin'})
        </Text>
      </View>
      <Text style={styles.itemAmount}>
        -₹ {Math.abs(item.amount).toFixed(1)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title="Daily Debit History" />

      <Pressable
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={themeColors.textSecondary}
        />
        <Text style={styles.dateText}>
          {date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={themeColors.textSecondary}
        />
      </Pressable>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Debits</Text>
        <Text style={styles.totalAmount}>₹ {totalDebit.toFixed(1)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
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
          style={{ backgroundColor: themeColors.background }}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          themeVariant={colorScheme}
        />
      )}
    </SafeAreaView>
  );
}