"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/Loading";

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole = null,
  redirectTo = "/auth/login",
}) {
  const { user, loading, isAuthenticated, isCreator, isBuyer } = useAuth();

  useEffect(() => {
    if (!loading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated()) {
        window.location.href = redirectTo;
        return;
      }

      // If specific role is required
      if (requiredRole && user) {
        if (requiredRole === "creator" && !isCreator()) {
          window.location.href = "/auth/upgrade";
          return;
        }
        if (requiredRole === "buyer" && !isBuyer()) {
          window.location.href = "/dashboard";
          return;
        }
      }
    }
  }, [
    user,
    loading,
    requireAuth,
    requiredRole,
    redirectTo,
    isAuthenticated,
    isCreator,
    isBuyer,
  ]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  // If auth is required but user is not authenticated, show nothing (redirect will happen)
  if (requireAuth && !isAuthenticated()) {
    return null;
  }

  // If specific role is required but user doesn't have it, show nothing (redirect will happen)
  if (requiredRole && user) {
    if (requiredRole === "creator" && !isCreator()) {
      return null;
    }
    if (requiredRole === "buyer" && !isBuyer()) {
      return null;
    }
  }

  return children;
}

export function AuthRedirect({ children, redirectTo = "/dashboard" }) {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      window.location.href = redirectTo;
    }
  }, [user, loading, isAuthenticated, redirectTo]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  // If user is authenticated, show nothing (redirect will happen)
  if (isAuthenticated()) {
    return null;
  }

  return children;
}
