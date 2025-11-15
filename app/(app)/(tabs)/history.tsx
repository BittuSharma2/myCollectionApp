import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList, // Changed from SectionList
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

// Types for our new data
type AgentSummary = {
  user_id: string;
  username: string;
  total_collection: number;
};

// This is the ADMIN's history screen
export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter(); // Import router for navigation

  const [summary, setSummary] = useState<AgentSummary[]>([]);
  // We no longer need the 'fullLog' state here
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Formats date to 'YYYY-MM-DD' for SQL
  const getSqlDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchAdminHistory = async () => {
    setLoading(true);
    const selectedDate = getSqlDate(date);

    // 1. Fetch Agent Summary using our SQL function
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      'get_daily_summary',
      { p_date: selectedDate }
    );
    if (summaryError) {
      console.error('Error fetching summary:', summaryError.message);
      alert('Failed to fetch agent summary.');
    } else {
      setSummary(summaryData || []);
    }
    
    // 2. We no longer fetch the full log here
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAdminHistory();
    }, [date])
  );

  const totalCollection = useMemo(() => {
    return summary.reduce((sum, item) => sum + item.total_collection, 0);
  }, [summary]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  // --- Render Function for the new FlatList ---
  const renderSummaryItem = ({ item }: { item: AgentSummary }) => (
    <Pressable
      style={styles.itemContainer}
      onPress={() =>
        router.push({
          pathname: '/(app)/agent_day_history' as any,
          params: {
            agentId: item.user_id,
            agentName: item.username,
            date: getSqlDate(date), // Pass the selected date
          },
        })
      }>
      <Text style={styles.itemName}>{item.username}</Text>
      <View style={styles.itemRight}>
        <Text style={styles.itemAmount}>
          ₹ {item.total_collection.toFixed(1)}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={themeColors.textSecondary}
        />
      </View>
    </Pressable>
  );

  // --- Styles ---
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
      backgroundColor: themeColors.tint,
      padding: 20,
      marginHorizontal: 15,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 3,
      marginBottom: 10,
    },
    totalText: { fontSize: 16, color: themeColors.buttonPrimaryText, opacity: 0.8 },
    totalAmount: { fontSize: 28, fontWeight: 'bold', color: themeColors.buttonPrimaryText, marginTop: 5 },
    listHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: themeColors.text,
      paddingHorizontal: 15,
      marginTop: 10,
      marginBottom: 5,
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      marginHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
      backgroundColor: themeColors.card,
    },
    itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemName: { fontSize: 16, color: themeColors.text },
    itemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
      marginRight: 10,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title="Admin Collection History" />

      <Pressable
        style={styles.datePickerButton}
        onPress={() => setShowDatePicker(true)}>
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
        <Text style={styles.totalText}>Total All Collections</Text>
        <Text style={styles.totalAmount}>₹ {totalCollection.toFixed(1)}</Text>
      </View>

      <Text style={styles.listHeader}>Agent Summary</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} color={themeColors.tint} />
      ) : (
        <FlatList
          data={summary}
          keyExtractor={(item) => item.user_id}
          renderItem={renderSummaryItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No collections for this day.</Text>
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