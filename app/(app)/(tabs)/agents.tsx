import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import CustomHeader from '../../../components/CustomHeader';
import SearchBar from '../../../components/SearchBar';
import { Colors } from '../../../constants/theme';
import { supabase } from '../../../lib/supabase';

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
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- 2. Add isRefreshing state ---
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- 4. Modify fetchAgents ---
  const fetchAgents = async () => {
    // Only show full-page loader on initial load
    if (!isRefreshing) {
      setLoading(true);
    }
    
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
    setIsRefreshing(false); // Stop refresh on success or error
  };

  useFocusEffect(
    useCallback(() => {
      fetchAgents();
    }, [])
  );

  // --- 3. Create onRefresh function ---
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAgents();
  }, []); // Dependency

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.card,
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
      color: themeColors.text,
    },
    itemSubtitle: {
      fontSize: 14,
      color: themeColors.textSecondary,
    },
    viewButton: {
      backgroundColor: themeColors.tint,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    viewButtonText: {
      color: themeColors.buttonPrimaryText,
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 30,
      fontSize: 16,
      color: themeColors.textSecondary,
    },
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

  const renderAgentItem = ({ item }: { item: Agent }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemIcon}>
        <Ionicons
          name="person-circle"
          size={40}
          color={themeColors.icon}
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

      {/* Show spinner only on initial load, not on refresh */}
      {loading && !isRefreshing ? (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 50 }}
          color={themeColors.tint}
        />
      ) : (
        <FlatList
          data={filteredAgents}
          renderItem={renderAgentItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No agents found.</Text>
          }
          style={{ backgroundColor: themeColors.background }}
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

      <Pressable style={styles.fab} onPress={() => router.push('/add_agent')}>
        <Ionicons
          name="add"
          size={30}
          color={themeColors.buttonPrimaryText}
        />
      </Pressable>
    </SafeAreaView>
  );
}