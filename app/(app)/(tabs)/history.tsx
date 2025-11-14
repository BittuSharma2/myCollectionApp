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
  useColorScheme, // <-- Import for theme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import { Colors } from '../../../constants/theme'; // <-- Import your new theme
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

// (Type is unchanged)
type DailyCollection = {
  id: number;
  amount: number;
  customers: {
    name: string;
  } | null;
};

export default function HistoryScreen() {
  const { profile } = useAuth();

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  // (State is unchanged)
  const [collections, setCollections] = useState<DailyCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // (All data functions are unchanged)
  const fetchHistory = async () => {
    if (!profile) return;
    setLoading(true);
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, customers ( name )')
      .eq('user_id', profile.id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .returns<DailyCollection[]>();

    if (error) {
      console.error('Error fetching history:', error.message);
      alert('Failed to fetch history');
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [date, profile])
  );

  const totalCollection = useMemo(() => {
    return collections.reduce((sum, item) => sum + item.amount, 0);
  }, [collections]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  // --- NEW: Dynamic styles ---
  // We move styles inside the component to access themeColors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background, // Dynamic
    },
    datePickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: themeColors.input, // Dynamic
      padding: 15,
      margin: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: themeColors.borderColor, // Dynamic
    },
    dateText: {
      fontSize: 16,
      fontWeight: '600',
      color: themeColors.text, // Dynamic
    },
    totalContainer: {
      backgroundColor: themeColors.tint, // Dynamic (use tint color)
      padding: 20,
      marginHorizontal: 15,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 3,
    },
    totalText: {
      fontSize: 16,
      color: themeColors.buttonPrimaryText, // Dynamic
      opacity: 0.8,
    },
    totalAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: themeColors.buttonPrimaryText, // Dynamic
      marginTop: 5,
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      marginHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor, // Dynamic
    },
    itemName: {
      fontSize: 16,
      color: themeColors.text, // Dynamic
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text, // Dynamic
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary, // Dynamic
    },
  });
  // --- END NEW STYLES ---

  const renderItem = ({ item }: { item: DailyCollection }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>
        {item.customers?.name || 'Unknown Customer'}
      </Text>
      <Text style={styles.itemAmount}>{item.amount.toFixed(1)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title="Daily Collection" />

      <Pressable
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={themeColors.textSecondary} // Dynamic
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
          color={themeColors.textSecondary} // Dynamic
        />
      </Pressable>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Collection</Text>
        <Text style={styles.totalAmount}>₹ {totalCollection.toFixed(1)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 50 }}
          color={themeColors.tint} // Dynamic
        />
      ) : (
        <FlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No collections for this day.</Text>
          }
          style={{ backgroundColor: themeColors.background }} // Dynamic
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          // --- NEW: Theme for DateTimePicker ---
          themeVariant={colorScheme}
        />
      )}
    </SafeAreaView>
  );
}