import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// (Types are unchanged)
type Customer = {
  id: number;
  name: string;
  shop_name: string;
  mobile_no: string;
  aadhar_card_no: string;
  pan_card_no: string;
  address: string;
  agent_id: string | null;
  initial_amount: number;
  profiles: { username: string } | null;
};
type Transaction = { id: number; created_at: string; amount: number };

// --- Theme-aware DetailRow Component ---
const DetailRow = ({
  label,
  value,
  themeColors,
}: {
  label: string;
  value: string | null | undefined;
  themeColors: any;
}) => (
  <View style={[styles.row, { borderBottomColor: themeColors.borderColor }]}>
    <Text style={[styles.label, { color: themeColors.textSecondary }]}>
      {label}
    </Text>
    <Text style={[styles.value, { color: themeColors.text }]}>
      {value || 'N/A'}
    </Text>
  </View>
);

// --- UPDATED: History List Header (with Debit/Credit) ---
const ListHeader = ({ themeColors }: { themeColors: any }) => (
  <View
    style={[
      styles.historyRow,
      styles.headerRow,
      {
        backgroundColor: themeColors.input,
        borderBottomColor: themeColors.borderColor,
      },
    ]}>
    <Text style={[styles.cell, styles.headerText, { color: themeColors.text, flex: 0.5 }]}>Sr</Text>
    <Text style={[styles.cell, styles.headerText, { color: themeColors.text, flex: 1.2 }]}>Date</Text>
    <Text style={[styles.cell, styles.headerText, { color: themeColors.text }]}>Txn No</Text>
    <Text style={[styles.cell, styles.headerText, { color: themeColors.text, textAlign: 'right' }]}>Debit</Text>
    <Text style={[styles.cell, styles.headerText, { color: themeColors.text, textAlign: 'right' }]}>Credit</Text>
    <Text style={[styles.cell, styles.headerText, { color: themeColors.text, textAlign: 'right' }]}>Balance</Text>
  </View>
);

