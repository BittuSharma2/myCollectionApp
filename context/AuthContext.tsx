import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Import from our lib file

// Define the shape of our context data
type AuthData = {
  session: Session | null;
  profile: any | null; // We'll store the user's profile (e.g., role)
  loading: boolean;
  signOut: () => void;
};

// Create the context with a default value
const AuthContext = createContext<AuthData>({
  session: null,
  profile: null,
  loading: true,
  signOut: () => {},
});

// Create a provider component. This is the "gatekeeper".
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get the initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        // If session exists, fetch user profile (with their role)
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    };

    getInitialSession();

    // 2. Listen for auth state changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          // If user logs in, fetch their profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data);
        } else {
          // If user logs out, clear profile
          setProfile(null);
        }
        // Small delay to ensure session is fully set before ending loading
        if (loading) setLoading(false);
      }
    );

    // Cleanup the listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const value = {
    session,
    profile,
    loading,
    signOut,
  };

  // Provide the auth state to all children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to easily use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};