import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const login = (userData, creds) => {
    setUser(userData);
    setCredentials(creds);
  };

  const logout = () => {
    setUser(null);
    setCredentials({ username: "", password: "" });
  };

  return (
    <AuthContext.Provider value={{ user, credentials, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
