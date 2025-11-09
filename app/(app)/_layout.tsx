import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Required for drawer
import { useAuth } from '../../context/AuthContext'; // Import our auth hook

// This is our custom component for the drawer content
function CustomDrawerContent(props: any) {
  const { profile, signOut } = useAuth(); // Get profile and sign-out function
  const router = useRouter();

  const onLogout = () => {
    // Close the drawer first
    props.navigation.closeDrawer();
    // Then call the sign-out function
    signOut();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 1. The Profile Header */}
      <View style={styles.headerContainer}>
        {/* You can replace this with an Image component if you have profile pics */}
        <View style={styles.avatar}>
          {/* We'll just show the first letter of the username */}
          <Text style={styles.avatarText}>
            {profile?.username ? profile.username[0].toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.username}>
          {profile?.username ? profile.username : 'User'}
        </Text>
      </View>

      {/* 2. The Navigation Links (e.g., Home, History) */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* 3. The Footer Buttons (Change Password, Exit) */}
      <View style={styles.footerContainer}>
        <Pressable
          style={styles.footerButton}
          onPress={() => router.push('/modal')} // We'll link to 'modal' for now
        >
          <Ionicons name="lock-closed-outline" size={20} color="#333" />
          <Text style={styles.footerButtonText}>Change Password</Text>
        </Pressable>

        <Pressable style={styles.footerButton} onPress={onLogout}>
          <Ionicons name="exit-outline" size={20} color="#333" />
          <Text style={styles.footerButtonText}>Exit</Text>
        </Pressable>
      </View>
    </View>
  );
}

// This is the main Drawer Layout
export default function AppLayout() {
  return (
    // GestureHandlerRootView is required for the drawer to work on Android
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // Pass our custom component to the drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        {/* This screen points to our (tabs) folder */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            headerShown: false, // Hide the header, tabs will have their own
            title: 'Home', // This is the label in the drawer
          }}
        />
        {/* You could add other top-level drawer screens here */}
      </Drawer>
    </GestureHandlerRootView>
  );
}

// Styles for the custom drawer
const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f6f6f6', // Light grey background
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    // Mimicking your design's header
    // You could add a background Image here
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#78D1E8', // Light blue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    color: '#3A4A64', // Dark blue
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  footerButtonText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});