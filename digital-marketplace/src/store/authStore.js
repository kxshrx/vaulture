import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { apiClient } from "@/lib/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,

      login: (userData, token) => {
        Cookies.set("access_token", token, { expires: 7 });
        set({ user: userData, isLoggedIn: true });
      },

      logout: () => {
        Cookies.remove("access_token");
        set({ user: null, isLoggedIn: false });
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      },

      setUser: (userData) => {
        set({ user: userData, isLoggedIn: true });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      isCreator: () => {
        const { user } = get();
        return user?.is_creator || false;
      },

      upgradeToCreator: async (profileData) => {
        try {
          const response = await apiClient.post(
            "/auth/upgrade-to-creator",
            profileData
          );
          set({ user: response.data });
          return response.data;
        } catch (error) {
          throw error;
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        const token = Cookies.get("access_token");

        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const response = await apiClient.get("/auth/me");
          set({ user: response.data, isLoggedIn: true });
        } catch (error) {
          Cookies.remove("access_token");
          set({ user: null, isLoggedIn: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
