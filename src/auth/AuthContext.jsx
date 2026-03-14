import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, decodeToken, isTokenExpired } from '../services/api/authService';

const AuthContext = createContext(null);
const TOKEN_KEY = 'authToken';
const USER_KEY = 'nofoodwaste_user';

const normalizeRole = (role) => {
  if (!role) return 'driver';
  return String(role).toLowerCase();
};

const buildUserFromToken = (token, fallbackMobileNumber) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.sub || decoded.user_id || decoded.id || fallbackMobileNumber,
    name: decoded.name || decoded.full_name || decoded.username || '',
    phone: decoded.phone || decoded.mobile_number || fallbackMobileNumber || '',
    email: decoded.email || '',
    role: normalizeRole(decoded.role),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && !isTokenExpired(storedToken) && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setLoading(false);
  }, []);

  const login = async (mobileNumber, password) => {
    try {
      const response = await authService.login(mobileNumber, password);
      const accessToken = response?.access_token || response?.token;

      if (!accessToken) {
        throw new Error('Login response did not include an access token');
      }

      const userData = buildUserFromToken(accessToken, mobileNumber);
      if (!userData) {
        throw new Error('Unable to decode access token');
      }

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Invalid credentials';
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    const users = JSON.parse(localStorage.getItem('nofoodwaste_users') || '[]');
    const exists = users.find(u => u.phone === userData.phone);
    
    if (exists) {
      throw new Error('Phone number already registered');
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('nofoodwaste_users', JSON.stringify(users));
    
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    setUser(userWithoutPassword);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateProfile = (updates) => {
    if (!user?.id) return;
    const users = JSON.parse(localStorage.getItem('nofoodwaste_users') || '[]');
    const index = users.findIndex(u => u.id === user.id);
    if (index === -1) return;
    const updated = { ...users[index], ...updates };
    users[index] = updated;
    localStorage.setItem('nofoodwaste_users', JSON.stringify(users));
    const { password: _, ...forState } = updated;
    setUser(forState);
    localStorage.setItem(USER_KEY, JSON.stringify(forState));
  };

  const resetPassword = async (phone, newPassword) => {
    const users = JSON.parse(localStorage.getItem('nofoodwaste_users') || '[]');
    const userIndex = users.findIndex(u => u.phone === phone);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('nofoodwaste_users', JSON.stringify(users));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, resetPassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
