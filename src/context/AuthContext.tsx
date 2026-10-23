import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/seedData';
import { dbEngine } from '../lib/database';
import { firebaseAuth } from '../lib/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'mpt_active_user_in_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to public or saved user
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn('Error reading active user:', err);
    }
    // Default initial user is Sunita Sharma (Registered Reporter)
    return INITIAL_USERS[3]; // Sunita Sharma
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  // Sync with live Firebase Auth if configured
  useEffect(() => {
    if (!firebaseAuth) return;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (fbUser) {
        // Map to user profile
        const allUsers = await dbEngine.getUsers();
        const matched = allUsers.find(u => u.uid === fbUser.uid || u.email === fbUser.email);
        if (matched) {
          setUser(matched);
        } else {
          // New registered user
          const newUser: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            role: 'reporter',
            createdAt: new Date().toISOString(),
          };
          setUser(newUser);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // Simulate authenticating against registered users
      const allUsers = await dbEngine.getUsers();
      const normalizedEmail = email.toLowerCase().trim();
      const found = allUsers.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!found) {
        setIsLoading(false);
        return { success: false, error: 'No account found with this email address.' };
      }

      if (pass.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      setUser(found);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Login failed.' };
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    setIsLoading(true);
    try {
      const allUsers = await dbEngine.getUsers();
      const normalizedEmail = email.toLowerCase().trim();
      if (allUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
        setIsLoading(false);
        return { success: false, error: 'An account with this email address already exists.' };
      }

      const newUser: UserProfile = {
        uid: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        displayName: name.trim(),
        email: normalizedEmail,
        phoneNumber: phone?.trim(),
        role: 'reporter', // Default role is reporter
        createdAt: new Date().toISOString(),
      };

      // Add to users database
      const usersList = [...allUsers, newUser];
      localStorage.setItem('mpt_db_users_v2', JSON.stringify(usersList));

      setUser(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    if (firebaseAuth) {
      try {
        await fbSignOut(firebaseAuth);
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const switchDemoRole = (role: UserRole) => {
    if (role === 'public') {
      setUser(null);
      return;
    }
    if (role === 'admin') {
      setUser(INITIAL_USERS[0]); // Chief Coord. Alok Verma
      return;
    }
    if (role === 'investigator') {
      setUser(INITIAL_USERS[1]); // Insp. Rajesh Kumar (CID)
      return;
    }
    if (role === 'reporter') {
      setUser(INITIAL_USERS[3]); // Sunita Sharma
      return;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    const allUsers = await dbEngine.getUsers();
    const idx = allUsers.findIndex(u => u.uid === user.uid);
    if (idx !== -1) {
      allUsers[idx] = updated;
      localStorage.setItem('mpt_db_users_in_v3', JSON.stringify(allUsers));
    }
  };

  const role: UserRole = user ? user.role : 'public';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
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
