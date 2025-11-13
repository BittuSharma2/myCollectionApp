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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EditAgentModal from '../components/EditAgentModal';
import { supabase } from '../lib/supabase';

// (Types are unchanged)
type Agent = {
  id: string;
  username: string;
  email: string | null;
  mobile_no: string | null;
  address: string | null;
  aadhar_card_no: string | null;
};
type Customer = {
  id: number;
  name: string;
  shop_name: string;
};

// (DetailRow helper is unchanged)
const DetailRow = ({ label, value }: { label: string, value: string | null | undefined }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

export default function AgentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { agentId } = useLocalSearchParams<{ agentId: string }>();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false); // State is still needed

  // (fetchData, handleDeleteAgent, deleteProfile are unchanged)
  const fetchData = async () => {
    if (!agentId) return;
    setLoading(true);
    const [agentPromise, customersPromise] = await Promise.all([
      supabase.from('profiles').select('id, username, email, mobile_no, address, aadhar_card_no').eq('id', agentId).single(),
      supabase.from('customers').select('id, name, shop_name').eq('agent_id', agentId).order('name', { ascending: true })
    ]);
    if (agentPromise.error) {
      console.error('Error fetching agent:', agentPromise.error.message);
      Alert.alert('Error', 'Failed to fetch agent data');
    } else { setAgent(agentPromise.data); }
    if (customersPromise.error) {
      console.error('Error fetching customers:', customersPromise.error.message);
      Alert.alert('Error', 'Failed to fetch customer list');
    } else { setCustomers(customersPromise.data || []); }
    setLoading(false);
  };
  useFocusEffect(useCallback(() => { fetchData(); }, [agentId]));
  const handleDeleteAgent = () => {
    Alert.alert('Delete Agent', `Are you sure you want to delete ${agent?.username}?`,
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: deleteProfile }]
    );
  };
  const deleteProfile = async () => {
    if (!agent) return;
    const { error } = await supabase.from('profiles').delete().eq('id', agent.id);
    if (error) { Alert.alert('Error', 'Failed to delete agent profile.'); }
    else { Alert.alert('Success', 'Agent profile deleted.'); router.back(); }
  };
  
  // (renderCustomerItem is unchanged)
  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <View style={styles.customerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerShop}>{item.shop_name}</Text>
      </View>
      <Pressable style={styles.viewButton} onPress={() => router.push({ pathname: '/customer_profile', params: { customerId: item.id } })}>
        <Text style={styles.viewButtonText}>View</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* --- HEADER (NOW WITH ICON BUTTON) --- */}
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Agent Profile</Text>
        
        {/* Spacer to push icon to the right */}
        <View style={{ flex: 1 }} /> 

        <Pressable 
          onPress={() => setIsProfileVisible(!isProfileVisible)} 
          style={styles.headerIconButton}
        >
          <Ionicons 
            name={isProfileVisible ? "person" : "person-outline"} 
            size={26} 
            color="#4A00E0" 
          />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ flex: 1 }} />
      ) : agent ? (
        <ScrollView>
          
          {/* --- REMOVED: The old text toggle button is gone --- */}

          {/* --- Conditional Profile Details --- */}
          {isProfileVisible && (
            <>
              <View style={styles.profileCard}>
                <Ionicons name="person-circle" size={80} color="#78D1E8" />
                <Text style={styles.agentName}>{agent.username}</Text>
                <Text style={styles.agentEmail}>{agent.email}</Text>
              </View>
              
              <View style={styles.detailsContainer}>
                <DetailRow label="Mobile No" value={agent.mobile_no} />
                <DetailRow label="Address" value={agent.address} />
                <DetailRow label="Aadhar No" value={agent.aadhar_card_no} />
              </View>
              
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.button, styles.editButton]} onPress={() => setIsModalVisible(true)}>
                  <Ionicons name="pencil" size={20} color="white" />
                  <Text style={styles.buttonText}>Edit Details</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDeleteAgent}>
                  <Ionicons name="trash" size={20} color="white" />
                  <Text style={styles.buttonText}>Delete Agent</Text>
                </Pressable>
              </View>
            </>
          )}
          
          {/* Assigned Customers List (always visible) */}
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Assigned Customers</Text>
            <FlatList
              data={customers}
              renderItem={renderCustomerItem}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={<Text style={styles.emptyText}>No customers assigned.</Text>}
              scrollEnabled={false}
            />
          </View>
          
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>Agent not found.</Text>
      )}
      
      <EditAgentModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => { fetchData(); setIsModalVisible(false); }}
        agent={agent}
      />
    </SafeAreaView>
  );
}

// --- STYLES (with new style added) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { padding: 10, marginLeft: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  // --- NEW: Header Icon Button Style ---
  headerIconButton: {
    padding: 10,
    marginRight: 10,
  },
  // ---
  profileCard: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20, // Added margin
    borderRadius: 10,
    elevation: 3,
  },
  agentName: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  agentEmail: { fontSize: 16, color: '#666', marginTop: 4 },
  detailsContainer: {
    backgroundColor: 'white',
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
    borderBottomColor: '#f0f0f0',
  },
  label: { fontSize: 16, color: '#555' },
  value: { fontSize: 16, fontWeight: '600', color: '#333', maxWidth: '60%' },
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
  editButton: { backgroundColor: '#4A00E0' },
  deleteButton: { backgroundColor: '#D9534F' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  emptyText: { textAlign: 'center', padding: 20, fontSize: 16, color: '#888' },
  listContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 30,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  customerShop: { fontSize: 14, color: '#666' },
  viewButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewButtonText: { color: '#4A00E0', fontWeight: 'bold', fontSize: 14 },
});