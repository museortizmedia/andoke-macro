import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAdminAuth') === 'true'
  );

  const login = (credentials) => {
    // Ejemplo de validación básica (reemplazar por llamadas a API/Intranet)
    if (credentials.username === 'admin' && credentials.password === 'andoke2026') {
      setIsAuthenticated(true);
      localStorage.setItem('isAdminAuth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);