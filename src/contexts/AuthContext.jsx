import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// these will be move to a separate file in production and will be replaced with real API calls
// User roles enum
export const ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  DRIVER: 'driver',
};

// Mock users for demo
const MOCK_USERS = [
  { id: 1, email: 'admin@nofoodwaste.org', password: 'admin123', name: 'Admin User', role: ROLES.ADMIN },
  { id: 2, email: 'coordinator@nofoodwaste.org', password: 'coord123', name: 'Sarah Coordinator', role: ROLES.COORDINATOR },
  { id: 3, email: 'driver@nofoodwaste.org', password: 'driver123', name: 'John Driver', role: ROLES.DRIVER },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('nofoodwaste_user');
    if (storedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('Login attempt with:', { email, password });
    // Simulate API call for testing added it. In production, replace with real API call.
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userDetails } = foundUser;
      setUser(userDetails);
      localStorage.setItem('nofoodwaste_user', JSON.stringify(userDetails));
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nofoodwaste_user');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin: user?.role === ROLES.ADMIN,
    isCoordinator: user?.role === ROLES.COORDINATOR,
    isDriver: user?.role === ROLES.DRIVER,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}




// will replace at at diff file.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
