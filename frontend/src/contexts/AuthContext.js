"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check localStorage for stored auth data (in a real app, verify with backend)
      const storedUser = localStorage.getItem("vaulture_user");
      const storedToken = localStorage.getItem("vaulture_token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid storage
      localStorage.removeItem("vaulture_user");
      localStorage.removeItem("vaulture_token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // TODO: Replace with actual API call
      console.log("Login attempt:", { email, password });

      // Simulate API response
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: email,
        role: email.includes("creator") ? "creator" : "buyer",
        avatar: null,
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store in localStorage (in production, use secure storage)
      localStorage.setItem("vaulture_user", JSON.stringify(mockUser));
      localStorage.setItem("vaulture_token", mockToken);

      setUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: "Invalid credentials" };
    }
  };

  const signup = async (formData) => {
    try {
      // TODO: Replace with actual API call
      console.log("Signup attempt:", formData);

      // Simulate API response
      const mockUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: null,
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store in localStorage (in production, use secure storage)
      localStorage.setItem("vaulture_user", JSON.stringify(mockUser));
      localStorage.setItem("vaulture_token", mockToken);

      setUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      console.error("Signup failed:", error);
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("vaulture_user");
    localStorage.removeItem("vaulture_token");
    setUser(null);

    // Redirect to home page
    window.location.href = "/";
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isCreator = () => {
    return user?.role === "creator";
  };

  const isBuyer = () => {
    return user?.role === "buyer";
  };

  const updateProfile = async (profileData) => {
    try {
      // TODO: Replace with actual API call
      console.log("Updating profile:", profileData);

      // Simulate API response
      const updatedUser = {
        ...user,
        ...profileData,
      };

      // Store in localStorage (in production, use secure storage)
      localStorage.setItem("vaulture_user", JSON.stringify(updatedUser));

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Profile update failed:", error);
      return { success: false, error: "Profile update failed" };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      // TODO: Replace with actual API call
      console.log("Changing password for user:", user.id);

      // Simulate API response
      return { success: true };
    } catch (error) {
      console.error("Password change failed:", error);
      return { success: false, error: "Password change failed" };
    }
  };

  const deleteAccount = async () => {
    try {
      // TODO: Replace with actual API call
      console.log("Deleting account for user:", user.id);

      // Remove from localStorage
      localStorage.removeItem("vaulture_user");
      localStorage.removeItem("vaulture_token");

      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Account deletion failed:", error);
      return { success: false, error: "Account deletion failed" };
    }
  };

  const upgradeToCreator = async () => {
    try {
      // Update user role to creator
      const upgradedUserData = {
        ...user,
        role: "creator",
      };

      // Update localStorage
      localStorage.setItem("vaulture_user", JSON.stringify(upgradedUserData));

      setUser(upgradedUserData);
      return { success: true, user: upgradedUserData };
    } catch (error) {
      console.error("Upgrade failed:", error);
      return { success: false, error: "Upgrade failed" };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    isCreator,
    isBuyer,
    updateProfile,
    changePassword,
    deleteAccount,
    upgradeToCreator,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
