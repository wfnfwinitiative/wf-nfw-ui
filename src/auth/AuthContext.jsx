import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('nofoodwaste_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const users = JSON.parse(localStorage.getItem('nofoodwaste_users') || '[]');
    const foundUser = users.find(u => u.phone === phone && u.password === password);
    
    if (foundUser) {
      const userData = { ...foundUser };
      delete userData.password;
      setUser(userData);
      localStorage.setItem('nofoodwaste_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error('Invalid credentials');
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
    localStorage.setItem('nofoodwaste_user', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nofoodwaste_user');
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
    localStorage.setItem('nofoodwaste_user', JSON.stringify(forState));
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
