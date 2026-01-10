import React, { useState, useContext, createContext, useEffect } from "react";

// Create the context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load token from localStorage when app starts
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      // Optionally decode token to get user info
      try {
        const payload = JSON.parse(atob(savedToken.split(".")[1]));
        setUser({
          id: payload.id,
          email: payload.email,
          role: payload.role,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      // Adjust this based on backend returns
      const userToken = data.token || data.access_token;
      const userData = data.user || data;

      setToken(userToken);
      setUser(userData);
      localStorage.setItem("token", userToken);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  // Function to make authenticated requests
  const authenticatedFetch = async (url, options = {}) => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers, // Allow overriding headers from the component
    };
    
    // LOGIC: If the body is NOT FormData,default to JSON.
    // If it IS FormData,leave Content-Type undefined (Browser handles it).
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const fullUrl = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: headers,
    });


    // If token is invalid, logout user
    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }

    return response;
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    authenticatedFetch,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
