// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, api } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to update the user state locally
  // This is crucial for reflecting avatar/cover image updates immediately
  const updateUser = (newUserData) => {
    setUser((prevUser) => {
      // Ensure prevUser exists before spreading
      return { ...prevUser, ...newUserData };
    });
  };

  // Restore session from cookie on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await getCurrentUser(); // Changed from get to getCurrentUser directly
        setUser(res.data);
      } catch (e) {
        console.error("Failed to fetch current user during session restore:", e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/user/logout");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setUser(null);
      window.location.href = "/login"; // Full refresh to clear all client-side state/cookies
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}