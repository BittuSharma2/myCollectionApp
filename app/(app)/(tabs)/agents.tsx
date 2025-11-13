import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // Import useRouter
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddAgentModal from '../../../components/AddAgentModal'; // <-- Import new modal
import CustomHeader from '../../../components/CustomHeader';
import SearchBar from '../../../components/SearchBar';
import { supabase } from '../../../lib/supabase';

// Define the type for our Profile data (now 'Agent')
type Agent = {
  id: string; // This is the UUID
  username: string;
  role: string;
  mobile_no: string | null;
  address: string | null;
  aadhar_card_no: string | null;
};

export default function AgentsScreen() {
  const router = useRouter(); // For navigation
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for the modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // This function fetches all 'user' (agent) profiles
  const fetchAgents = async () => {
    setLoading(true);
    
    // Select all the new fields
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, role, mobile_no, address, aadhar_card_no')
      .eq('role', 'user'); // 'user' role is our 'agent'

    if (error) {
      console.error('Error fetching agents:', error.message);
      alert('Failed to fetch agents');
    } else {
      setAgents(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAgents();
    }, [])
  );
  
  const onAgentAdded = () => {
    fetchAgents(); // Refresh the list
  };

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    return agents.filter(agent =>
      agent.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agents, searchQuery]);
  
  // --- NEW: Handle View Button Press ---
  const handleViewAgent = (agent: Agent) => {
    // We will create this screen next.
    // We pass the agent's ID to the new screen.
    router.push({
      pathname: '/agent_profile', 
      params: { agentId: agent.id }
    });
  };

  // This is the component for each item in the list
  const renderAgentItem = ({ item }: { item: Agent }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemIcon}>
        <Ionicons name="person-circle" size={40} color="#78D1E8" />
      </View>
      <View style={styles.itemMiddle}>
        <Text style={styles.itemName}>{item.username}</Text>
        <Text style={styles.itemSubtitle}>{item.mobile_no || 'No mobile'}</Text>
      </View>
      {/* --- NEW: View Button --- */}
      <Pressable 
        style={styles.viewButton} 
        onPress={() => handleViewAgent(item)}
      >
        <Text style={styles.viewButtonText}>View</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title="Agent Management" />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Agent Name"
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredAgents}
          renderItem={renderAgentItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No agents found.</Text>
          }
        />
      )}
      
      {/* --- FAB to add agent --- */}
      <Pressable 
        style={styles.fab} 
        onPress={() => setIsModalVisible(true)} // Open the modal
      >
        <Ionicons name="add" size={30} color="white" />
      </Pressable>
      
      {/* --- Add The Modal --- */}
      <AddAgentModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={onAgentAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 15,
    marginVertical: 5,
    elevation: 2,
  },
  itemIcon: {
    marginRight: 10,
  },
  itemMiddle: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // --- NEW STYLES ---
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
  // ---
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