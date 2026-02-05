import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'farmer' | 'expert' | 'admin';
  language: 'en' | 'hi' | 'mr' | 'kn';
  location: string | null;
  primary_crop: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: {
    full_name: string;
    role: 'farmer' | 'expert';
    language: 'en' | 'hi' | 'mr' | 'kn';
    location?: string;
    primary_crop?: string;
  }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    // Mock profile for admin
    if (userId === 'admin-123') {
      setProfile({
        id: 'admin-profile-id',
        user_id: 'admin-123',
        full_name: 'Administrator',
        role: 'admin',
        language: 'en',
        location: 'HQ',
        primary_crop: null,
        latitude: null,
        longitude: null
      });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const setAuthState = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user) {
        // Defer any additional backend calls to avoid auth deadlocks
        setTimeout(() => {
          if (mounted) fetchProfile(nextSession.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    };

    // Listen for auth changes FIRST (must be sync; no backend calls inside)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setAuthState(nextSession);
    });

    // THEN get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        setAuthState(initialSession);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata: {
      full_name: string;
      role: 'farmer' | 'expert';
      language: 'en' | 'hi' | 'mr';
      location?: string;
      primary_crop?: string;
    }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (email === 'admin' && password === 'admin123') {
      const mockUser = {
        id: 'admin-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'admin@kisanmitra.com',
        confirmed_at: new Date().toISOString(),
        app_metadata: { provider: 'email' },
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;

      setUser(mockUser);
      // Simulate session for generic checks
      setSession({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      });
      await fetchProfile(mockUser.id);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (user?.id === 'admin-123') {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};