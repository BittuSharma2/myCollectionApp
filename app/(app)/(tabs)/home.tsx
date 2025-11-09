import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

// Import our custom components
import AddAccountModal from '../../../components/AddAccountModal';
import AddCollectionModal from '../../../components/AddCollectionModal';
import CustomHeader from '../../../components/CustomHeader';
import EditAccountModal from '../../../components/EditAccountModal'; // <-- Import new modal
import SearchBar from '../../../components/SearchBar';

// Define the type for our Account data
type Account = {
  id: number;
  name: string;
  account_number: string | null;
  balance: number; // This is still our placeholder balance
};

export default function HomeScreen() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- State for Modals ---
  const [optionsVisibleFor, setOptionsVisibleFor] = useState<number | null>(null);
  
  // User's "Add Collection" modal
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Admin's "Add Account" modal
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);

  // --- NEW: Admin's "Edit Account" modal ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);


  // This function fetches the data from Supabase
  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, account_number');

    if (error) {
      console.error('Error fetching accounts:', error.message);
    } else if (data) {
      const accountsWithBalance = data.map(acc => ({
        ...acc,
        balance: Math.floor(Math.random() * 5000) - 1000, // Placeholder
      }));
      setAccounts(accountsWithBalance);
    }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchAccounts(); }, []));

  // Filter accounts based on search query
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [accounts, searchQuery]);
  
  // --- Handlers ---
  
  // USER Handlers
  const handleCollectPress = (account: Account) => {
    setSelectedAccount(account);
    setIsCollectionModalVisible(true);
    setOptionsVisibleFor(null);
  };
  const handleStatePress = (account: Account) => {
    router.push({
      pathname: '/statement',
      params: { accountId: account.id, accountName: account.name }
    });
    setOptionsVisibleFor(null);
  };

  // --- UPDATED: ADMIN Handlers ---
  const handleEditPress = (account: Account) => {
    setAccountToEdit(account); // Set the account to edit
    setIsEditModalVisible(true); // Open the edit modal
    setOptionsVisibleFor(null);
  };
  const handleDeletePress = (account: Account) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete ${account.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAccount(account.id) }
      ]
    );
    setOptionsVisibleFor(null);
  };

  const deleteAccount = async (id: number) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) {
      Alert.alert('Error', 'Failed to delete account.');
    } else {
      fetchAccounts(); // Refresh the list
    }
  };
  
  // --- Modal Success Handlers ---
  const onCollectionSuccess = () => {
    setIsCollectionModalVisible(false);
    setSelectedAccount(null);
    fetchAccounts();
  };
  const onAccountSuccess = () => {
    setIsAccountModalVisible(false);
    fetchAccounts();
  };
  // --- NEW: Edit Modal Success ---
  const onEditSuccess = () => {
    setIsEditModalVisible(false);
    setAccountToEdit(null);
    fetchAccounts();
  };

  // --- Render Functions ---
  const renderAccountItem = ({ item }: { item: Account }) => {
    const isSelected = optionsVisibleFor === item.id;

    // Show "Edit/Delete" for Admins
    if (isAdmin) {
      return (
        <Pressable
          style={styles.itemContainer}
          onPress={() => setOptionsVisibleFor(isSelected ? null : item.id)}>
          <View style={styles.itemLeft}>
            <Text style={styles.itemNumber}>{item.account_number || item.id}</Text>
          </View>
          <View style={styles.itemMiddle}>
            <Text style={styles.itemName}>{item.name}</Text>
          </View>
          {isSelected ? (
            <View style={styles.itemActions}>
              <Pressable style={styles.actionButton} onPress={() => handleEditPress(item)}>
                <Ionicons name="pencil-outline" size={24} color="#007AFF" />
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={() => handleDeletePress(item)}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                <Text style={styles.actionText}>Delete</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.itemRight}>
              <Text style={styles.itemBalance}>{item.balance.toFixed(1)}</Text>
            </View>
          )}
        </Pressable>
      );
    }
    
    // Show "Collect/State" for Users (default)
    return (
      <Pressable
        style={styles.itemContainer}
        onPress={() => setOptionsVisibleFor(isSelected ? null : item.id)}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemNumber}>{item.account_number || item.id}</Text>
        </View>
        <View style={styles.itemMiddle}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
        {isSelected ? (
          <View style={styles.itemActions}>
            <Pressable style={styles.actionButton} onPress={() => handleCollectPress(item)}>
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Collect...</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => handleStatePress(item)}>
              <Ionicons name="document-text-outline" size={24} color="#34C759" />
              <Text style={styles.actionText}>State...</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.itemRight}>
            <Text style={styles.itemBalance}>{item.balance.toFixed(1)}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title={isAdmin ? 'Account Management' : 'Daily Collection'} />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder={isAdmin ? "Account Name" : "Client Name"}
      />

      <Text style={styles.listTitle}>
        {isAdmin ? 'All Accounts' : 'List of Dairy'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredAccounts}
          renderItem={renderAccountItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No accounts found.</Text>
          }
          onScroll={() => setOptionsVisibleFor(null)} 
        />
      )}

      {/* --- Modals --- */}
      <AddCollectionModal
        visible={isCollectionModalVisible}
        onClose={() => setIsCollectionModalVisible(false)}
        account={selectedAccount}
        onSuccess={onCollectionSuccess}
      />
      <AddAccountModal
        visible={isAccountModalVisible}
        onClose={() => setIsAccountModalVisible(false)}
        onSuccess={onAccountSuccess}
      />
      {/* --- NEW: Add the Edit Modal --- */}
      <EditAccountModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        account={accountToEdit}
        onSuccess={onEditSuccess}
      />

      {/* --- Admin FAB to Add Account --- */}
      {isAdmin && (
        <Pressable 
          style={styles.fab} 
          onPress={() => setIsAccountModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="white" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

// (Styles are unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A00E0',
    textAlign: 'center',
    marginVertical: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 70,
  },
  itemLeft: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  itemNumber: {
    fontSize: 14,
    color: '#666',
  },
  itemMiddle: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemRight: {
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  itemBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#4A00E0',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});