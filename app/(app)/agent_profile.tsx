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
  useColorScheme, // <-- Import for theme
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme'; // <-- Import your new theme
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

export default function AgentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { agentId } = useLocalSearchParams<{ agentId: string }>();

  // --- NEW: Get theme and colors ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  // ---

  // (State is unchanged)
  const [agent, setAgent] = useState<Agent | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProfileVisible, setIsProfileVisible] = useState(true); // Show profile by default

  // (All data functions are unchanged)
  const fetchData = async () => {
    if (!agentId) return;
    setLoading(true);
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
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [agentId])
  );

  const handleDeleteAgent = () => {
    Alert.alert(
      'Delete Agent',
      `Are you sure you want to delete ${agent?.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteProfile },
      ]
    );
  };

  // (Using your simple deleteProfile function)
  const deleteProfile = async () => {
    if (!agent) return;
    const { error } = await supabase.from('profiles').delete().eq('id', agent.id);
    if (error) {
      Alert.alert('Error', 'Failed to delete agent profile.');
    } else {
      Alert.alert('Success', 'Agent profile deleted.');
      router.back();
    }
  };

  // (renderCustomerItem is unchanged)
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
            pathname: '/customer_profile',
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

      {loading ? (
        <ActivityIndicator
          size="large"
          style={{ flex: 1 }}
          color={themeColors.tint}
        />
      ) : agent ? (
        <ScrollView>
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
                    { backgroundColor: themeColors.buttonPrimary }, // Dynamic
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/edit_agent',
                      params: { agentId: agent.id },
                    })
                  }>
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={themeColors.buttonPrimaryText} // Dynamic
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      { color: themeColors.buttonPrimaryText }, // Dynamic
                    ]}>
                    Edit Details
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.button, { backgroundColor: themeColors.danger }]} // Dynamic
                  onPress={handleDeleteAgent}>
                  <Ionicons
                    name="trash"
                    size={20}
                    color={themeColors.buttonPrimaryText} // Dynamic
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      { color: themeColors.buttonPrimaryText }, // Dynamic
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

// --- NEW: Global styles ---
// We move styles outside the component. Dynamic colors are applied inline.
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