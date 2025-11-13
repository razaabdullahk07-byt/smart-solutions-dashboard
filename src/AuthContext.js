import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [credentials, setCredentials] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track initial load

  const login = (creds) => {
    try {
      setCredentials(creds);
      localStorage.setItem("authCredentials", JSON.stringify(creds));
    } catch (error) {
      console.error("Failed to save credentials:", error);
      throw new Error("Failed to save login credentials");
    }
  };

  const logout = () => {
    setCredentials(null);
    localStorage.removeItem("authCredentials");
    // Clear any other auth-related data
  };

  // Initialize from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedCreds = localStorage.getItem("authCredentials");
        if (storedCreds) {
          const parsedCreds = JSON.parse(storedCreds);
          
          // Add any validation checks here (e.g., token expiration)
          // if (isTokenExpired(parsedCreds.token)) {
          //   logout();
          //   return;
          // }
          
          setCredentials(parsedCreds);
        }
      } catch (e) {
        console.error("Failed to initialize auth:", e);
        logout(); // Clear invalid credentials
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Optional: Add auto-logout on token expiration
  // useEffect(() => {
  //   if (!credentials?.expiresAt) return;
  //   
  //   const timeout = setTimeout(() => {
  //     logout();
  //   }, new Date(credentials.expiresAt) - Date.now());
  //   
  //   return () => clearTimeout(timeout);
  // }, [credentials]);

  return (
    <AuthContext.Provider value={{ 
      credentials, 
      login, 
      logout,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function example
// function isTokenExpired(token) {
//   // Implement token expiration check
//   return false;
// }