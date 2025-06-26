// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
// Assuming getCurrentUser is a function that makes an API call to get the current user
// and api is your axios instance.
import { getCurrentUser, api } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Default to true on initial render

  // Function to update the user state locally
  const updateUser = (newUserData) => {
    setUser((prevUser) => {
      return { ...prevUser, ...newUserData };
    });
  };

  // Restore session from cookie on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await getCurrentUser(); // This call should hit your backend's /user/current-user endpoint
        if (res.data) { // Assuming res.data contains the user object directly
          setUser(res.data);
        } else {
          // If response is successful but data is null/empty, means no active user
          setUser(null);
        } 
      } catch (e) {
        
        setUser(null); // Explicitly set user to null on error
       
      } finally {
        setIsLoading(false); // Always set isLoading to false after attempt
      }
    }

    restoreSession();
  }, []); // Empty dependency array means this runs only once on mount

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/user/logout");
    
    } catch (e) {
     
      setUser(null);
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