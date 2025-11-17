import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../../components/CustomHeader';
import { Colors } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';

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

export default function ProfileScreen() {
  const { signOut, profile } = useAuth(); // Get the user's profile
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  if (!profile) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}>
        <CustomHeader title="Profile" />
        <ActivityIndicator
          size="large"
          style={{ marginTop: 50 }}
          color={themeColors.tint}
        />
      </SafeAreaView>
    );
  }

  const isAdmin = profile.role === 'admin';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      edges={['top', 'left', 'right']}>
      <CustomHeader title="Profile" />

      <View style={[styles.profileCard, { backgroundColor: themeColors.card }]}>
        <Ionicons
          name="person-circle"
          size={80}
          color={themeColors.icon}
        />
        <Text style={[styles.agentName, { color: themeColors.text }]}>
          {profile.username}
        </Text>
        <Text style={[styles.agentRole, { color: themeColors.tint }]}>
          {profile.role === 'admin' ? 'Administrator' : 'Agent'}
        </Text>
      </View>

      <View
        style={[styles.detailsContainer, { backgroundColor: themeColors.card }]}>
        <DetailRow
          label="Mobile No"
          value={profile.mobile_no}
          themeColors={themeColors}
        />
        <DetailRow
          label="Address"
          value={profile.address}
          themeColors={themeColors}
        />
        
        {/* --- THIS IS THE NEW LINE --- */}
        {/* It will show for both Admin and Agent */}
        <DetailRow
          label="Aadhar No"
          value={profile.aadhar_card_no}
          themeColors={themeColors}
        />
        {/* --- END OF NEW LINE --- */}

        <DetailRow
          label="Email"
          value={profile.email}
          themeColors={themeColors}
        />
      </View>

      <View style={styles.buttonContainer}>
        {/* Only show "Change Password" to Admins */}
        {/* {isAdmin && (
          <Pressable
            style={[
              styles.button,
              { backgroundColor: themeColors.buttonDefault },
            ]}
            onPress={() => router.push('/(app)/change_password' as any)}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={themeColors.buttonDefaultText}
            />
            <Text
              style={[
                styles.buttonText,
                { color: themeColors.buttonDefaultText },
              ]}>
              Change Password
            </Text>
          </Pressable>
        )} */}

        <Pressable
          style={[styles.button, { backgroundColor: themeColors.danger }]}
          onPress={handleSignOut}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={themeColors.buttonPrimaryText} />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={themeColors.buttonPrimaryText}
              />
              <Text
                style={[
                  styles.buttonText,
                  { color: themeColors.buttonPrimaryText },
                ]}>
                Sign Out
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// (Styles are unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    elevation: 3,
  },
  agentName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  agentRole: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
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
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});