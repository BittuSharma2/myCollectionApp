import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

// Define the type for a single collection
type Collection = {
  id: number;
  created_at: string;
  amount: number;
};

export default function StatementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // For safe area
  
  // Get the parameters passed from the home screen
  const { accountId, accountName } = useLocalSearchParams<{
    accountId: string;
    accountName: string;
  }>();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // This function fetches the data
  const fetchCollections = async () => {
    if (!accountId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('collections')
      .select('id, created_at, amount')
      .eq('account_id', accountId) // Only for this account
      .order('created_at', { ascending: true }); // Oldest first

    if (error) {
      console.error('Error fetching collections:', error.message);
      alert('Failed to fetch data');
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  // Run the fetch every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchCollections();
    }, [accountId])
  );

  // Calculate running balance and total
  let runningBalance = 0;
  const processedData = collections.map((item, index) => {
    runningBalance += item.amount;
    return {
      ...item,
      sr: index + 1,
      date: new Date(item.created_at).toLocaleDateString('en-IN'),
      credit: item.amount,
      balance: runningBalance,
    };
  });
  const totalBalance = runningBalance;

  // Header component for the list
  const ListHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.headerText, { flex: 0.5 }]}>Sr</Text>
      <Text style={[styles.cell, styles.headerText, { flex: 1.2 }]}>Date</Text>
      <Text style={[styles.cell, styles.headerText]}>Txn No</Text>
      <Text style={[styles.cell, styles.headerText]}>Credit</Text>
      <Text style={[styles.cell, styles.headerText, { textAlign: 'right' }]}>Balance</Text>
    </View>
  );

  // Component for each row
  const renderItem = ({ item }: { item: (typeof processedData)[0] }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 0.5 }]}>{item.sr}</Text>
      <Text style={[styles.cell, { flex: 1.2 }]}>{item.date}</Text>
      <Text style={styles.cell}>{item.id}</Text>
      <Text style={styles.cell}>{item.credit.toFixed(1)}</Text>
      <Text style={[styles.cell, { textAlign: 'right' }]}>{item.balance.toFixed(1)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Custom Header with Back Button */}
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Dairy Statement</Text>
      </View>

      {/* Account Info */}
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>
          {accountId} - {accountName}
        </Text>
      </View>

      {/* Data List */}
      <View style={styles.listContainer}>
        <FlatList
          data={processedData}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={ListHeader}
          stickyHeaderIndices={[0]} // Make the header sticky
          ListEmptyComponent={
            !loading ? <Text style={styles.emptyText}>No transactions found.</Text> : null
          }
        />
        {loading && <ActivityIndicator size="large" style={{ marginTop: 50 }} />}
      </View>
      
      {/* Footer with Total Balance */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Balance:</Text>
        <Text style={styles.footerBalance}>{totalBalance.toFixed(1)}</Text>
      </View>
    </SafeAreaView>
  );
}

// Styles based on userhistory.jpeg
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 10,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  accountInfo: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    flex: 1,
  },
  headerRow: {
    backgroundColor: '#78D1E8', // Light blue from design
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerText: {
    color: '#3A4A64', // Dark blue from design
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingHorizontal: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});