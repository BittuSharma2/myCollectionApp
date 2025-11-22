import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

import AddCollectionModal from '../../../components/AddCollectionModal';
import AddDebitModal from '../../../components/AddDebitModal';
import AgentPickerModal from '../../../components/AgentPickerModal';
import CustomHeader from '../../../components/CustomHeader';
import SearchBar from '../../../components/SearchBar';
import { Colors } from '../../../constants/theme';

type Agent = { id: string; username: string };
type Customer = {
  id: number;
  name: string;
  shop_name: string;
  agent_id: string | null;
  initial_amount: number;
  profiles: { username: string } | null;
};
type SimplifiedCustomer = { id: number; name: string };

export default function CustomersScreen() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [balances, setBalances] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [optionsVisibleFor, setOptionsVisibleFor] = useState<number | null>(null);
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<SimplifiedCustomer | null>(null);
  
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string | null>('all');
  const [selectedAgentName, setSelectedAgentName] = useState('All Customers');
  
  const [isDebitModalVisible, setIsDebitModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);

  // --- 1. Fetch Agents (For Admin Filter) ---
  const fetchAgentsForFilter = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('role', 'user');
    if (data) setAgentsList(data);
  };

  // --- 2. Fetch Customers (Optimized for Smooth Updates) ---
  const fetchCustomers = async (isSilentRefresh = false) => {
    if (!profile) return;
    
    // UX IMPROVEMENT: Only show spinner if list is empty and NOT a silent update
    // This prevents the list from "flashing" or disappearing during updates
    if (!isSilentRefresh && customers.length === 0) {
      setLoading(true);
    }

    // NOTE: We removed setCustomers([]) here to keep the old list visible while loading new data

    let query = supabase.from('customers').select(`
        id, name, shop_name, agent_id,
        initial_amount,
        profiles ( username )
      `);

    if (isAdmin) {
      if (selectedAgentFilter === null) {
        query = query.is('agent_id', null);
      } else if (selectedAgentFilter !== 'all') {
        query = query.eq('agent_id', selectedAgentFilter);
      }
    }

    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);

    const { data: customerData, error } = await query
      .order('name', { ascending: true })
      .returns<Customer[]>();

    if (error) {
      console.error('Error fetching customers:', error.message);
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    // --- CALCULATE BALANCES ---
    if (customerData && customerData.length > 0) {
      const customerIds = customerData.map((c) => c.id);
      const { data: transactions, error: balanceError } = await supabase
        .from('transactions')
        .select('account_id, amount')
        .in('account_id', customerIds);

      if (balanceError) {
        console.error('Error fetching balances:', balanceError.message);
      }

      const balanceMap = new Map<number, number>();
      
      // 1. Start with Initial Amount
      for (const customer of customerData) {
        balanceMap.set(customer.id, customer.initial_amount || 0);
      }

      // 2. Add Transactions
      if (transactions) {
        for (const transaction of transactions) {
          const currentBalance = balanceMap.get(transaction.account_id) || 0;
          balanceMap.set(
            transaction.account_id,
            currentBalance + transaction.amount
          );
        }
      }
      setBalances(balanceMap);
      setCustomers(customerData);
    } else {
      setCustomers([]);
      setBalances(new Map());
    }
    
    setLoading(false);
    setIsRefreshing(false);
  };

  // Initial Load of Agents
  useEffect(() => {
    if (isAdmin) fetchAgentsForFilter();
  }, [isAdmin]);

  // Auto-refresh list when filters change
  useFocusEffect(
    useCallback(() => {
      fetchCustomers(false);
    }, [profile, selectedAgentFilter, searchQuery])
  );

  // --- 3. Pull-to-Refresh Logic ---
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const promises = [fetchCustomers(true)]; // Silent refresh
    if (isAdmin) {
      promises.push(fetchAgentsForFilter());
    }
    await Promise.all(promises);
    setIsRefreshing(false);
  }, [profile, selectedAgentFilter, searchQuery, isAdmin]);

  // (Handlers)
  const handleStatePress = (customer: Customer) => {
    router.push({ pathname: '/(app)/customer_profile' as any, params: { customerId: customer.id } });
    setOptionsVisibleFor(null);
  };
  const handleViewPress = (customer: Customer) => {
    router.push({ pathname: '/(app)/customer_profile' as any, params: { customerId: customer.id } });
    setOptionsVisibleFor(null);
  };
  
  const handleCollectPress = (customer: Customer) => {
    setSelectedCustomer({ id: customer.id, name: customer.name });
    setIsCollectionModalVisible(true);
    setOptionsVisibleFor(null);
  };
  
  // --- THE FIX: Silent Refresh on Success ---
  const onCollectionSuccess = () => {
    setIsCollectionModalVisible(false);
    setSelectedCustomer(null);
    fetchCustomers(true); // True = Update balances without loading spinner
  };

  const handleDebitPress = (customer: Customer) => {
    setSelectedCustomer({ id: customer.id, name: customer.name });
    setIsDebitModalVisible(true);
    setOptionsVisibleFor(null);
  };

  // --- THE FIX: Silent Refresh on Success ---
  const onDebitSuccess = () => {
    setIsDebitModalVisible(false);
    setSelectedCustomer(null);
    fetchCustomers(true); // True = Update balances without loading spinner
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    filterContainer: {
      paddingHorizontal: 15,
      paddingTop: 10,
      backgroundColor: themeColors.background,
    },
    filterLabel: { fontSize: 14, color: themeColors.textSecondary },
    pickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      borderRadius: 8,
      marginTop: 5,
      backgroundColor: themeColors.card,
      padding: 15,
      height: 55,
    },
    pickerButtonText: {
      fontSize: 16,
      color: themeColors.text,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
    itemContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.card,
      borderRadius: 10,
      padding: 15,
      marginHorizontal: 15,
      marginVertical: 5,
      elevation: 1,
      minHeight: 70,
    },
    itemMiddle: { flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: themeColors.text },
    itemSubtitle: { fontSize: 14, color: themeColors.textSecondary },
    itemAgent: {
      fontSize: 13,
      color: themeColors.tint,
      fontStyle: 'italic',
      marginTop: 2,
    },
    itemActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      minWidth: 90,
    },
    actionButton: { marginHorizontal: 10, alignItems: 'center' },
    actionText: { fontSize: 12, color: themeColors.textSecondary, marginTop: 2 },
    balanceContainer: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      minWidth: 90,
    },
    balanceText: { fontSize: 16, fontWeight: 'bold', color: themeColors.text },
    fab: {
      position: 'absolute',
      right: 25,
      bottom: 25,
      backgroundColor: themeColors.tint,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
    },
  });

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    const isSelected = optionsVisibleFor === item.id;
    const agentName = item.profiles?.username || 'Unassigned';
    const totalBalance = balances.get(item.id) || item.initial_amount || 0;

    return (
      <Pressable
        style={styles.itemContainer}
        onPress={() => setOptionsVisibleFor(isSelected ? null : item.id)}>
        <View style={styles.itemMiddle}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.shop_name}</Text>
          {isAdmin && <Text style={styles.itemAgent}>{agentName}</Text>}
        </View>
        <View style={styles.itemActions}>
          {isSelected ? (
            isAdmin ? (
              <>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleDebitPress(item)}>
                  <Ionicons
                    name="remove-circle-outline"
                    size={24}
                    color={themeColors.danger}
                  />
                  <Text style={[styles.actionText, { color: themeColors.danger }]}>
                    Debit...
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleViewPress(item)}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={themeColors.tint}
                  />
                  <Text
                    style={[styles.actionText, { color: themeColors.tint }]}>
                    View...
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleCollectPress(item)}>
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={themeColors.tint}
                  />
                  <Text style={styles.actionText}>Collect...</Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleStatePress(item)}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color="#34C759"
                  />
                  <Text style={styles.actionText}>State...</Text>
                </Pressable>
              </>
            )
          ) : (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>
                ₹{(totalBalance || 0).toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title={isAdmin ? 'Customers' : 'My Customers'} />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search by Customer Name"
      />

      {isAdmin && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Agent:</Text>
          <Pressable
            style={styles.pickerButton}
            onPress={() => setIsAgentModalVisible(true)}>
            <Text style={styles.pickerButtonText}>{selectedAgentName}</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={themeColors.textSecondary}
            />
          </Pressable>
        </View>
      )}

      {loading && !isRefreshing ? (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 50 }}
          color={themeColors.tint}
        />
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No customers found.</Text>
          }
          onScroll={() => setOptionsVisibleFor(null)}
          style={{ backgroundColor: themeColors.background }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[themeColors.text]}
              tintColor={themeColors.text}
              progressBackgroundColor={themeColors.card}
            />
          }
        />
      )}

      <AddCollectionModal
        visible={isCollectionModalVisible}
        onClose={() => setIsCollectionModalVisible(false)}
        account={selectedCustomer}
        onSuccess={onCollectionSuccess}
      />
      <AddDebitModal
        visible={isDebitModalVisible}
        onClose={() => setIsDebitModalVisible(false)}
        account={selectedCustomer}
        onSuccess={onDebitSuccess}
      />
      <AgentPickerModal
        visible={isAgentModalVisible}
        onClose={() => setIsAgentModalVisible(false)}
        title="Filter by Agent"
        agents={agentsList}
        currentSelectionId={selectedAgentFilter}
        showAllOption={true}
        showNoneOption={true}
        onSelect={(selection) => {
          setSelectedAgentFilter(selection.id);
          setSelectedAgentName(selection.name);
        }}
      />

      {isAdmin && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(app)/add_customer' as any)}>
          <Ionicons
            name="add"
            size={30}
            color={themeColors.buttonPrimaryText}
          />
        </Pressable>
      )}
    </SafeAreaView>
  );
}