import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import { Colors } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

// (All types, state, and functions are unchanged)
type DailyCollection = {
  id: number;
  amount: number;
  customers: {
    name: string;
  } | null;
};

export default function MyCollectionsScreen() {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [collections, setCollections] = useState<DailyCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!profile) return;
    if (!isRefreshing) {
      setLoading(true);
    }
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, customers ( name )')
      .eq('user_id', profile.id)
      .gt('amount', 0)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .returns<DailyCollection[]>();
    if (error) {
      console.error('Error fetching history:', error.message);
      alert('Failed to fetch history');
      setIsRefreshing(false);
    } else {
      setCollections(data || []);
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [date, profile])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory();
  }, [date, profile]);

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
      backgroundColor: themeColors.tint,
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
      backgroundColor: themeColors.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
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
      minHeight: 70,
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
    itemRight: {
      minWidth: 90,
      alignItems: 'flex-end',
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'green',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
  });

  const renderItem = ({ item }: { item: DailyCollection }) => (
    <Pressable
      style={({ pressed }) => [
        styles.itemContainer,
        pressed && { backgroundColor: themeColors.input },
      ]}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.customers?.name || 'Unknown Customer'}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemAmount}>₹{item.amount.toFixed(1)}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title="My Daily Collection" />

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
        <Text style={styles.totalText}>Total Collection</Text>
        <Text style={styles.totalAmount}>₹ {totalCollection.toFixed(1)}</Text>
      </View>

      {loading && !isRefreshing ? (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 50 }}
          color={themeColors.tint}
        />
      ) : (
        <FlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No collections for this day.</Text>
          }
          style={{ backgroundColor: themeColors.background }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[themeColors.text]} // Spinner color
              tintColor={themeColors.text} // Spinner color (iOS)
              // --- (THE FIX) ---
              // This sets the circle background color
              progressBackgroundColor={themeColors.card}
              // --- (END FIX) ---
            />
          }
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