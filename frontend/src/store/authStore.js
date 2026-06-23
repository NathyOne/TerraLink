import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "../api/client";

export const roleHome = (role) => {
  if (role === "admin") return "/admin";
  if (role === "machine_owner") return "/machine";
  return "/construction";
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      user: null,
      loadingUser: false,
      setSession: ({ access, refresh, user }) => set({ access, refresh, user }),
      login: async ({ username, password }) => {
        const tokenResponse = await api.post("/auth/token/", { username, password });
        const user = tokenResponse.data.user;
        set({ access: tokenResponse.data.access, refresh: tokenResponse.data.refresh, user });
        return user;
      },
      register: async (payload) => {
        await api.post("/auth/register/", payload);
        return get().login({ username: payload.username, password: payload.password });
      },
      loadMe: async () => {
        if (!get().access) return null;
        set({ loadingUser: true });
        try {
          const response = await api.get("/auth/me/");
          set({ user: response.data, loadingUser: false });
          return response.data;
        } catch (error) {
          set({ access: null, refresh: null, user: null, loadingUser: false });
          throw error;
        }
      },
      logout: () => set({ access: null, refresh: null, user: null }),
    }),
    {
      name: "terralink-auth",
      partialize: (state) => ({
        access: state.access,
        refresh: state.refresh,
        user: state.user,
      }),
    },
  ),
);
