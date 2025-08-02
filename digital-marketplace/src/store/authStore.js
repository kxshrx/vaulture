import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,

  login: (userData, token) => {
    Cookies.set('access_token', token, { expires: 7 });
    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    Cookies.remove('access_token');
    set({ user: null, isLoggedIn: false });
  },

  setUser: (userData) => {
    set({ user: userData, isLoggedIn: true });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
