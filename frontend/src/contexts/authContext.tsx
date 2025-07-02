import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/jwt';

interface AuthContextType {
  token: string | null;
  user: JwtPayload['data'] | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  // NEW for admin
  adminToken: string | null;
  admin: JwtPayload['data'] | null;
  isAdminAuthenticated: boolean;
  adminLogin: (token: string) => void;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<JwtPayload['data'] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // NEW

  // NEW admin states
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<JwtPayload['data'] | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && isTokenValid(storedToken)) {
      const decoded = jwtDecode<JwtPayload>(storedToken);
      setToken(storedToken);
      setUser(decoded.data);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }

    // Admin token logic
    const storedAdminToken = localStorage.getItem('admin');
    if (storedAdminToken && isTokenValid(storedAdminToken)) {
      const decoded = jwtDecode<JwtPayload>(storedAdminToken);
      setAdminToken(storedAdminToken);
      setAdmin(decoded.data);
      setIsAdminAuthenticated(true);
    } else {
      localStorage.removeItem('admin');
      setAdminToken(null);
      setAdmin(null);
      setIsAdminAuthenticated(false);
    }
    setLoading(false); // auth check finished
  }, []);

  const login = (newToken: string) => {
    if (isTokenValid(newToken)) {
      const decoded = jwtDecode<JwtPayload>(newToken);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decoded.data);
      setIsAuthenticated(true);
    } else {
      logout();
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // NEW admin login/logout
  const adminLogin = (newToken: string) => {
    if (isTokenValid(newToken)) {
      const decoded = jwtDecode<JwtPayload>(newToken);
      localStorage.setItem('admin', newToken);
      setAdminToken(newToken);
      setAdmin(decoded.data);
      setIsAdminAuthenticated(true);
    } else {
      adminLogout();
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('admin');
    setAdminToken(null);
    setAdmin(null);
    setIsAdminAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        // NEW admin values
        adminToken,
        admin,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
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

function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
