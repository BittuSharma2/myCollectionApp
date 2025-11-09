import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
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
import CustomHeader from '../../../components/CustomHeader';
import SearchBar from '../../../components/SearchBar';
import { supabase } from '../../../lib/supabase';

// Define the type for our Profile data
type Profile = {
  id: string; // This is the UUID
  username: string;
  role: string;
};

export default function UsersScreen() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // This function fetches all 'user' profiles from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, role')
      .eq('role', 'user'); // Only fetch users, not other admins

    if (error) {
      console.error('Error fetching users:', error.message);
      alert('Failed to fetch users');
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  // useFocusEffect runs every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // This is the component for each item in the list
  const renderUserItem = ({ item }: { item: Profile }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemIcon}>
        <Ionicons name="person-circle" size={40} color="#78D1E8" />
      </View>
      <View style={styles.itemMiddle}>
        <Text style={styles.itemName}>{item.username}</Text>
      </View>
      <View style={styles.itemActions}>
        <Pressable style={styles.actionButton} onPress={() => alert('Edit user: ' + item.username)}>
          <Ionicons name="pencil" size={24} color="#007AFF" />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => alert('Delete user: ' + item.username)}>
          <Ionicons name="trash" size={24} color="#FF3B30" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <CustomHeader title="User Management" />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="User Name"
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found.</Text>
          }
        />
      )}
      
      {/* --- Add User Button --- */}
      <Pressable 
        style={styles.fab} 
        onPress={() => alert('Add User Modal will go here')}
      >
        <Ionicons name="add" size={30} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

// Add styles
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  itemActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 20,
    padding: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  // Floating Action Button (FAB) for "Add User"
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: '#4A00E0', // Purple
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});