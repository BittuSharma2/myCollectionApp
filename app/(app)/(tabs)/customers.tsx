import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import AddCollectionModal from '../../../components/AddCollectionModal';
import AddCustomerModal from '../../../components/AddCustomerModal';
import CustomHeader from '../../../components/CustomHeader';
import SearchBar from '../../../components/SearchBar';

// Define the type for an Agent (for the filter list)
type Agent = {
  id: string;
  username: string;
};

// Define the type for our Customer data
type Customer = {
  id: number;
  name: string;
  shop_name: string;
  agent_id: string | null;
  profiles: { // This is an object, not an array
    username: string;
  } | null;
};

export default function CustomersScreen() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State for Modals
  const [optionsVisibleFor, setOptionsVisibleFor] = useState<number | null>(null);
  const [isCollectionModalVisible, setIsCollectionModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] = useState(false);
  
  // State for Admin Filter
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');

  // Fetch all agents (for the filter picker)
  const fetchAgentsForFilter = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('role', 'user');
    if (data) {
      setAgentsList(data);
    }
  };

  // Fetch customers based on the filter and search
  const fetchCustomers = async () => {
    if (!profile) return;
    setLoading(true);

    let query = supabase
      .from('customers')
      .select(`
        id, name, shop_name, agent_id,
        profiles ( username )
      `);

    if (isAdmin) {
      if (selectedAgentFilter === 'none') {
        query = query.is('agent_id', null);
      } else if (selectedAgentFilter !== 'all') {
        query = query.eq('agent_id', selectedAgentFilter);
      }
    } else {
      query = query.eq('agent_id', profile.id);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    // --- THIS IS THE FIX ---
    const { data, error } = await query
      .order('name', { ascending: true })
      .returns<Customer[]>(); // <-- Tell TS the correct return type
    // --- END FIX ---

    if (error) {
      console.error('Error fetching customers:', error.message);
    } else {
      setCustomers(data || []); // This will now be type-safe
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAgentsForFilter();
    }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [profile, selectedAgentFilter, searchQuery])
  );

  // --- Handlers ---
  const handleCollectPress = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCollectionModalVisible(true);
    setOptionsVisibleFor(null);
  };

  const handleStatePress = (customer: Customer) => {
    router.push({
      // This is correct, but TS is stale.
      pathname: '/customer_profile' as any, 
      params: { customerId: customer.id },
    });
    setOptionsVisibleFor(null);
  };
  
  const handleViewPress = (customer: Customer) => {
    router.push({
      // This is correct, but TS is stale.
      pathname: '/customer_profile' as any,
      params: { customerId: customer.id },
    });
    setOptionsVisibleFor(null);
  };

  // Modal Success Handlers
  const onCollectionSuccess = () => {
    setIsCollectionModalVisible(false);
    setSelectedCustomer(null);
  };
  const onCustomerAdded = () => {
    setIsAddCustomerModalVisible(false);
    fetchCustomers();
  };

  // --- Render Functions ---
  const renderCustomerItem = ({ item }: { item: Customer }) => {
    const isSelected = optionsVisibleFor === item.id;
    const agentName = item.profiles?.username || 'Unassigned';

    return (
      <Pressable
        style={styles.itemContainer}
        onPress={() => setOptionsVisibleFor(isSelected ? null : item.id)}>
        
        <View style={styles.itemMiddle}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.shop_name}</Text>
          {isAdmin && (
            <Text style={styles.itemAgent}>{agentName}</Text>
          )}
        </View>

        <View style={styles.itemActions}>
          {isSelected ? (
            isAdmin ? (
              <Pressable style={styles.viewButton} onPress={() => handleViewPress(item)}>
                <Text style={styles.viewButtonText}>View</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={styles.actionButton} onPress={() => handleCollectPress(item)}>
                  <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
                  <Text style={styles.actionText}>Collect...</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => handleStatePress(item)}>
                  <Ionicons name="document-text-outline" size={24} color="#34C759" />
                  <Text style={styles.actionText}>State...</Text>
                </Pressable>
              </>
            )
          ) : (
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          )}
        </View>
      </Pressable>
    );
  };
  
  // --- Main Render ---
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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedAgentFilter}
              onValueChange={(itemValue) => setSelectedAgentFilter(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="All Customers" value="all" />
              <Picker.Item label="Unassigned" value="none" />
              {agentsList.map((agent) => (
                <Picker.Item key={agent.id} label={agent.username} value={agent.id} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomerItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No customers found.</Text>
          }
          onScroll={() => setOptionsVisibleFor(null)} 
        />
      )}

      <AddCollectionModal
        visible={isCollectionModalVisible}
        onClose={() => setIsCollectionModalVisible(false)}
        account={selectedCustomer}
        onSuccess={onCollectionSuccess}
      />
      <AddCustomerModal
        visible={isAddCustomerModalVisible}
        onClose={() => setIsAddCustomerModalVisible(false)}
        onSuccess={onCustomerAdded}
      />

      {isAdmin && (
        <Pressable 
          style={styles.fab} 
          onPress={() => setIsAddCustomerModalVisible(true)}
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
  filterContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 5,
  },
  picker: {
    width: '100%',
    height: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    elevation: 2,
    minHeight: 70,
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
  itemSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  itemAgent: {
    fontSize: 13,
    color: '#4A00E0',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minWidth: 90,
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
  viewButton: {
    backgroundColor: '#4A00E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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