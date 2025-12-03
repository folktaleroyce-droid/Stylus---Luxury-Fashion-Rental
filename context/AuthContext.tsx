import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (name?: string, admin?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage on load to persist login across refreshes
    const storedAuth = localStorage.getItem('stylus_auth');
    const storedName = localStorage.getItem('stylus_user_name');
    const storedIsAdmin = localStorage.getItem('stylus_is_admin');
    
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      if (storedName) {
        setUser({ name: storedName });
      }
      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  const login = (name?: string, admin: boolean = false) => {
    localStorage.setItem('stylus_auth', 'true');
    if (name) {
      localStorage.setItem('stylus_user_name', name);
      setUser({ name });
    }
    if (admin) {
      localStorage.setItem('stylus_is_admin', 'true');
      setIsAdmin(true);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('stylus_auth');
    localStorage.removeItem('stylus_user_name');
    localStorage.removeItem('stylus_is_admin');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};