import React, { createContext, useEffect, useState, useCallback } from "react";
import { secureStorage } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

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

  // ✅ Now accepts token + user directly from OTPScreen
  const login = useCallback(async (token, userData) => {
    try {
      await secureStorage.setItem("authToken", token);
      await secureStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
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