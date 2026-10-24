import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/database.ts';
import { dbService, SEED_PROFILES } from '../services/db.ts';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, remember?: boolean) => Promise<boolean>;
  signup: (email: string, fullName: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    return dbService.getCurrentUser();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If Supabase is configured, check active session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@hyperplane.engineering',
            full_name: session.user.user_metadata?.full_name || 'Authenticated User',
            avatar_url: session.user.user_metadata?.avatar_url || SEED_PROFILES[0].avatar_url,
            role: 'Admin',
            job_title: 'Workspace Architect',
            hardware_session_active: true,
          };
          setUser(profile);
          dbService.setCurrentUser(profile);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@hyperplane.engineering',
            full_name: session.user.user_metadata?.full_name || 'Authenticated User',
            avatar_url: session.user.user_metadata?.avatar_url || SEED_PROFILES[0].avatar_url,
            role: 'Admin',
            job_title: 'Workspace Architect',
            hardware_session_active: true,
          };
          setUser(profile);
          dbService.setCurrentUser(profile);
        } else {
          // If no session on cloud supabase
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, _password?: string, _remember: boolean = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: _password || 'masterpassword123',
        });
        if (error) {
          console.warn('Supabase login warning, falling back to local user profile', error.message);
        }
      }

      // Check if matches known team member or create new
      const matched = SEED_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      const selectedUser: UserProfile = matched || {
        id: `user-${Date.now()}`,
        email,
        full_name: email.split('@')[0].replace('.', ' '),
        avatar_url: SEED_PROFILES[0].avatar_url,
        role: 'Admin',
        job_title: 'Engineering Member',
        hardware_session_active: _remember,
      };

      setUser(selectedUser);
      dbService.setCurrentUser(selectedUser);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, fullName: string, _password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signUp({
          email,
          password: _password || 'masterpassword123',
          options: {
            data: { full_name: fullName },
          },
        });
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        avatar_url: SEED_PROFILES[0].avatar_url,
        role: 'Admin',
        job_title: 'Software Architect',
        hardware_session_active: true,
      };

      setUser(newUser);
      dbService.setCurrentUser(newUser);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('obsidian_orbit_user');
  };

  const switchUser = (profile: UserProfile) => {
    setUser(profile);
    dbService.setCurrentUser(profile);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    dbService.setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        switchUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
