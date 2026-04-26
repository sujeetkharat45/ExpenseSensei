import React, { createContext, useEffect, useState, useCallback } from "react";
import { secureStorage } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null); // 🔥 Added user state

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await secureStorage.getItem("authToken");
      const savedUser = await secureStorage.getItem("user");
      
      if (token && savedUser) {
        setIsLoggedIn(true);
        setUser(JSON.parse(savedUser));
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inside AuthContext.js
const login = useCallback(async () => {
  const savedUser = await secureStorage.getItem("user");
  const token = await secureStorage.getItem("authToken");
  
  if (token && savedUser) {
    setUser(JSON.parse(savedUser));
    setIsLoggedIn(true); // 🔥 This triggers the AppNavigator to switch to Home
  }
}, []);

  const logout = useCallback(async () => {
    await secureStorage.removeItem("authToken");
    await secureStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}