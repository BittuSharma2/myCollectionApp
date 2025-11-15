import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useRouter } from 'expo-router';
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

type AgentSummary = {
  user_id: string;
  username: string;
  total_collection: number;
};

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const router = useRouter();

  const [summary, setSummary] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getSqlDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchAdminHistory = async () => {
    setLoading(true);
    const selectedDate = getSqlDate(date);

    const { data: summaryData, error: summaryError } = await supabase.rpc(
      'get_daily_summary',
      { p_date: selectedDate }
    );
    if (summaryError) {
      alert('Failed to fetch agent summary.');
    } else {
      setSummary(summaryData || []);
    }
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
      paddingHorizontal: 20,
      marginTop: 10,
      marginBottom: 5,
    },
    // --- NEW CARD STYLES ---
    itemContainer: {
      backgroundColor: themeColors.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 15,
      marginVertical: 6, // Gap
      borderRadius: 12, // Rounded
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
    itemName: { fontSize: 16, fontWeight: '600', color: themeColors.text },
    itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: themeColors.text,
      marginRight: 10,
    },
    // ---
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
  });

  // --- UPDATED renderSummaryItem ---
  const renderSummaryItem = ({ item }: { item: AgentSummary }) => (
    <Pressable
      style={({ pressed }) => [
        styles.itemContainer,
        pressed && { backgroundColor: themeColors.input },
      ]}
      onPress={() =>
        router.push({
          pathname: '/(app)/agent_day_history' as any,
          params: {
            agentId: item.user_id,
            agentName: item.username,
            date: getSqlDate(date),
          },
        })
      }>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.username}</Text>
      </View>
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