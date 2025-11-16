import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

// (Types are unchanged)
type Agent = {
  id: string;
  username: string;
  email: string | null;
  mobile_no: string | null;
  address: string | null;
  aadhar_card_no: string | null;
};
type Customer = { id: number; name: string; shop_name: string };

// (DetailRow component is unchanged)
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

export default function AgentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { agentId } = useLocalSearchParams<{ agentId: string }>();

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [agent, setAgent] = useState<Agent | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- (THE FIX) ---
  // 1. Profile is now HIDDEN by default
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  // --- (END FIX) ---

  // --- 2. Add isRefreshing state ---
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- 4. Modify fetchData ---
  const fetchData = async () => {
    if (!agentId) return;
    
    // Only show full-page loader on initial load
    if (!isRefreshing) {
      setLoading(true);
    }
    
    const [agentPromise, customersPromise] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, email, mobile_no, address, aadhar_card_no')
        .eq('id', agentId)
        .single(),
      supabase
        .from('customers')
        .select('id, name, shop_name')
        .eq('agent_id', agentId)
        .order('name', { ascending: true }),
    ]);
    if (agentPromise.error) {
      Alert.alert('Error', 'Failed to fetch agent data');
    } else {
      setAgent(agentPromise.data);
    }
    if (customersPromise.error) {
      Alert.alert('Error', 'Failed to fetch customer list');
    } else {
      setCustomers(customersPromise.data || []);
    }
    setLoading(false);
    setIsRefreshing(false); // Stop refresh on success or error
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [agentId])
  );
  
  // --- 3. Create onRefresh function ---
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [agentId]); // Dependency

  const handleDeleteAgent = () => {
    Alert.alert(
      'Delete Agent',
      `Are you sure you want to delete ${agent?.username}? This will un-assign all their customers and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProfile },
      ]
    );
  };

  const deleteProfile = async () => {
    if (!agent) return;
    const { error: updateError } = await supabase
      .from('customers')
      .update({ agent_id: null })
      .eq('agent_id', agent.id);

    if (updateError) {
      Alert.alert('Error', 'Failed to un-assign customers. Please try again.');
      return;
    }

    const { error: funcError } = await supabase.functions.invoke(
      'delete-user',
      { body: { user_id: agent.id } }
    );

    if (funcError) {
      Alert.alert('Error', `Failed to delete agent: ${funcError.message}`);
    } else {
      Alert.alert('Success', 'Agent deleted and customers un-assigned.');
      router.back();
    }
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <View
      style={[
        styles.customerRow,
        { borderBottomColor: themeColors.borderColor },
      ]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.customerName, { color: themeColors.text }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.customerShop, { color: themeColors.textSecondary }]}>
          {item.shop_name}
        </Text>
      </View>
      <Pressable
        style={[styles.viewButton, { backgroundColor: themeColors.buttonDefault }]}
        onPress={() =>
          router.push({
            pathname: '/(app)/customer_profile' as any,
            params: { customerId: item.id },
          })
        }>
        <Text
          style={[
            styles.viewButtonText,
            { color: themeColors.buttonDefaultText },
          ]}>
          View
        </Text>
      </Pressable>
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
          Agent Profile
        </Text>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => setIsProfileVisible(!isProfileVisible)}
          style={styles.headerIconButton}>
          <Ionicons
            name={isProfileVisible ? 'person' : 'person-outline'}
            size={26}
            color={themeColors.tint}
          />
        </Pressable>
      </View>

      {/* Show spinner only on initial load, not on refresh */}
      {loading && !isRefreshing ? (
        <ActivityIndicator
          size="large"
          style={{ flex: 1 }}
          color={themeColors.tint}
        />
      ) : agent ? (
        <ScrollView
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
        >
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
                <Text style={[styles.agentName, { color: themeColors.text }]}>
                  {agent.username}
                </Text>
                <Text
                  style={[
                    styles.agentEmail,
                    { color: themeColors.textSecondary },
                  ]}>
                  {agent.email}
                </Text>
              </View>

              <View
                style={[
                  styles.detailsContainer,
                  { backgroundColor: themeColors.card },
                ]}>
                <DetailRow
                  label="Mobile No"
                  value={agent.mobile_no}
                  themeColors={themeColors}
                />
                <DetailRow
                  label="Address"
                  value={agent.address}
                  themeColors={themeColors}
                />
                <DetailRow
                  label="Aadhar No"
                  value={agent.aadhar_card_no}
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
                    router.push({
                      pathname: '/(app)/edit_agent' as any,
                      params: { agentId: agent.id },
                    })
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
                  style={[styles.button, { backgroundColor: themeColors.danger }]}
                  onPress={handleDeleteAgent}>
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
                    Delete Agent
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          <View
            style={[
              styles.listContainer,
              // Add a top margin if the profile is hidden
              !isProfileVisible && { marginTop: 20 },
              { backgroundColor: themeColors.card },
            ]}>
            <Text
              style={[
                styles.listTitle,
                {
                  color: themeColors.text,
                  borderBottomColor: themeColors.borderColor,
                },
              ]}>
              Assigned Customers ({customers.length})
            </Text>
            <FlatList
              data={customers}
              renderItem={renderCustomerItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text
                  style={[
                    styles.emptyText,
                    { color: themeColors.textSecondary },
                  ]}>
                  No customers assigned.
                </Text>
              }
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      ) : (
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          Agent not found.
        </Text>
      )}
    </SafeAreaView>
  );
}

// (Global Styles are unchanged)
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
  agentName: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  agentEmail: { fontSize: 16, marginTop: 4 },
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
  emptyText: { textAlign: 'center', padding: 20, fontSize: 16 },
  listContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 30,
  },
  listTitle: { fontSize: 20, fontWeight: 'bold', padding: 15, borderBottomWidth: 1 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
  },
  customerName: { fontSize: 16, fontWeight: 'bold' },
  customerShop: { fontSize: 14 },
  viewButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  viewButtonText: { fontWeight: 'bold', fontSize: 14 },
});