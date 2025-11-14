import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme, // <-- Import for theme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import SearchBar from '../../../components/SearchBar';
import { Colors } from '../../../constants/theme'; // <-- Import your new theme
import { supabase } from '../../../lib/supabase';

// (Agent type is unchanged)
type Agent = {
  id: string;
  username: string;
  role: string;
  mobile_no: string | null;
  address: string | null;
  aadhar_card_no: string | null;
};

export default function AgentsScreen() {
  const router = useRouter();

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  // (State is unchanged)
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // (All data functions are unchanged)
  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, role, mobile_no, address, aadhar_card_no')
      .eq('role', 'user');

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

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) =>
      agent.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agents, searchQuery]);

  const handleViewAgent = (agent: Agent) => {
    router.push({
      pathname: '/agent_profile',
      params: { agentId: agent.id },
    });
  };

  // --- NEW: Dynamic styles ---
  // We move styles inside the component to access themeColors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background, // Dynamic
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.card, // Dynamic
      borderRadius: 10,
      padding: 10,
      marginHorizontal: 15,
      marginVertical: 5,
      elevation: 1,
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
      color: themeColors.text, // Dynamic
    },
    itemSubtitle: {
      fontSize: 14,
      color: themeColors.textSecondary, // Dynamic
    },
    viewButton: {
      backgroundColor: themeColors.tint, // Dynamic
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    viewButtonText: {
      color: themeColors.buttonPrimaryText, // Dynamic
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary, // Dynamic
    },
    fab: {
      position: 'absolute',
      right: 25,
      bottom: 25,
      backgroundColor: themeColors.tint, // Dynamic
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
    },
  });
  // --- END NEW STYLES ---

  const renderAgentItem = ({ item }: { item: Agent }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemIcon}>
        <Ionicons
          name="person-circle"
          size={40}
          color={themeColors.icon} // Dynamic
        />
      </View>
      <View style={styles.itemMiddle}>
        <Text style={styles.itemName}>{item.username}</Text>
        <Text style={styles.itemSubtitle}>{item.mobile_no || 'No mobile'}</Text>
      </View>
      <Pressable
        style={styles.viewButton}
        onPress={() => handleViewAgent(item)}>
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
        <ActivityIndicator
          size="large"
          style={{ marginTop: 50 }}
          color={themeColors.tint} // Dynamic
        />
      ) : (
        <FlatList
          data={filteredAgents}
          renderItem={renderAgentItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No agents found.</Text>
          }
          style={{ backgroundColor: themeColors.background }} // Dynamic
        />
      )}

      {/* --- FAB to add agent --- */}
      <Pressable style={styles.fab} onPress={() => router.push('/add_agent')}>
        <Ionicons
          name="add"
          size={30}
          color={themeColors.buttonPrimaryText} // Dynamic
        />
      </Pressable>
    </SafeAreaView>
  );
}