"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireCreator = false,
}) {
  const { user, isLoggedIn, isLoading, initializeAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isLoggedIn) {
        router.push("/auth/login");
        return;
      }

      if (requireCreator && !user?.is_creator) {
        router.push("/auth/upgrade");
        return;
      }
    }
  }, [isLoggedIn, user, isLoading, requireAuth, requireCreator, router]);

  if (isLoading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (requireAuth && !isLoggedIn) return null;
  if (requireCreator && !user?.is_creator) return null;

  return children;
}
