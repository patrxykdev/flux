import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    email_verified: boolean;
    email_verification_sent_at: string | null;
    tier: string;
    strategy_limit: number;
    daily_backtest_limit: number;
  };
  email_verified: boolean;
  tier: string;
  strategy_limit: number;
  daily_backtest_limit: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });
  
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  });

  const isAuthenticated = !!token;

  const login = (newToken: string, userData?: User) => {
    console.log('AuthContext: login called with token:', newToken ? 'YES' : 'NO');
    console.log('AuthContext: login called with userData:', userData ? 'YES' : 'NO');
    
    localStorage.setItem('accessToken', newToken);
    setToken(newToken);
    
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    }
    
    console.log('AuthContext: After login, token state:', !!newToken);
    console.log('AuthContext: After login, user state:', !!userData);
    console.log('AuthContext: isAuthenticated will be:', !!newToken);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  // Listen for storage changes (in case tokens are cleared from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        setToken(e.newValue);
      }
      if (e.key === 'userData') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    token,
    user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
