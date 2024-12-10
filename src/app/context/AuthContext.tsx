// src/app/context/AuthContext.tsx
"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

// Define the context and types
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage for the authentication status on initial load
  useEffect(() => {
    const storedAuthStatus = localStorage.getItem('isAuthenticated');
    if (storedAuthStatus) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {

    
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true'); // Persist authentication state
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); // Remove from localStorage
    localStorage.removeItem("user_id");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
