import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

type DailyCollection = {
  id: number;
  amount: number;
  customers: {
    name: string;
  } | null;
};

// This screen shows the detailed collections for ONE agent on ONE day
export default function AgentDayHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Get params passed from the previous screen
  const { agentId, agentName, date } = useLocalSearchParams<{
    agentId: string;
    agentName: string;
    date: string; // Will be 'YYYY-MM-DD'
  }>();

  const [collections, setCollections] = useState<DailyCollection[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse the date string back into a Date object for display
  const selectedDate = useMemo(() => {
    if (!date) return new Date();
    const parts = date.split('-').map((n) => parseInt(n, 10));
    return new Date(parts[0], parts[1] - 1, parts[2]); // JS months are 0-indexed
  }, [date]);

  const fetchHistory = async () => {
    if (!agentId || !date) return;
    setLoading(true);

    // Set date range for the selected day
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, customers ( name )')
      .eq('user_id', agentId) // Filter by the specific agent
      .gt('amount', 0) // Only collections
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .returns<DailyCollection[]>();

    if (error) {
      console.error('Error fetching agent history:', error.message);
      alert('Failed to fetch history');
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [agentId, date])
  );

  const totalCollection = useMemo(() => {
    return collections.reduce((sum, item) => sum + item.amount, 0);
  }, [collections]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
      backgroundColor: themeColors.header,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.borderColor,
    },
    backButton: { padding: 10, marginLeft: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, color: themeColors.text },
    totalContainer: {
      backgroundColor: themeColors.tint,
      padding: 20,
      margin: 15,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 3,
    },
    totalLabel: {
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
    dateText: {
      fontSize: 14,
      color: themeColors.buttonPrimaryText,
      opacity: 0.8,
      marginTop: 2,
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
    itemName: { fontSize: 16, color: themeColors.text },
    itemAmount: { fontSize: 16, fontWeight: 'bold', color: themeColors.text },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
  });

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
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{agentName}'s History</Text>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Collection</Text>
        <Text style={styles.totalAmount}>₹ {totalCollection.toFixed(1)}</Text>
        <Text style={styles.dateText}>
          on {selectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      </View>

      {loading ? (
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
        />
      )}
    </SafeAreaView>
  );
}