export default function CustomerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // (State is unchanged)
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const fetchData = async () => {
    if (!customerId) return;
    setLoading(true);
    const [customerPromise, transPromise] = await Promise.all([
      supabase
        .from('customers')
        .select(`*, profiles ( username )`)
        .eq('id', customerId)
        .single(),
      supabase
        .from('transactions')
        .select('id, created_at, amount')
        .eq('account_id', customerId)
        .order('created_at', { ascending: true }),
    ]);
    if (customerPromise.error) {
      Alert.alert('Error', 'Failed to fetch customer data');
    } else {
      setCustomer(customerPromise.data as Customer);
    }
    if (transPromise.error) {
      console.error('Error fetching transactions:', transPromise.error.message);
    } else {
      setTransactions(transPromise.data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [customerId])
  );

  const handleDeleteCustomer = () => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteCustomer },
      ]
    );
  };

  // (Using the simple delete function, as requested)
  const deleteCustomer = async () => {
    if (!customer) return;
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id);
    if (error) {
      Alert.alert('Error', 'Failed to delete customer.');
    } else {
      Alert.alert('Success', 'Customer deleted.');
      router.back();
    }
  };

  // --- UPDATED: Data processing (with Debit/Credit) ---
  let runningBalance = customer?.initial_amount || 0;
  const processedData = transactions.map((item, index) => {
    runningBalance += item.amount;
    const isDebit = item.amount < 0;
    return {
      ...item,
      sr: index + 1,
      date: new Date(item.created_at).toLocaleDateString('en-IN'),
      credit: isDebit ? 0 : item.amount,
      debit: isDebit ? Math.abs(item.amount) : 0,
      balance: runningBalance,
    };
  });
  const totalBalance = runningBalance;

  // --- UPDATED: renderItem (with Debit/Credit) ---
  const renderItem = ({ item }: { item: (typeof processedData)[0] }) => (
    <View
      style={[
        styles.historyRow,
        { borderBottomColor: themeColors.borderColor },
      ]}>
      <Text style={[styles.cell, { color: themeColors.text, flex: 0.5 }]}>
        {item.sr}
      </Text>
      <Text style={[styles.cell, { color: themeColors.text, flex: 1.2 }]}>
        {item.date}
      </Text>
      <Text style={[styles.cell, { color: themeColors.text }]}>{item.id}</Text>
      <Text
        style={[styles.cell, { color: themeColors.danger, textAlign: 'right' }]}>
        {item.debit > 0 ? item.debit.toFixed(1) : '-'}
      </Text>
      <Text
        style={[styles.cell, { color: 'green', textAlign: 'right' }]}>
        {item.credit > 0 ? item.credit.toFixed(1) : '-'}
      </Text>
      <Text
        style={[styles.cell, { color: themeColors.text, textAlign: 'right' }]}>
        {item.balance.toFixed(1)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.formBackground }]}
      edges={['top', 'left', 'right']}>
      <View
        style={[
          styles.customHeader,
          {
            paddingTop: insets.top,
            backgroundColor: themeColors.header,
            borderBottomColor: themeColors.borderColor,
          },
        ]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {isAdmin ? 'Customer Profile' : 'Statement'}
        </Text>
        <View style={{ flex: 1 }} />
        {isAdmin && (
          <Pressable
            onPress={() => setIsProfileVisible(!isProfileVisible)}
            style={styles.headerIconButton}>
            <Ionicons
              name={isProfileVisible ? 'person' : 'person-outline'}
              size={26}
              color={themeColors.tint}
            />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          style={{ flex: 1 }}
          color={themeColors.tint}
        />
      ) : customer ? (
        <ScrollView>
          {isAdmin && (
            <>
              {isProfileVisible && (
                <>
                  <View
                    style={[
                      styles.profileCard,
                      { backgroundColor: themeColors.card },
                    ]}>
                    <Ionicons
                      name="person-circle"
                      size={80}
                      color={themeColors.icon}
                    />
                    <Text
                      style={[styles.customerName, { color: themeColors.text }]}>
                      {customer.name}
                    </Text>
                    <Text
                      style={[
                        styles.customerSubtitle,
                        { color: themeColors.textSecondary },
                      ]}>
                      {customer.shop_name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailsContainer,
                      { backgroundColor: themeColors.card },
                    ]}>
                    <DetailRow
                      label="Assigned Agent"
                      value={customer.profiles?.username}
                      themeColors={themeColors}
                    />
                    <DetailRow
                      label="Mobile No"
                      value={customer.mobile_no}
                      themeColors={themeColors}
                    />
                    <DetailRow
                      label="Address"
                      value={customer.address}
                      themeColors={themeColors}
                    />
                    <DetailRow
                      label="Aadhar No"
                      value={customer.aadhar_card_no}
                      themeColors={themeColors}
                    />
                    <DetailRow
                      label="PAN No"
                      value={customer.pan_card_no}
                      themeColors={themeColors}
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <Pressable
                      style={[
                        styles.button,
                        { backgroundColor: themeColors.buttonPrimary },
                      ]}
                      onPress={() =>
                        // --- (THE FIX) ---
                        // Corrected navigation path
                        router.push({
                          pathname: '/(app)/edit_customer' as any,
                          params: { customerId: customer.id },
                        })
                        // --- (END FIX) ---
                      }>
                      <Ionicons
                        name="pencil"
                        size={20}
                        color={themeColors.buttonPrimaryText}
                      />
                      <Text
                        style={[
                          styles.buttonText,
                          { color: themeColors.buttonPrimaryText },
                        ]}>
                        Edit Details
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.button,
                        { backgroundColor: themeColors.danger },
                      ]}
                      onPress={handleDeleteCustomer}>
                      <Ionicons
                        name="trash"
                        size={20}
                        color={themeColors.buttonPrimaryText}
                      />
                      <Text
                        style={[
                          styles.buttonText,
                          { color: themeColors.buttonPrimaryText },
                        ]}>
                        Delete Customer
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </>
          )}

          <Text style={[styles.historyTitle, { color: themeColors.text }]}>
            Transaction History
          </Text>
          {!isAdmin && (
            <Text
              style={[
                styles.agentCustomerName,
                { color: themeColors.textSecondary },
              ]}>
              {customer.name}
            </Text>
          )}
          <View
            style={[
              styles.listContainer,
              { backgroundColor: themeColors.card },
            ]}>
            <ListHeader themeColors={themeColors} />
            {transactions.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  { color: themeColors.textSecondary },
                ]}>
                No transactions found.
              </Text>
            ) : (
              <FlatList
                data={processedData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            )}
          </View>
          <View
            style={[
              styles.footer,
              {
                backgroundColor: themeColors.formBackground,
                borderTopColor: themeColors.borderColor,
              },
            ]}>
            <Text style={[styles.footerText, { color: themeColors.text }]}>
              Opening:
            </Text>
            <Text style={[styles.footerBalance, { color: themeColors.text }]}>
              {(customer.initial_amount || 0).toFixed(1)}
            </Text>
          </View>
          <View
            style={[
              styles.footer,
              {
                backgroundColor: themeColors.formBackground,
                borderTopColor: themeColors.borderColor,
              },
            ]}>
            <Text style={[styles.footerText, { color: themeColors.text }]}>
              Total Balance:
            </Text>
            <Text style={[styles.footerBalance, { color: themeColors.text }]}>
              {totalBalance.toFixed(1)}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          Customer not found.
        </Text>
      )}
    </SafeAreaView>
  );
}

// (Styles are unchanged)
const styles = StyleSheet.create({
  container: { flex: 1 },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: { padding: 10, marginLeft: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  headerIconButton: { padding: 10, marginRight: 10 },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    elevation: 3,
  },
  customerName: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  customerSubtitle: { fontSize: 16, marginTop: 4 },
  detailsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  label: { fontSize: 16 },
  value: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  buttonContainer: { marginTop: 30, paddingHorizontal: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  buttonText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  emptyText: { textAlign: 'center', padding: 30, fontSize: 16 },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  agentCustomerName: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 5,
    elevation: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  headerRow: { paddingVertical: 12, borderBottomWidth: 2 },
  historyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerText: { fontWeight: 'bold', fontSize: 12 },
  cell: { flex: 1, fontSize: 12, paddingHorizontal: 2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    marginHorizontal: 10,
    marginBottom: 2,
  },
  footerText: { fontSize: 16, fontWeight: 'bold' },
  footerBalance: { fontSize: 16, fontWeight: 'bold' },
});