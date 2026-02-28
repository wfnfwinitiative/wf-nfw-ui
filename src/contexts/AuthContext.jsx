import { createContext, useContext, useState, useEffect } from 'react';
import { authService, decodeToken, isTokenExpired } from '../services/api/authService';

const AuthContext = createContext(null);

// User roles enum - must match backend role names
export const ROLES = {
  ADMIN: 'ADMIN',
  COORDINATOR: 'COORDINATOR',
  DRIVER: 'DRIVER',
};

// Storage keys
const TOKEN_KEY = 'authToken';
const USER_KEY = 'nofoodwaste_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user session
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    
    if (storedToken && storedUser) {
      // Validate token is not expired
      if (!isTokenExpired(storedToken)) {
        setUser(JSON.parse(storedUser));
      } else {
        // Token expired, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (mobileNumber, password) => {
    try {
      // Call the real API
      const response = await authService.login(mobileNumber, password);
      const { access_token } = response;
      
      // Decode token to get user info
      const decoded = decodeToken(access_token);
      if (!decoded) {
        return { success: false, error: 'Invalid token received' };
      }

      // Build user object from token
      console.log('Full decoded token:', decoded);
      const roleValue = decoded.role;
      const normalizedRole = typeof roleValue === 'string' ? roleValue.toUpperCase() : String(roleValue).toUpperCase();
      
      const userDetails = {
        id: parseInt(decoded.sub, 10),
        role: normalizedRole,  // Convert to UPPERCASE to match ROLES enum
        mobileNumber: mobileNumber,
      };

      console.log('Login - decoded role:', roleValue, '-> stored role:', normalizedRole);

      // Store token and user
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(userDetails));
      setUser(userDetails);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Invalid credentials';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  // Get the current auth token
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    getToken,
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
