"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authApi, profileApi, creatorApi, ApiError } from "@/lib/api";

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
      // Check localStorage for stored auth data
      const storedUser = localStorage.getItem("vaulture_user");
      const storedToken = localStorage.getItem("vaulture_token");

      if (storedUser && storedToken) {
        // Verify token is still valid by fetching current user profile
        try {
          const currentProfile = await profileApi.getMyProfile();
          setUser(currentProfile);
        } catch (error) {
          // Token is invalid, clear storage
          console.error("Token validation failed:", error);
          localStorage.removeItem("vaulture_user");
          localStorage.removeItem("vaulture_token");
        }
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
      const response = await authApi.login({ email, password });

      // Store token and user data
      localStorage.setItem("vaulture_token", response.access_token);
      localStorage.setItem("vaulture_user", JSON.stringify(response.user));

      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const signup = async (formData) => {
    try {
      const response = await authApi.register(formData);

      // Store token and user data
      localStorage.setItem("vaulture_token", response.access_token);
      localStorage.setItem("vaulture_user", JSON.stringify(response.user));

      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      console.error("Signup failed:", error);
      let errorMessage = "Registration failed";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await authApi.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    } finally {
      localStorage.removeItem("vaulture_user");
      localStorage.removeItem("vaulture_token");
      setUser(null);

      // Redirect to home page
      window.location.href = "/";
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isCreator = () => {
    return user?.is_creator === true;
  };

  const isBuyer = () => {
    return user?.is_creator === false;
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await profileApi.updateMyProfile(profileData);

      // Update local user state with new profile data
      setUser(updatedProfile);
      localStorage.setItem("vaulture_user", JSON.stringify(updatedProfile));

      return { success: true, user: updatedProfile };
    } catch (error) {
      console.error("Profile update failed:", error);
      let errorMessage = "Profile update failed";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await profileApi.changePassword(passwordData);
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      console.error("Password change failed:", error);
      let errorMessage = "Password change failed";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const deleteAccount = async () => {
    try {
      await profileApi.deleteAccount();

      // Clear local storage and user state
      localStorage.removeItem("vaulture_user");
      localStorage.removeItem("vaulture_token");
      setUser(null);

      return { success: true };
    } catch (error) {
      console.error("Account deletion failed:", error);
      let errorMessage = "Account deletion failed";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  };

  const upgradeToCreator = async () => {
    try {
      const response = await creatorApi.upgradeToCreator();

      // Fetch updated profile to get the new creator status
      const updatedProfile = await profileApi.getMyProfile();
      setUser(updatedProfile);
      localStorage.setItem("vaulture_user", JSON.stringify(updatedProfile));

      return { success: true, user: updatedProfile };
    } catch (error) {
      console.error("Creator upgrade failed:", error);
      let errorMessage = "Account upgrade failed";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
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
