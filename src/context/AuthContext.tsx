import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isDemo: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user on mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setToken(storedToken);
          setIsDemo(profile.email === 'elena@focusflow.ai');
        } catch {
          // Token invalid or expired, log in as demo user automatically so first load is immediately functional
          try {
            const demoRes = await api.loginDemo();
            setStoredToken(demoRes.token);
            setToken(demoRes.token);
            setUser(demoRes.user);
            setIsDemo(true);
          } catch {
            removeStoredToken();
            setToken(null);
            setUser(null);
          }
        }
      } else {
        // Automatically start with rich demo user session for instant seamless product exploration
        try {
          const demoRes = await api.loginDemo();
          setStoredToken(demoRes.token);
          setToken(demoRes.token);
          setUser(demoRes.user);
          setIsDemo(true);
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setIsDemo(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(name, email, password);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setIsDemo(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.loginDemo();
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      setIsDemo(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setIsDemo(false);
  };

  const updatePreferences = async (prefs: Partial<User['preferences']>) => {
    if (!user) return;
    try {
      const res = await api.updatePreferences(prefs);
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...res.preferences,
        },
      });
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isDemo,
        isLoading,
        login,
        register,
        loginDemo,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
