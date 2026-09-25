import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService, AuthActionResult, GOVT_ADMIN_UID, DEFAULT_ADMIN_EMAIL } from '../services/firebase/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdminAuthority: boolean;
  adminUid: string;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen for authentication changes from Firebase Web SDK
    const unsubscribe = authService.subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<AuthActionResult> => {
    // Password is only passed to Firebase Web SDK and not stored in state or local storage
    const result = await authService.loginWithEmail(email, password);
    return result;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
  };

  const isAuthenticated = Boolean(user);
  const isAdminAuthority = authService.isGovernmentAdmin(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdminAuthority,
        adminUid: GOVT_ADMIN_UID,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
