import React, { createContext, useContext, useState } from 'react';

const STORAGE_KEY = 'sidebarOpen';

const getStored = () => {
  if (typeof window === 'undefined') return true;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
  } catch (_) {}
  return true;
};

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpenState] = useState(getStored);

  const setSidebarOpen = (value) => {
    setSidebarOpenState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (_) {}
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) return { isSidebarOpen: true, setSidebarOpen: () => {} };
  return ctx;
};
