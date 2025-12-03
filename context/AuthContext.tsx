import React, { createContext, useContext, useState, useEffect } from 'react';

// Extended User Interface for the entire app
export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tier: string;
  role: 'User' | 'Collaborator' | 'Admin';
  status: 'Active' | 'Suspended';
  suspensionReason?: string; // Added field
  joined: string;
  lastActive: string;
  avgSpend: string;
  rentalHistoryCount: number;
}

interface UserSession {
  name: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: UserSession | null;
  registeredUsers: RegisteredUser[]; // The list for Admin to see
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  registerUser: (name: string, email: string) => void;
  updateUserStatus: (id: string, newStatus: 'Active' | 'Suspended', reason?: string) => void; // Updated signature
  updateUserRole: (id: string, newRole: 'User' | 'Collaborator' | 'Admin') => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  registeredUsers: [],
  login: () => false,
  logout: () => {},
  registerUser: () => {},
  updateUserStatus: () => {},
  updateUserRole: () => {},
  deleteUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Initial Mock Data
const MOCK_USERS_DB: RegisteredUser[] = [
  { id: '1', name: 'Victoria Sterling', email: 'v.sterling@example.com', phone: '+1 (555) 010-9988', address: '125 Park Ave, NYC', tier: 'Diamond', role: 'User', status: 'Active', joined: 'Oct 2023', lastActive: '2 mins ago', avgSpend: '$450', rentalHistoryCount: 12 },
  { id: '2', name: 'James Bond', email: 'j.bond@example.com', phone: '+44 20 7946 0958', address: '85 Albert Embankment, London', tier: 'Platinum', role: 'Collaborator', status: 'Active', joined: 'Nov 2023', lastActive: '1 day ago', avgSpend: '$820', rentalHistoryCount: 5 },
  { id: '3', name: 'Sarah Connor', email: 's.connor@example.com', phone: '+1 (555) 019-2834', address: '1984 Cyberdyne Ln, LA', tier: 'Gold', role: 'User', status: 'Suspended', suspensionReason: 'Violation of rental agreement section 4.', joined: 'Dec 2023', lastActive: '3 months ago', avgSpend: '$150', rentalHistoryCount: 1 },
  { id: '4', name: 'Ellen Ripley', email: 'e.ripley@example.com', phone: '+1 (555) 011-3344', address: 'Nostromo Station', tier: 'Diamond', role: 'Admin', status: 'Active', joined: 'Jan 2024', lastActive: '5 hours ago', avgSpend: '$1,200', rentalHistoryCount: 8 },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  // Load data on mount
  useEffect(() => {
    // 1. Session Logic
    const storedAuth = localStorage.getItem('stylus_auth');
    const storedName = localStorage.getItem('stylus_user_name');
    const storedIsAdmin = localStorage.getItem('stylus_is_admin');
    
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      if (storedName) setUser({ name: storedName });
      if (storedIsAdmin === 'true') setIsAdmin(true);
    }

    // 2. User Database Logic
    const storedUsers = localStorage.getItem('stylus_users_db');
    if (storedUsers) {
      setRegisteredUsers(JSON.parse(storedUsers));
    } else {
      setRegisteredUsers(MOCK_USERS_DB);
    }
  }, []);

  // Save DB changes
  useEffect(() => {
    if (registeredUsers.length > 0) {
      localStorage.setItem('stylus_users_db', JSON.stringify(registeredUsers));
    }
  }, [registeredUsers]);

  const login = (emailOrName: string, password?: string) => {
    // 1. Master Admin Check (Hardcoded Backup)
    if (emailOrName === 'Stylus' && password === 'Sty!usAdm1n#29XQ') {
      localStorage.setItem('stylus_auth', 'true');
      localStorage.setItem('stylus_user_name', 'Stylus Admin');
      localStorage.setItem('stylus_is_admin', 'true');
      setIsAuthenticated(true);
      setIsAdmin(true);
      setUser({ name: 'Stylus Admin', role: 'Admin' });
      return true;
    }

    // 2. Database User Check
    const foundUser = registeredUsers.find(u => u.email === emailOrName || u.name === emailOrName);
    
    // For demo purposes, we allow login if user exists or if it's a generic login
    const nameToUse = foundUser ? foundUser.name : emailOrName;

    localStorage.setItem('stylus_auth', 'true');
    localStorage.setItem('stylus_user_name', nameToUse);
    setIsAuthenticated(true);

    // Check if the user in DB has Admin privileges
    if (foundUser && foundUser.role === 'Admin') {
      localStorage.setItem('stylus_is_admin', 'true');
      setIsAdmin(true);
      setUser({ name: nameToUse, role: 'Admin' });
    } else {
      localStorage.removeItem('stylus_is_admin');
      setIsAdmin(false);
      setUser({ name: nameToUse, role: foundUser?.role || 'User' });
    }

    return true;
  };

  const registerUser = (name: string, email: string) => {
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      name,
      email,
      phone: '',
      address: '',
      tier: 'Gold', // Default start tier
      role: 'User', // Default role
      status: 'Active',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      lastActive: 'Just now',
      avgSpend: '$0',
      rentalHistoryCount: 0
    };
    
    // Add to state (triggering the useEffect to save to local storage)
    setRegisteredUsers(prev => [...prev, newUser]);
  };

  const updateUserStatus = (id: string, newStatus: 'Active' | 'Suspended', reason?: string) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
           ...u, 
           status: newStatus,
           suspensionReason: newStatus === 'Suspended' ? reason : undefined
        };
      }
      return u;
    }));
  };

  const updateUserRole = (id: string, newRole: 'User' | 'Collaborator' | 'Admin') => {
    setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  }

  const deleteUser = (id: string) => {
    setRegisteredUsers(prev => prev.filter(u => u.id !== id));
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
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      user, 
      registeredUsers, 
      login, 
      logout, 
      registerUser,
      updateUserStatus,
      updateUserRole,
      deleteUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};