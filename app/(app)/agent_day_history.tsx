import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EditTransactionModal from '../../components/EditTransactionModal';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

type DailyCollection = {
  id: number;
  amount: number;
  customers: { name: string; } | null;
  profiles: { username: string; } | null;
};

export default function AgentDayHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const { agentId, agentName, date } = useLocalSearchParams<{
    agentId: string;
    agentName: string;
    date: string;
  }>();

  const [collections, setCollections] = useState<DailyCollection[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DailyCollection | null>(null);

  // --- 2. Add isRefreshing state ---
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedDate = useMemo(() => {
    if (!date) return new Date();
    const parts = date.split('-').map((n) => parseInt(n, 10));
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }, [date]);

  // --- 4. Modify fetchHistory ---
  const fetchHistory = async () => {
    if (!agentId || !date) return;
    
    // Only show full-page loader on initial load
    if (!isRefreshing) {
      setLoading(true);
    }
    
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, customers ( name ), profiles ( username )')
      .eq('user_id', agentId)
      .gt('amount', 0)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .returns<DailyCollection[]>();
      
    if (error) { 
      alert('Failed to fetch history'); 
    }
    else { 
      setCollections(data || []); 
    }
    setLoading(false);
    setIsRefreshing(false); // Stop refresh on success or error
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, [agentId, date]));

  // --- 3. Create onRefresh function ---
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory();
  }, [agentId, date]); // Dependencies

  const totalCollection = useMemo(() => {
    return collections.reduce((sum, item) => sum + item.amount, 0);
  }, [collections]);
  
  const handleEditPress = (item: DailyCollection) => {
    setSelectedTransaction(item);
    setIsEditModalVisible(true);
  };
  const confirmDeleteTransaction = (item: DailyCollection) => {
    Alert.alert(
      `Delete This Collection?`,
      `Are you sure you want to delete this collection of ${item.amount.toFixed(1)} for ${item.customers?.name || 'Unknown'}?`,
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
    else { Alert.alert('Success', 'Transaction deleted.'); fetchHistory(); }
    setLoading(false);
    setSelectedItemId(null);
  };
  const onEditSuccess = () => {
    setIsEditModalVisible(false);
    setSelectedTransaction(null);
    fetchHistory();
    setSelectedItemId(null);
  };
  // ---

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 10,
      backgroundColor: themeColors.header,
      borderBottomWidth: 1,
      borderColor: themeColors.borderColor,
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
      color: 'green',
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

  const renderItem = ({ item }: { item: DailyCollection }) => {
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
            (by {item.profiles?.username || 'Unknown Agent'})
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
            <Text style={styles.itemAmount}>₹{item.amount.toFixed(1)}</Text>
          )}
        </View>
      </Pressable>
    );
  };

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

      {/* Show spinner only on initial load, not on refresh */}
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
          onScroll={() => setSelectedItemId(null)}
          // --- 5. Add the refreshControl prop ---
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[themeColors.text]} // Spinner color
              tintColor={themeColors.text} // Spinner color (iOS)
              progressBackgroundColor={themeColors.card} // Circle color (Android)
            />
          }
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