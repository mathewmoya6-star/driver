import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';
import type { Profile, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await authService.getProfile(session.user.id);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const checkUser = async () => {
    try {
      const { data: { session } } = await authService.getCurrentSession();
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        setUser(profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    const profile = await authService.signIn(email, password);
    setUser(profile);
  };
  
  const signUp = async (email: string, password: string, fullName: string) => {
    const profile = await authService.signUp(email, password, fullName);
    setUser(profile);
  };
  
  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };
  
  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };
  
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    const updated = await authService.updateProfile(user.id, updates);
    setUser(updated);
  };
  
  if (!initialized) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
