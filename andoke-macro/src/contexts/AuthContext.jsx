import React, { createContext, useContext, useState, useEffect } from "react";
import { parkStorageService } from "../services/parkStorageService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("isAdminAuth") === "true"
  );

  const [visitorSession, setVisitorSession] = useState(null);

  useEffect(() => {
    const session = parkStorageService.getSession();
    if (session) setVisitorSession(session);
  }, []);

  const login = (credentials) => {
    if (credentials.username === "admin" && credentials.password === "andoke2026") {
      setIsAuthenticated(true);
      localStorage.setItem("isAdminAuth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAdminAuth");
  };

  const updateVisitorSession = (sessionData) => {
    setVisitorSession(sessionData);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        visitorSession,
        updateVisitorSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);