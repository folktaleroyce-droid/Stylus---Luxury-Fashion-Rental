import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage on load to persist login across refreshes
    const storedAuth = localStorage.getItem('stylus_auth');
    const storedName = localStorage.getItem('stylus_user_name');
    
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      if (storedName) {
        setUser({ name: storedName });
      }
    }
  }, []);

  const login = (name?: string) => {
    localStorage.setItem('stylus_auth', 'true');
    if (name) {
      localStorage.setItem('stylus_user_name', name);
      setUser({ name });
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('stylus_auth');
    localStorage.removeItem('stylus_user_name');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};